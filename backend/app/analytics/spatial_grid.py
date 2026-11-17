"""
CrowdEco Spatial Grid & Zone Analytics:
Maps 2D coordinate space to logical zones, computes real-time occupancies,
inflow/outflow transfer dynamics, and spatial density.
"""
import time
from typing import Dict, List, Optional, Tuple, Any
from app.config import ZONE_CONFIGS, ZoneConfig
from app.analytics.pedestrian_tracker import PedestrianState

class ZoneMetrics:
    def __init__(self, zone_config: ZoneConfig):
        self.config = zone_config
        self.headcount: int = 0
        self.inflow_count_window: int = 0
        self.outflow_count_window: int = 0
        self.inflow_rate_per_min: float = 0.0
        self.outflow_rate_per_min: float = 0.0
        self.history_headcount: List[Tuple[float, int]] = []  # (timestamp, count)
        self.history_window_sec: float = 60.0
        self.last_rate_calc_time = time.time()
        self.pedestrians_inside: set[int] = set()

    def update_occupancy(self, current_ped_ids: set[int]):
        now = time.time()
        
        # Detect entries (inflow) and exits (outflow)
        new_entries = current_ped_ids - self.pedestrians_inside
        new_exits = self.pedestrians_inside - current_ped_ids

        self.inflow_count_window += len(new_entries)
        self.outflow_count_window += len(new_exits)
        self.pedestrians_inside = current_ped_ids
        self.headcount = len(current_ped_ids)

        # Record history point
        self.history_headcount.append((now, self.headcount))
        # Trim history
        cutoff = now - self.history_window_sec
        self.history_headcount = [
            (t, c) for t, c in self.history_headcount if t >= cutoff
        ]

        # Calculate rate per minute every 1.0 seconds
        dt = now - self.last_rate_calc_time
        if dt >= 1.0:
            # Scale window counts to per minute rate with EMA smoothing
            raw_inflow_rate = (self.inflow_count_window / dt) * 60.0
            raw_outflow_rate = (self.outflow_count_window / dt) * 60.0

            alpha = 0.35
            self.inflow_rate_per_min = round(
                alpha * raw_inflow_rate + (1 - alpha) * self.inflow_rate_per_min, 1
            )
            self.outflow_rate_per_min = round(
                alpha * raw_outflow_rate + (1 - alpha) * self.outflow_rate_per_min, 1
            )

            # Reset window
            self.inflow_count_window = 0
            self.outflow_count_window = 0
            self.last_rate_calc_time = now

    @property
    def occupancy_ratio(self) -> float:
        if self.config.max_capacity == 0:
            return 0.0
        return min(1.0, self.headcount / self.config.max_capacity)

    @property
    def occupancy_percentage(self) -> float:
        return round(self.occupancy_ratio * 100.0, 1)

    @property
    def net_flow_rate_per_sec(self) -> float:
        """Net flow in pedestrians per second (Inflow - Outflow)."""
        return (self.inflow_rate_per_min - self.outflow_rate_per_min) / 60.0

class SpatialGrid:
    def __init__(self):
        self.zones: Dict[str, ZoneMetrics] = {
            zid: ZoneMetrics(zcfg) for zid, zcfg in ZONE_CONFIGS.items()
        }

    def get_zone_for_point(self, x: float, y: float) -> Optional[str]:
        for zid, zone in self.zones.items():
            b = zone.config.bounds
            if b["min_x"] <= x <= b["max_x"] and b["min_y"] <= y <= b["max_y"]:
                return zid
        return None

    def update_from_pedestrians(self, pedestrians: List[PedestrianState]):
        zone_memberships: Dict[str, set[int]] = {zid: set() for zid in self.zones}
        
        for ped in pedestrians:
            zid = self.get_zone_for_point(ped.x, ped.y)
            if zid:
                ped.zone_id = zid
                zone_memberships[zid].add(ped.id)
            else:
                ped.zone_id = None

        for zid, zone_metric in self.zones.items():
            zone_metric.update_occupancy(zone_memberships[zid])

    def get_zone_metric(self, zone_id: str) -> Optional[ZoneMetrics]:
        return self.zones.get(zone_id)

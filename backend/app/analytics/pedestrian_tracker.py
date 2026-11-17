"""
CrowdEco Pedestrian Tracker:
Maintains state for detected individuals, computes velocity vectors,
motion trajectories, and kinematic properties.
"""
import math
import time
from typing import Dict, List, Optional, Tuple
from pydantic import BaseModel, Field

class PedestrianState(BaseModel):
    id: int
    x: float
    y: float
    vx: float = 0.0
    vy: float = 0.0
    speed: float = 0.0
    heading_deg: float = 0.0
    zone_id: Optional[str] = None
    target_zone_id: Optional[str] = None
    trail: List[Tuple[float, float]] = Field(default_factory=list)
    dwell_time_sec: float = 0.0
    last_update_ts: float = 0.0
    color: str = "#60A5FA"

class PedestrianTracker:
    def __init__(self, max_trail_len: int = 8, smoothing_alpha: float = 0.65):
        self.pedestrians: Dict[int, PedestrianState] = {}
        self.max_trail_len = max_trail_len
        self.smoothing_alpha = smoothing_alpha
        self.last_timestamp = time.time()

    def update_pedestrian(
        self,
        ped_id: int,
        x: float,
        y: float,
        zone_id: Optional[str] = None,
        target_zone_id: Optional[str] = None,
        color: Optional[str] = None
    ) -> PedestrianState:
        now = time.time()
        
        if ped_id not in self.pedestrians:
            # New pedestrian entry
            state = PedestrianState(
                id=ped_id,
                x=x,
                y=y,
                vx=0.0,
                vy=0.0,
                speed=0.0,
                heading_deg=0.0,
                zone_id=zone_id,
                target_zone_id=target_zone_id,
                trail=[(round(x, 1), round(y, 1))],
                dwell_time_sec=0.0,
                last_update_ts=now,
                color=color or "#60A5FA"
            )
            self.pedestrians[ped_id] = state
            return state

        prev = self.pedestrians[ped_id]
        dt = max(0.01, now - prev.last_update_ts)
        
        # Calculate raw velocity vector v = (dx/dt, dy/dt)
        dx = x - prev.x
        dy = y - prev.y
        inst_vx = dx / dt
        inst_vy = dy / dt

        # Smooth velocity using exponential moving average
        smoothed_vx = self.smoothing_alpha * inst_vx + (1.0 - self.smoothing_alpha) * prev.vx
        smoothed_vy = self.smoothing_alpha * inst_vy + (1.0 - self.smoothing_alpha) * prev.vy
        speed = math.sqrt(smoothed_vx * smoothed_vx + smoothed_vy * smoothed_vy)
        
        # Heading angle in degrees [0, 360)
        heading_rad = math.atan2(smoothed_vy, smoothed_vx)
        heading_deg = (math.degrees(heading_rad) + 360.0) % 360.0

        # Update trail
        trail = prev.trail
        if len(trail) >= self.max_trail_len:
            trail.pop(0)
        trail.append((round(x, 1), round(y, 1)))

        prev.x = x
        prev.y = y
        prev.vx = round(smoothed_vx, 2)
        prev.vy = round(smoothed_vy, 2)
        prev.speed = round(speed, 2)
        prev.heading_deg = round(heading_deg, 1)
        prev.zone_id = zone_id or prev.zone_id
        prev.target_zone_id = target_zone_id or prev.target_zone_id
        if color:
            prev.color = color
        prev.dwell_time_sec = round(prev.dwell_time_sec + dt, 1)
        prev.last_update_ts = now
        prev.trail = trail

        return prev

    def prune_stale(self, active_ids: List[int]):
        """Remove pedestrians who have exited the tracking field."""
        active_set = set(active_ids)
        to_remove = [pid for pid in self.pedestrians if pid not in active_set]
        for pid in to_remove:
            del self.pedestrians[pid]

    def get_all(self) -> List[PedestrianState]:
        return list(self.pedestrians.values())

"""
CrowdEco Predictive Congestion Engine:
Calculates velocity flux, trajectory acceleration, and 2nd-order Taylor
kinetic forecasts for T+30s and T+60s horizons. Evaluates Congestion Risk
Index (CRI) and triggers early warnings before bottlenecks manifest.
"""
import time
import math
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field

from app.config import (
    ZONE_CONFIGS,
    CRITICAL_CRI_THRESHOLD,
    WARNING_CRI_THRESHOLD,
    PREDICTION_HORIZONS_SEC
)
from app.analytics.spatial_grid import SpatialGrid, ZoneMetrics
from app.analytics.pedestrian_tracker import PedestrianState

class ProactiveAlert(BaseModel):
    id: str
    timestamp: float
    formatted_time: str
    zone_id: str
    zone_name: str
    level: str  # "CRITICAL" | "WARNING"
    cri_score: float
    current_headcount: int
    max_capacity: int
    projected_30s: int
    projected_60s: int
    time_to_breach_sec: Optional[int] = None
    title: str
    message: str
    recommendations: List[str]
    status: str = "ACTIVE"  # "ACTIVE" | "ACKNOWLEDGED" | "RESOLVED"
    resolved_at: Optional[float] = None
    acknowledged_by: Optional[str] = None

class ZonePredictionResult(BaseModel):
    zone_id: str
    zone_name: str
    current_headcount: int
    max_capacity: int
    occupancy_pct: float
    inflow_rate_per_min: float
    outflow_rate_per_min: float
    net_flow_per_sec: float
    acceleration_per_sec2: float
    projected_30s: int
    projected_60s: int
    projected_30s_pct: float
    projected_60s_pct: float
    cri_score: float
    risk_level: str  # "NORMAL" | "WARNING" | "CRITICAL"
    time_to_breach_sec: Optional[int] = None
    active_alert: Optional[ProactiveAlert] = None
    recommendations: List[str]

class PredictiveEngine:
    def __init__(self, spatial_grid: SpatialGrid):
        self.spatial_grid = spatial_grid
        self.zone_accelerations: Dict[str, float] = {zid: 0.0 for zid in ZONE_CONFIGS}
        self.prev_net_flows: Dict[str, float] = {zid: 0.0 for zid in ZONE_CONFIGS}
        self.last_forecast_time = time.time()
        self.alert_history: List[ProactiveAlert] = []
        self.active_alerts: Dict[str, ProactiveAlert] = {}
        self.alert_cooldowns: Dict[str, float] = {}

    def forecast_zone(
        self,
        zone_metric: ZoneMetrics,
        pedestrians: List[PedestrianState],
        dt: float
    ) -> ZonePredictionResult:
        now = time.time()
        zid = zone_metric.config.id
        zcfg = zone_metric.config
        
        c_max = max(1, zcfg.max_capacity)
        n_curr = zone_metric.headcount
        net_flow_sec = zone_metric.net_flow_rate_per_sec

        # 1. Calculate Acceleration d(F_net)/dt
        prev_flow = self.prev_net_flows.get(zid, 0.0)
        if dt > 0.1:
            raw_accel = (net_flow_sec - prev_flow) / dt
            alpha_acc = 0.3
            accel = alpha_acc * raw_accel + (1.0 - alpha_acc) * self.zone_accelerations.get(zid, 0.0)
            self.zone_accelerations[zid] = accel
            self.prev_net_flows[zid] = net_flow_sec
        else:
            accel = self.zone_accelerations.get(zid, 0.0)

        # 2. Vector Flux Inbound Calculation
        # Check pedestrians near boundaries whose velocity points towards this zone
        inbound_vector_bonus = 0.0
        bounds = zcfg.bounds
        for p in pedestrians:
            if p.zone_id != zid:
                # Is pedestrian close to boundary (within 100 coordinate units)?
                dist_x = max(0.0, max(bounds["min_x"] - p.x, p.x - bounds["max_x"]))
                dist_y = max(0.0, max(bounds["min_y"] - p.y, p.y - bounds["max_y"]))
                proximity = math.sqrt(dist_x * dist_x + dist_y * dist_y)
                
                if proximity < 100.0:
                    # Check if velocity vector points into the zone
                    center_x = (bounds["min_x"] + bounds["max_x"]) / 2.0
                    center_y = (bounds["min_y"] + bounds["max_y"]) / 2.0
                    to_center_x = center_x - p.x
                    to_center_y = center_y - p.y
                    
                    dot_product = p.vx * to_center_x + p.vy * to_center_y
                    if dot_product > 0 and p.speed > 1.0:
                        inbound_vector_bonus += 0.05

        effective_net_flow = net_flow_sec + min(2.5, inbound_vector_bonus)

        # 3. 2nd-order Taylor Kinetic Projection: N(t + tau) = N(t) + v * tau + 0.5 * a * tau^2
        # Bound damping factor to keep physical realism
        damping_30 = 0.85
        damping_60 = 0.70

        proj_30 = n_curr + (effective_net_flow * 30.0 * damping_30) + (0.5 * accel * (30.0 ** 2) * 0.1)
        proj_60 = n_curr + (effective_net_flow * 60.0 * damping_60) + (0.5 * accel * (60.0 ** 2) * 0.05)

        proj_30 = max(0, int(round(proj_30)))
        proj_60 = max(0, int(round(proj_60)))

        # Occupancy fractions
        curr_ratio = n_curr / c_max
        ratio_30 = proj_30 / c_max
        ratio_60 = proj_60 / c_max

        # 4. Congestion Risk Index (CRI) %:
        # Balanced blend: 30% current + 45% 30s-ahead + 25% 60s-ahead
        raw_cri = (curr_ratio * 0.30 + ratio_30 * 0.45 + ratio_60 * 0.25) * 100.0

        # Trajectory acceleration penalty if crowd is compounding
        if accel > 0.05:
            raw_cri += min(15.0, accel * 50.0)

        cri_score = round(max(0.0, min(100.0, raw_cri)), 1)

        # Risk Classification
        if cri_score >= CRITICAL_CRI_THRESHOLD or ratio_30 >= 0.85:
            risk_level = "CRITICAL"
        elif cri_score >= WARNING_CRI_THRESHOLD or ratio_60 >= 0.75:
            risk_level = "WARNING"
        else:
            risk_level = "NORMAL"

        # 5. Time-to-Breach Estimation
        time_to_breach_sec: Optional[int] = None
        critical_cap = c_max * zcfg.critical_threshold_ratio
        if n_curr >= critical_cap:
            time_to_breach_sec = 0
        elif effective_net_flow > 0.1:
            remaining_heads = critical_cap - n_curr
            est_seconds = remaining_heads / effective_net_flow
            if 0 < est_seconds <= 120:
                time_to_breach_sec = int(round(est_seconds))

        # 6. Proactive Alert Trigger
        active_alert = None
        if risk_level in ["CRITICAL", "WARNING"]:
            alert = self._evaluate_and_trigger_alert(
                zid=zid,
                zcfg=zcfg,
                risk_level=risk_level,
                cri_score=cri_score,
                n_curr=n_curr,
                c_max=c_max,
                proj_30=proj_30,
                proj_60=proj_60,
                time_to_breach_sec=time_to_breach_sec
            )
            if alert:
                active_alert = alert
        else:
            # If zone normalized, auto-resolve active alert
            if zid in self.active_alerts:
                self.resolve_alert(self.active_alerts[zid].id, resolved_by="SYSTEM (Zone Normalized)")

        return ZonePredictionResult(
            zone_id=zid,
            zone_name=zcfg.name,
            current_headcount=n_curr,
            max_capacity=c_max,
            occupancy_pct=round(curr_ratio * 100.0, 1),
            inflow_rate_per_min=zone_metric.inflow_rate_per_min,
            outflow_rate_per_min=zone_metric.outflow_rate_per_min,
            net_flow_per_sec=round(net_flow_sec, 2),
            acceleration_per_sec2=round(accel, 3),
            projected_30s=proj_30,
            projected_60s=proj_60,
            projected_30s_pct=round(ratio_30 * 100.0, 1),
            projected_60s_pct=round(ratio_60 * 100.0, 1),
            cri_score=cri_score,
            risk_level=risk_level,
            time_to_breach_sec=time_to_breach_sec,
            active_alert=active_alert or self.active_alerts.get(zid),
            recommendations=zcfg.recommended_mitigations
        )

    def _evaluate_and_trigger_alert(
        self,
        zid: str,
        zcfg: Any,
        risk_level: str,
        cri_score: float,
        n_curr: int,
        c_max: int,
        proj_30: int,
        proj_60: int,
        time_to_breach_sec: Optional[int]
    ) -> Optional[ProactiveAlert]:
        now = time.time()
        
        # If an active alert exists for this zone, update its peak metrics
        if zid in self.active_alerts:
            existing = self.active_alerts[zid]
            if existing.status == "ACTIVE":
                if cri_score > existing.cri_score:
                    existing.cri_score = cri_score
                    existing.level = risk_level
                existing.current_headcount = n_curr
                existing.projected_30s = proj_30
                existing.projected_60s = proj_60
                existing.time_to_breach_sec = time_to_breach_sec
                return existing

        # Cooldown check: don't spam new alerts if one was resolved recently (<10s)
        last_alert_time = self.alert_cooldowns.get(zid, 0.0)
        if now - last_alert_time < 8.0:
            return None

        # Build proactive message with actionable recommendation
        time_str = f"within {time_to_breach_sec}s" if (time_to_breach_sec and time_to_breach_sec > 0) else "immediately"
        icon = "⚠️" if risk_level == "CRITICAL" else "⚡"
        
        primary_mitigation = zcfg.recommended_mitigations[0] if zcfg.recommended_mitigations else "Reroute pedestrian traffic."
        message = f"{icon} Predicted Bottleneck in {zcfg.name} {time_str}. {primary_mitigation}"
        title = f"Proactive Congestion Alert: {zcfg.name} ({cri_score}% CRI)"

        alert_id = f"ALT-{zid[-4:].upper()}-{int(now % 10000):04d}"
        formatted_time = time.strftime("%H:%M:%S", time.localtime(now))

        alert = ProactiveAlert(
            id=alert_id,
            timestamp=now,
            formatted_time=formatted_time,
            zone_id=zid,
            zone_name=zcfg.name,
            level=risk_level,
            cri_score=cri_score,
            current_headcount=n_curr,
            max_capacity=c_max,
            projected_30s=proj_30,
            projected_60s=proj_60,
            time_to_breach_sec=time_to_breach_sec,
            title=title,
            message=message,
            recommendations=zcfg.recommended_mitigations,
            status="ACTIVE"
        )

        self.active_alerts[zid] = alert
        self.alert_history.insert(0, alert)
        self.alert_cooldowns[zid] = now

        # Keep history manageable (last 50 alerts)
        if len(self.alert_history) > 50:
            self.alert_history = self.alert_history[:50]

        return alert

    def acknowledge_alert(self, alert_id: str, ack_by: str = "Operator") -> bool:
        for alert in self.alert_history:
            if alert.id == alert_id:
                alert.status = "ACKNOWLEDGED"
                alert.acknowledged_by = ack_by
                if alert.zone_id in self.active_alerts and self.active_alerts[alert.zone_id].id == alert_id:
                    self.active_alerts[alert.zone_id].status = "ACKNOWLEDGED"
                return True
        return False

    def resolve_alert(self, alert_id: str, resolved_by: str = "Operator Action") -> bool:
        now = time.time()
        for alert in self.alert_history:
            if alert.id == alert_id:
                alert.status = "RESOLVED"
                alert.resolved_at = now
                if alert.zone_id in self.active_alerts and self.active_alerts[alert.zone_id].id == alert_id:
                    del self.active_alerts[alert.zone_id]
                return True
        return False

    def forecast_all_zones(self, pedestrians: List[PedestrianState]) -> List[ZonePredictionResult]:
        now = time.time()
        dt = max(0.01, now - self.last_forecast_time)
        self.last_forecast_time = now

        results = []
        for zid, zone_metric in self.spatial_grid.zones.items():
            res = self.forecast_zone(zone_metric, pedestrians, dt)
            results.append(res)
        return results

"""
Campus Sentinel Configuration:
Zone definitions, threshold constants, and predictive engine parameters.
"""
from typing import Dict, Any, List
from pydantic import BaseModel

class ZoneConfig(BaseModel):
    id: str
    name: str
    description: str
    max_capacity: int
    critical_threshold_ratio: float = 0.85  # 85% capacity threshold
    warning_threshold_ratio: float = 0.70   # 70% warning threshold
    bounds: Dict[str, float]  # {"min_x": 0, "max_x": 400, "min_y": 0, "max_y": 400}
    color: str
    recommended_mitigations: List[str]

ZONE_CONFIGS: Dict[str, ZoneConfig] = {
    "zone_gate_a": ZoneConfig(
        id="zone_gate_a",
        name="Gate A - Main Entrance",
        description="Primary spectator security check and ticketing gates",
        max_capacity=130,
        critical_threshold_ratio=0.85,
        warning_threshold_ratio=0.70,
        bounds={"min_x": 40, "max_x": 440, "min_y": 40, "max_y": 420},
        color="#3B82F6",  # Blue
        recommended_mitigations=[
            "Open auxiliary turnstiles #4 and #5 to alleviate queue buildup.",
            "Activate electronic queue signage directing attendees to Gate B.",
            "Deploy 2 security marshals for bag-check lane acceleration."
        ]
    ),
    "zone_main_arena": ZoneConfig(
        id="zone_main_arena",
        name="Main Arena Concourse",
        description="Central arena floor and general standing auditorium",
        max_capacity=360,
        critical_threshold_ratio=0.85,
        warning_threshold_ratio=0.70,
        bounds={"min_x": 520, "max_x": 960, "min_y": 40, "max_y": 480},
        color="#8B5CF6",  # Purple
        recommended_mitigations=[
            "Halt incoming escalator flow from Mezzanine corridor.",
            "Enable one-way directional pedestrian lane via central barricades.",
            "Display audio-visual stage notices requesting crowd dispersion."
        ]
    ),
    "zone_food_court": ZoneConfig(
        id="zone_food_court",
        name="Food Court - Zone B",
        description="Concession stands, hydration points, and seating lanes",
        max_capacity=170,
        critical_threshold_ratio=0.85,
        warning_threshold_ratio=0.70,
        bounds={"min_x": 40, "max_x": 440, "min_y": 520, "max_y": 940},
        color="#EC4899",  # Pink
        recommended_mitigations=[
            "Activate secondary exit corridor adjacent to Concession #3.",
            "Deploy crowd control stanchions to prevent queue cross-over.",
            "Request concession vendors switch to express cashless lanes."
        ]
    ),
    "zone_exit_corridor": ZoneConfig(
        id="zone_exit_corridor",
        name="Exit Corridor & South Egress",
        description="Narrow transition bottleneck leading to transport hub",
        max_capacity=95,
        critical_threshold_ratio=0.85,
        warning_threshold_ratio=0.70,
        bounds={"min_x": 520, "max_x": 960, "min_y": 580, "max_y": 940},
        color="#F59E0B",  # Amber
        recommended_mitigations=[
            "Release emergency magnetic door latches on secondary Egress Gate 2.",
            "Pulse-meter incoming crowd from Arena Concourse by 50%.",
            "Broadcast clear overhead PA exit directions to avoid doorway crush."
        ]
    )
}

# Real-time Engine Settings
SIMULATION_FPS = 15
WS_BROADCAST_INTERVAL_SEC = 0.08  # ~12 Hz telemetry updates
PREDICTION_HORIZONS_SEC = [30, 60]  # Forecast 30s and 60s ahead
CRITICAL_CRI_THRESHOLD = 85.0
WARNING_CRI_THRESHOLD = 70.0

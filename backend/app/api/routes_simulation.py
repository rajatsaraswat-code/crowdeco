"""
CrowdEco Simulation & Testing Controls API:
Allows operators and QA testers to artificially spike crowd flows,
trigger stampede bottlenecks, change scenarios, and test predictive alerts.
"""
from fastapi import APIRouter, HTTPException
from typing import Dict, Any, Optional
from pydantic import BaseModel

router = APIRouter(prefix="/api/simulation", tags=["simulation"])

class SpikeCrowdRequest(BaseModel):
    zone_id: str
    count: int = 35

class SetScenarioRequest(BaseModel):
    scenario: str  # NORMAL_EVENT_FLOW, INFLOW_SPIKE_GATE_A, HALFTIME_FOOD_RUSH, EMERGENCY_EGRESS_BOTTLENECK

class SpeedRequest(BaseModel):
    speed: float = 1.0

class AdjustCapacityRequest(BaseModel):
    zone_id: str
    new_capacity: int

app_state = {}

def set_state_ref(state: dict):
    global app_state
    app_state = state

@router.get("/status")
def get_simulation_status():
    sim = app_state.get("simulator")
    if not sim:
        return {"error": "Simulator unavailable"}
    return {
        "scenario": sim.scenario,
        "speed": sim.simulation_speed,
        "agent_count": len(sim.agents),
        "max_agents": sim.max_total_agents
    }

@router.post("/spike")
def spike_crowd(req: SpikeCrowdRequest):
    sim = app_state.get("simulator")
    if not sim:
        raise HTTPException(status_code=500, detail="Simulator unavailable")
    sim.inject_crowd_spike(req.zone_id, req.count)
    return {
        "status": "success",
        "message": f"Injected {req.count} agents into {req.zone_id}",
        "total_agents": len(sim.agents)
    }

@router.post("/scenario")
def set_scenario(req: SetScenarioRequest):
    sim = app_state.get("simulator")
    if not sim:
        raise HTTPException(status_code=500, detail="Simulator unavailable")
    sim.set_scenario(req.scenario)
    return {
        "status": "success",
        "scenario": sim.scenario,
        "message": f"Switched simulation scenario to {req.scenario}"
    }

@router.post("/speed")
def set_speed(req: SpeedRequest):
    sim = app_state.get("simulator")
    if not sim:
        raise HTTPException(status_code=500, detail="Simulator unavailable")
    sim.simulation_speed = max(0.2, min(5.0, req.speed))
    return {
        "status": "success",
        "speed": sim.simulation_speed
    }

@router.post("/capacity")
def adjust_capacity(req: AdjustCapacityRequest):
    from app.config import ZONE_CONFIGS
    if req.zone_id not in ZONE_CONFIGS:
        raise HTTPException(status_code=404, detail="Zone not found")
    ZONE_CONFIGS[req.zone_id].max_capacity = max(10, req.new_capacity)
    return {
        "status": "success",
        "zone_id": req.zone_id,
        "new_capacity": ZONE_CONFIGS[req.zone_id].max_capacity
    }

@router.post("/reset")
def reset_simulation():
    sim = app_state.get("simulator")
    if not sim:
        raise HTTPException(status_code=500, detail="Simulator unavailable")
    sim.reset()
    return {"status": "success", "message": "Simulation reset successfully."}

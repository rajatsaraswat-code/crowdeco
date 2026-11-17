"""
CrowdEco Alert Management Routes:
Endpoints to query active/historical predictive alerts, acknowledge warnings,
and record mitigation actions.
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, List, Optional
from pydantic import BaseModel

router = APIRouter(prefix="/api/alerts", tags=["alerts"])

class AcknowledgeRequest(BaseModel):
    operator_name: Optional[str] = "Control Room Lead"

class ResolveRequest(BaseModel):
    action_taken: str = "Secondary exit pathway opened"
    operator_name: Optional[str] = "Control Room Lead"

# State reference will be attached by main app
app_state = {}

def set_state_ref(state: dict):
    global app_state
    app_state = state

@router.get("")
def get_alerts():
    engine = app_state.get("predictive_engine")
    if not engine:
        return {"active_alerts": [], "alert_history": []}
    return {
        "active_alerts": list(engine.active_alerts.values()),
        "alert_history": engine.alert_history
    }

@router.post("/{alert_id}/acknowledge")
def acknowledge_alert(alert_id: str, req: AcknowledgeRequest):
    engine = app_state.get("predictive_engine")
    if not engine:
        raise HTTPException(status_code=500, detail="Engine unavailable")
    
    success = engine.acknowledge_alert(alert_id, ack_by=req.operator_name)
    if not success:
        raise HTTPException(status_code=404, detail="Alert ID not found")
    return {"status": "success", "alert_id": alert_id, "state": "ACKNOWLEDGED"}

@router.post("/{alert_id}/resolve")
def resolve_alert(alert_id: str, req: ResolveRequest):
    engine = app_state.get("predictive_engine")
    if not engine:
        raise HTTPException(status_code=500, detail="Engine unavailable")
    
    success = engine.resolve_alert(alert_id, resolved_by=f"{req.operator_name} - {req.action_taken}")
    if not success:
        raise HTTPException(status_code=404, detail="Alert ID not found")
    return {"status": "success", "alert_id": alert_id, "state": "RESOLVED"}

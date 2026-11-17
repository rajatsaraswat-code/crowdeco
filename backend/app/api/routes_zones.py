"""
CrowdEco Zone Routes:
Returns zone metadata, boundary coordinates, and real-time occupancy.
"""
from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from app.config import ZONE_CONFIGS

router = APIRouter(prefix="/api/zones", tags=["zones"])

@router.get("")
def get_zones():
    """Return all configured venue zones and metadata."""
    return {
        "zones": [cfg.dict() for cfg in ZONE_CONFIGS.values()],
        "total_zones": len(ZONE_CONFIGS)
    }

@router.get("/{zone_id}")
def get_zone_detail(zone_id: str):
    if zone_id not in ZONE_CONFIGS:
        raise HTTPException(status_code=404, detail="Zone not found")
    return ZONE_CONFIGS[zone_id].dict()

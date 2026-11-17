"""
CrowdEco FastAPI Application:
Main entry point orchestrating WebSocket streaming, ML analytics,
and REST endpoints for predictive crowd management.
"""
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.analytics.pedestrian_tracker import PedestrianTracker
from app.analytics.spatial_grid import SpatialGrid
from app.analytics.predictive_engine import PredictiveEngine
from app.simulation.crowd_simulator import CrowdSimulator
from app.api import routes_zones, routes_alerts, routes_simulation, routes_websocket

# Global Shared Application State
app_state = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize Engine Components
    tracker = PedestrianTracker()
    spatial_grid = SpatialGrid()
    predictive_engine = PredictiveEngine(spatial_grid)
    simulator = CrowdSimulator(tracker)

    app_state["tracker"] = tracker
    app_state["spatial_grid"] = spatial_grid
    app_state["predictive_engine"] = predictive_engine
    app_state["simulator"] = simulator

    # Pass state references to sub-routers
    routes_alerts.set_state_ref(app_state)
    routes_simulation.set_state_ref(app_state)
    routes_websocket.set_state_ref(app_state)

    # Start background WebSocket telemetry broadcast loop
    broadcast_task = asyncio.create_task(routes_websocket.telemetry_broadcast_loop())
    
    yield

    # Cleanup on shutdown
    broadcast_task.cancel()
    try:
        await broadcast_task
    except asyncio.CancelledError:
        pass

app = FastAPI(
    title="CrowdEco - Predictive Crowd Management API",
    description="Real-time multi-zone crowd analytics, vector-flow tracking, and predictive bottleneck engine.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for Next.js frontend (ports 3000, 3001, etc.)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(routes_zones.router)
app.include_router(routes_alerts.router)
app.include_router(routes_simulation.router)
app.include_router(routes_websocket.router)

@app.get("/")
def root():
    return {
        "app": "CrowdEco Predictive Crowd Management API",
        "status": "ONLINE",
        "version": "1.0.0",
        "endpoints": {
            "websocket": "ws://localhost:8000/ws/live-feed",
            "zones": "/api/zones",
            "alerts": "/api/alerts",
            "simulation": "/api/simulation/status"
        }
    }

@app.get("/api/health")
def health():
    sim = app_state.get("simulator")
    engine = app_state.get("predictive_engine")
    return {
        "status": "HEALTHY",
        "active_attendees": len(sim.agents) if sim else 0,
        "active_alerts_count": len(engine.active_alerts) if engine else 0
    }

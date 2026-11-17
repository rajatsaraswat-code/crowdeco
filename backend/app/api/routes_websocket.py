"""
CrowdEco Real-time WebSocket Telemetry Broadcaster:
Streams sub-second multi-zone metrics, predictive forecasts,
pedestrian bounding boxes, movement vectors, and density heatmaps.
"""
import asyncio
import json
import time
from typing import Set
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.config import WS_BROADCAST_INTERVAL_SEC
from app.analytics.spatial_grid import SpatialGrid
from app.analytics.predictive_engine import PredictiveEngine
from app.analytics.heatmap_generator import HeatmapGenerator
from app.simulation.crowd_simulator import CrowdSimulator
from ml_models.vector_flow import VectorFlowField
from ml_models.yolo_detector import YOLODetector

router = APIRouter(tags=["websocket"])

class ConnectionManager:
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)

    async def broadcast(self, message: str):
        stale = set()
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                stale.add(connection)
        for s in stale:
            self.active_connections.discard(s)

manager = ConnectionManager()
app_state = {}

def set_state_ref(state: dict):
    global app_state
    app_state = state

@router.websocket("/ws/live-feed")
async def websocket_live_feed(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep socket alive and accept client commands if any
            data = await websocket.receive_text()
            # Handle incoming client commands over WS if needed
            try:
                cmd = json.loads(data)
                if cmd.get("action") == "spike":
                    sim = app_state.get("simulator")
                    if sim:
                        sim.inject_crowd_spike(cmd.get("zone_id", "zone_food_court"), cmd.get("count", 30))
                elif cmd.get("action") == "scenario":
                    sim = app_state.get("simulator")
                    if sim:
                        sim.set_scenario(cmd.get("scenario", "NORMAL_EVENT_FLOW"))
            except Exception:
                pass
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)

async def telemetry_broadcast_loop():
    """Background async task continuously ticking simulation and pushing WS frames."""
    heatmap_gen = HeatmapGenerator(grid_rows=25, grid_cols=25)
    flow_calculator = VectorFlowField(cols=14, rows=14)
    yolo_detector = YOLODetector()
    frame_seq = 0

    while True:
        try:
            start_t = time.time()
            simulator: CrowdSimulator = app_state.get("simulator")
            grid: SpatialGrid = app_state.get("spatial_grid")
            engine: PredictiveEngine = app_state.get("predictive_engine")

            if simulator and grid and engine:
                # 1. Step simulation physics
                simulator.step()
                pedestrians = simulator.tracker.get_all()

                # 2. Update spatial grid zone occupancies and flows
                grid.update_from_pedestrians(pedestrians)

                # 3. Compute predictive forecasts and alerts
                forecasts = engine.forecast_all_zones(pedestrians)

                # 4. Generate visual analytics (sampled for performance)
                # Sample up to 180 pedestrians for UI vector drawing
                sampled_peds = pedestrians[:180]
                detections = yolo_detector.generate_detections(sampled_peds)
                flow_field = flow_calculator.compute_flow_field(pedestrians)
                heatmap = heatmap_gen.compute_density_grid(pedestrians)

                frame_seq += 1
                payload = {
                    "type": "TELEMETRY_FRAME",
                    "frame_seq": frame_seq,
                    "timestamp": time.time(),
                    "scenario": simulator.scenario,
                    "simulation_speed": simulator.simulation_speed,
                    "total_attendees": len(pedestrians),
                    "zones": [f.dict() for f in forecasts],
                    "active_alerts": [a.dict() for a in engine.active_alerts.values()],
                    "detections": detections,
                    "vector_flow": flow_field,
                    "density_heatmap": heatmap
                }

                if manager.active_connections:
                    await manager.broadcast(json.dumps(payload))

            # Sleep interval to maintain ~12-14 FPS
            elapsed = time.time() - start_t
            sleep_time = max(0.01, WS_BROADCAST_INTERVAL_SEC - elapsed)
            await asyncio.sleep(sleep_time)

        except asyncio.CancelledError:
            break
        except Exception as e:
            await asyncio.sleep(0.1)

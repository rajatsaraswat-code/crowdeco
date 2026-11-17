"""
CrowdEco Microscopic Pedestrian Dynamics Simulator:
Simulates pedestrian trajectories using social force principles,
destination waypoints, crowd density drag, and testing injection spikes.
"""
import random
import math
import time
from typing import List, Dict, Tuple, Optional
from app.config import ZONE_CONFIGS
from app.analytics.pedestrian_tracker import PedestrianTracker, PedestrianState

class SimAgent:
    def __init__(self, agent_id: int, x: float, y: float, target_zone: str):
        self.id = agent_id
        self.x = x
        self.y = y
        self.target_zone = target_zone
        self.target_x = x
        self.target_y = y
        self.base_speed = random.uniform(2.8, 4.6)
        self.vx = 0.0
        self.vy = 0.0
        self.current_zone = None
        self.dwell_timer = random.uniform(5.0, 25.0)  # Seconds to linger at destination
        self.pick_new_waypoint()

    def pick_new_waypoint(self):
        cfg = ZONE_CONFIGS.get(self.target_zone)
        if cfg:
            b = cfg.bounds
            pad = 25.0
            self.target_x = random.uniform(b["min_x"] + pad, b["max_x"] - pad)
            self.target_y = random.uniform(b["min_y"] + pad, b["max_y"] - pad)
        else:
            self.target_x = random.uniform(100, 900)
            self.target_y = random.uniform(100, 900)

class CrowdSimulator:
    def __init__(self, tracker: PedestrianTracker):
        self.tracker = tracker
        self.agents: Dict[int, SimAgent] = {}
        self.next_agent_id = 1
        self.scenario = "NORMAL_EVENT_FLOW"  # NORMAL_EVENT_FLOW, INFLOW_SPIKE_GATE_A, HALFTIME_FOOD_RUSH, EMERGENCY_EGRESS_BOTTLENECK
        self.simulation_speed = 1.0
        self.spawn_interval_sec = 0.35
        self.last_spawn_time = time.time()
        self.max_total_agents = 500
        self.last_step_time = time.time()
        self.scenario_timer = time.time()

        # Seed initial crowd
        self.seed_initial_population(220)

    def seed_initial_population(self, count: int):
        zone_keys = list(ZONE_CONFIGS.keys())
        for _ in range(count):
            zid = random.choice(zone_keys)
            b = ZONE_CONFIGS[zid].bounds
            x = random.uniform(b["min_x"] + 20, b["max_x"] - 20)
            y = random.uniform(b["min_y"] + 20, b["max_y"] - 20)
            target = random.choice(zone_keys)
            agent = SimAgent(self.next_agent_id, x, y, target)
            self.agents[agent.id] = agent
            self.next_agent_id += 1

    def inject_crowd_spike(self, zone_id: str, count: int = 35):
        """Artificially injects agents converging on a zone to test proactive alerts."""
        if zone_id not in ZONE_CONFIGS:
            zone_id = "zone_food_court"
            
        b = ZONE_CONFIGS[zone_id].bounds
        # Spawn around the periphery rushing inward
        for _ in range(count):
            angle = random.uniform(0, 2 * math.pi)
            dist = random.uniform(120, 220)
            center_x = (b["min_x"] + b["max_x"]) / 2.0
            center_y = (b["min_y"] + b["max_y"]) / 2.0
            spawn_x = max(10, min(990, center_x + math.cos(angle) * dist))
            spawn_y = max(10, min(990, center_y + math.sin(angle) * dist))

            agent = SimAgent(self.next_agent_id, spawn_x, spawn_y, target_zone=zone_id)
            agent.base_speed = random.uniform(4.5, 7.0)  # Rushing speed
            agent.dwell_timer = 45.0
            self.agents[agent.id] = agent
            self.next_agent_id += 1

    def set_scenario(self, scenario_name: str):
        valid = ["NORMAL_EVENT_FLOW", "INFLOW_SPIKE_GATE_A", "HALFTIME_FOOD_RUSH", "EMERGENCY_EGRESS_BOTTLENECK"]
        if scenario_name in valid:
            self.scenario = scenario_name
            self.scenario_timer = time.time()
            if scenario_name == "INFLOW_SPIKE_GATE_A":
                self.inject_crowd_spike("zone_gate_a", 45)
            elif scenario_name == "HALFTIME_FOOD_RUSH":
                # Redirect 60 arena agents to food court
                count = 0
                for a in self.agents.values():
                    if a.current_zone == "zone_main_arena" and count < 60:
                        a.target_zone = "zone_food_court"
                        a.pick_new_waypoint()
                        a.base_speed = random.uniform(4.0, 6.5)
                        count += 1
                self.inject_crowd_spike("zone_food_court", 35)
            elif scenario_name == "EMERGENCY_EGRESS_BOTTLENECK":
                # Direct majority of crowd into the narrow Exit Corridor
                for a in list(self.agents.values())[:120]:
                    a.target_zone = "zone_exit_corridor"
                    a.pick_new_waypoint()
                    a.base_speed = random.uniform(4.5, 7.5)
                self.inject_crowd_spike("zone_exit_corridor", 40)

    def reset(self):
        self.agents.clear()
        self.tracker.pedestrians.clear()
        self.next_agent_id = 1
        self.scenario = "NORMAL_EVENT_FLOW"
        self.seed_initial_population(200)

    def step(self):
        now = time.time()
        raw_dt = now - self.last_step_time
        dt = min(0.1, max(0.01, raw_dt)) * self.simulation_speed
        self.last_step_time = now

        # 1. Spawn new attendees periodically
        if now - self.last_spawn_time >= self.spawn_interval_sec and len(self.agents) < self.max_total_agents:
            self._spawn_periodic_agent()
            self.last_spawn_time = now

        # 2. Update agent physics and motion
        active_ids = []
        for aid, agent in list(self.agents.items()):
            self._update_agent(agent, dt)
            active_ids.append(aid)

            # Update tracker
            color = "#3B82F6"
            if agent.current_zone == "zone_main_arena":
                color = "#8B5CF6"
            elif agent.current_zone == "zone_food_court":
                color = "#EC4899"
            elif agent.current_zone == "zone_exit_corridor":
                color = "#F59E0B"

            self.tracker.update_pedestrian(
                ped_id=agent.id,
                x=agent.x,
                y=agent.y,
                zone_id=agent.current_zone,
                target_zone_id=agent.target_zone,
                color=color
            )

        self.tracker.prune_stale(active_ids)

    def _spawn_periodic_agent(self):
        # Normal flow spawns at Gate A
        gate = ZONE_CONFIGS["zone_gate_a"].bounds
        x = random.uniform(gate["min_x"], gate["min_x"] + 30)
        y = random.uniform(gate["min_y"] + 20, gate["max_y"] - 20)

        # Decide destination based on scenario
        dest_choices = ["zone_main_arena", "zone_food_court", "zone_main_arena"]
        if self.scenario == "HALFTIME_FOOD_RUSH":
            dest_choices = ["zone_food_court", "zone_food_court", "zone_main_arena"]
        elif self.scenario == "EMERGENCY_EGRESS_BOTTLENECK":
            dest_choices = ["zone_exit_corridor"]

        target = random.choice(dest_choices)
        agent = SimAgent(self.next_agent_id, x, y, target)
        self.agents[agent.id] = agent
        self.next_agent_id += 1

    def _update_agent(self, agent: SimAgent, dt: float):
        # Determine current zone
        for zid, cfg in ZONE_CONFIGS.items():
            b = cfg.bounds
            if b["min_x"] <= agent.x <= b["max_x"] and b["min_y"] <= agent.y <= b["max_y"]:
                agent.current_zone = zid
                break
        else:
            agent.current_zone = None

        # Calculate vector to destination
        dx = agent.target_x - agent.x
        dy = agent.target_y - agent.y
        dist = math.sqrt(dx * dx + dy * dy)

        if dist < 20.0:
            # Arrived at destination waypoint
            agent.dwell_timer -= dt
            if agent.dwell_timer <= 0:
                # Transition to next stage
                if agent.target_zone == "zone_gate_a":
                    agent.target_zone = "zone_main_arena"
                elif agent.target_zone == "zone_main_arena":
                    agent.target_zone = random.choice(["zone_food_court", "zone_exit_corridor", "zone_food_court"])
                elif agent.target_zone == "zone_food_court":
                    agent.target_zone = random.choice(["zone_main_arena", "zone_exit_corridor"])
                elif agent.target_zone == "zone_exit_corridor":
                    # Exit the venue completely and despawn
                    if random.random() < 0.65:
                        del self.agents[agent.id]
                        return
                    else:
                        agent.target_zone = "zone_gate_a"

                agent.dwell_timer = random.uniform(10.0, 30.0)
                agent.pick_new_waypoint()
            else:
                # Idle/mill slightly around waypoint
                agent.x += (random.random() - 0.5) * 0.4
                agent.y += (random.random() - 0.5) * 0.4
                agent.vx = 0.0
                agent.vy = 0.0
                return

        # Normalized direction vector
        dir_x = dx / (dist + 0.001)
        dir_y = dy / (dist + 0.001)

        # Fundamental Diagram crowd density drag:
        # In congested corridors, speed decreases
        speed = agent.base_speed
        if agent.current_zone == "zone_exit_corridor":
            # Exit corridor is narrow, naturally prone to bottleneck friction
            speed *= 0.72

        # Step position
        agent.vx = dir_x * speed
        agent.vy = dir_y * speed

        agent.x = max(10.0, min(990.0, agent.x + agent.vx * dt * 15.0))
        agent.y = max(10.0, min(990.0, agent.y + agent.vy * dt * 15.0))

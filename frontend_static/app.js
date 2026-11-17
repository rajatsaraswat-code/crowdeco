/**
 * Campus Sentinel - Predictive Crowd Dynamics & Congestion Warning Engine
 * Standalone Client-Side Application Script
 * Clean SVG-based UI without fragile emoji characters to prevent encoding glitches.
 */

// SVG Icon Constants (Zero mojibake risk)
const ICONS = {
  users: '<svg class="w-3.5 h-3.5 text-cyan-400 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>',
  flame: '<svg class="w-3.5 h-3.5 text-rose-400 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/></svg>',
  alert: '<svg class="w-3.5 h-3.5 text-amber-400 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>',
  check: '<svg class="w-3.5 h-3.5 text-emerald-400 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>',
  zap: '<svg class="w-3.5 h-3.5 text-cyan-400 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>',
  trending: '<svg class="w-3.5 h-3.5 text-amber-400 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>',
  clock: '<svg class="w-3.5 h-3.5 text-rose-300 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
  shield: '<svg class="w-4 h-4 text-rose-400 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>',
  soundOn: '<svg class="w-3.5 h-3.5 text-cyan-300 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/></svg>',
  soundOff: '<svg class="w-3.5 h-3.5 text-slate-400 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"/></svg>',
  radio: '<svg class="w-5 h-5 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>'
};

// Zone Configurations
const ZONE_CONFIGS = {
  zone_gate_a: {
    id: "zone_gate_a",
    name: "Gate A - Main Entrance",
    description: "Primary spectator security check and ticketing gates",
    max_capacity: 130,
    bounds: { min_x: 40, max_x: 440, min_y: 40, max_y: 420 },
    color: "#3B82F6",
    recommended_mitigations: [
      "Open auxiliary turnstiles #4 and #5 to alleviate queue buildup.",
      "Activate electronic queue signage directing attendees to Gate B.",
      "Deploy 2 security marshals for bag-check lane acceleration."
    ]
  },
  zone_main_arena: {
    id: "zone_main_arena",
    name: "Main Arena Concourse",
    description: "Central arena floor and general standing auditorium",
    max_capacity: 360,
    bounds: { min_x: 520, max_x: 960, min_y: 40, max_y: 480 },
    color: "#8B5CF6",
    recommended_mitigations: [
      "Halt incoming escalator flow from Mezzanine corridor.",
      "Enable one-way directional pedestrian lane via central barricades.",
      "Display audio-visual stage notices requesting crowd dispersion."
    ]
  },
  zone_food_court: {
    id: "zone_food_court",
    name: "Food Court - Zone B",
    description: "Concession stands, hydration points, and seating lanes",
    max_capacity: 170,
    bounds: { min_x: 40, max_x: 440, min_y: 520, max_y: 940 },
    color: "#EC4899",
    recommended_mitigations: [
      "Activate secondary exit corridor adjacent to Concession #3.",
      "Deploy crowd control stanchions to prevent queue cross-over.",
      "Request concession vendors switch to express cashless lanes."
    ]
  },
  zone_exit_corridor: {
    id: "zone_exit_corridor",
    name: "Exit Corridor & South Egress",
    description: "Narrow transition bottleneck leading to transport hub",
    max_capacity: 95,
    bounds: { min_x: 520, max_x: 960, min_y: 580, max_y: 940 },
    color: "#F59E0B",
    recommended_mitigations: [
      "Release emergency magnetic door latches on secondary Egress Gate 2.",
      "Pulse-meter incoming crowd from Arena Concourse by 50%.",
      "Broadcast clear overhead PA exit directions to avoid doorway crush."
    ]
  }
};

// Global State
const state = {
  isConnected: false,
  usingBackend: false,
  frameSeq: 0,
  scenario: "NORMAL_EVENT_FLOW",
  simulationSpeed: 1.0,
  soundEnabled: false,
  activeTab: "dashboard",
  selectedZone: null,
  activeAlerts: [],
  alertHistory: [],
  zones: {},
  pedestrians: [],
  vectorFlow: [],
  densityHeatmap: [],
  charts: {},
  historyData: {
    times: [],
    gateA: [],
    arena: [],
    foodCourt: [],
    exitCorridor: [],
    criMax: []
  },
  viewMode: "cctv",
  showBoundingBoxes: true,
  showVelocityVectors: true,
  showFlowField: true,
  showHeatmap: true
};

// Initialize State Zones
Object.keys(ZONE_CONFIGS).forEach(zid => {
  const cfg = ZONE_CONFIGS[zid];
  state.zones[zid] = {
    zone_id: zid,
    zone_name: cfg.name,
    current_headcount: 35,
    max_capacity: cfg.max_capacity,
    occupancy_pct: 25.0,
    inflow_rate_per_min: 18.0,
    outflow_rate_per_min: 15.0,
    net_flow_per_sec: 0.05,
    acceleration_per_sec2: 0.0,
    projected_30s: 40,
    projected_60s: 46,
    projected_30s_pct: 30.0,
    projected_60s_pct: 35.0,
    cri_score: 32.0,
    risk_level: "NORMAL",
    time_to_breach_sec: null,
    recommendations: cfg.recommended_mitigations
  };
});

// Standalone Simulator Class (runs if backend is offline)
class StandaloneEngine {
  constructor() {
    this.agents = [];
    this.nextId = 1;
    this.lastTick = Date.now();
    this.spawnTimer = 0;
    this.initAgents(230);
  }

  initAgents(count) {
    const zoneKeys = Object.keys(ZONE_CONFIGS);
    for (let i = 0; i < count; i++) {
      const zid = zoneKeys[Math.floor(Math.random() * zoneKeys.length)];
      const b = ZONE_CONFIGS[zid].bounds;
      const x = b.min_x + 20 + Math.random() * (b.max_x - b.min_x - 40);
      const y = b.min_y + 20 + Math.random() * (b.max_y - b.min_y - 40);
      const target = zoneKeys[Math.floor(Math.random() * zoneKeys.length)];
      this.agents.push(this.createAgent(x, y, target));
    }
  }

  createAgent(x, y, targetZone) {
    const cfg = ZONE_CONFIGS[targetZone] || ZONE_CONFIGS.zone_main_arena;
    const b = cfg.bounds;
    return {
      id: this.nextId++,
      x,
      y,
      vx: 0,
      vy: 0,
      speed: 0,
      heading_deg: 0,
      targetZone,
      targetX: b.min_x + 30 + Math.random() * (b.max_x - b.min_x - 60),
      targetY: b.min_y + 30 + Math.random() * (b.max_y - b.min_y - 60),
      baseSpeed: 2.5 + Math.random() * 2.5,
      dwell: 5 + Math.random() * 20,
      currentZone: null
    };
  }

  injectSpike(zoneId, count) {
    const cfg = ZONE_CONFIGS[zoneId] || ZONE_CONFIGS.zone_food_court;
    const b = cfg.bounds;
    const cx = (b.min_x + b.max_x) / 2;
    const cy = (b.min_y + b.max_y) / 2;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 140 + Math.random() * 120;
      const sx = Math.max(10, Math.min(990, cx + Math.cos(angle) * dist));
      const sy = Math.max(10, Math.min(990, cy + Math.sin(angle) * dist));
      const a = this.createAgent(sx, sy, zoneId);
      a.baseSpeed = 4.5 + Math.random() * 3.0;
      a.dwell = 40;
      this.agents.push(a);
    }
  }

  setScenario(name) {
    state.scenario = name;
    if (name === "INFLOW_SPIKE_GATE_A") {
      this.injectSpike("zone_gate_a", 45);
    } else if (name === "HALFTIME_FOOD_RUSH") {
      let count = 0;
      this.agents.forEach(a => {
        if (a.currentZone === "zone_main_arena" && count < 65) {
          a.targetZone = "zone_food_court";
          const b = ZONE_CONFIGS.zone_food_court.bounds;
          a.targetX = b.min_x + 30 + Math.random() * (b.max_x - b.min_x - 60);
          a.targetY = b.min_y + 30 + Math.random() * (b.max_y - b.min_y - 60);
          a.baseSpeed = 4.0 + Math.random() * 2.5;
          count++;
        }
      });
      this.injectSpike("zone_food_court", 35);
    } else if (name === "EMERGENCY_EGRESS_BOTTLENECK") {
      this.agents.slice(0, 130).forEach(a => {
        a.targetZone = "zone_exit_corridor";
        const b = ZONE_CONFIGS.zone_exit_corridor.bounds;
        a.targetX = b.min_x + 20 + Math.random() * (b.max_x - b.min_x - 40);
        a.targetY = b.min_y + 20 + Math.random() * (b.max_y - b.min_y - 40);
        a.baseSpeed = 4.8 + Math.random() * 3.0;
      });
      this.injectSpike("zone_exit_corridor", 40);
    }
  }

  reset() {
    this.agents = [];
    this.nextId = 1;
    this.initAgents(220);
    state.scenario = "NORMAL_EVENT_FLOW";
    state.activeAlerts = [];
  }

  step(dt) {
    const speedMult = state.simulationSpeed;
    const effDt = dt * speedMult;

    // Periodic Spawning
    this.spawnTimer += effDt;
    if (this.spawnTimer >= 0.4 && this.agents.length < 450) {
      this.spawnTimer = 0;
      const b = ZONE_CONFIGS.zone_gate_a.bounds;
      const sx = b.min_x + Math.random() * 30;
      const sy = b.min_y + 20 + Math.random() * (b.max_y - b.min_y - 40);
      let target = "zone_main_arena";
      if (state.scenario === "HALFTIME_FOOD_RUSH") target = "zone_food_court";
      else if (state.scenario === "EMERGENCY_EGRESS_BOTTLENECK") target = "zone_exit_corridor";
      this.agents.push(this.createAgent(sx, sy, target));
    }

    // Zone headcount accumulators
    const zoneCounts = { zone_gate_a: 0, zone_main_arena: 0, zone_food_court: 0, zone_exit_corridor: 0 };

    for (let i = this.agents.length - 1; i >= 0; i--) {
      const a = this.agents[i];
      // Zone determination
      a.currentZone = null;
      for (const [zid, cfg] of Object.entries(ZONE_CONFIGS)) {
        const b = cfg.bounds;
        if (a.x >= b.min_x && a.x <= b.max_x && a.y >= b.min_y && a.y <= b.max_y) {
          a.currentZone = zid;
          zoneCounts[zid]++;
          break;
        }
      }

      // Movement vector to target
      const dx = a.targetX - a.x;
      const dy = a.targetY - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 22) {
        a.dwell -= effDt;
        if (a.dwell <= 0) {
          if (a.targetZone === "zone_gate_a") a.targetZone = "zone_main_arena";
          else if (a.targetZone === "zone_main_arena") a.targetZone = Math.random() < 0.6 ? "zone_food_court" : "zone_exit_corridor";
          else if (a.targetZone === "zone_food_court") a.targetZone = Math.random() < 0.5 ? "zone_main_arena" : "zone_exit_corridor";
          else if (a.targetZone === "zone_exit_corridor") {
            if (Math.random() < 0.65) {
              this.agents.splice(i, 1);
              continue;
            } else {
              a.targetZone = "zone_gate_a";
            }
          }
          a.dwell = 10 + Math.random() * 20;
          const targetCfg = ZONE_CONFIGS[a.targetZone] || ZONE_CONFIGS.zone_main_arena;
          a.targetX = targetCfg.bounds.min_x + 20 + Math.random() * (targetCfg.bounds.max_x - targetCfg.bounds.min_x - 40);
          a.targetY = targetCfg.bounds.min_y + 20 + Math.random() * (targetCfg.bounds.max_y - targetCfg.bounds.min_y - 40);
        } else {
          a.vx *= 0.8;
          a.vy *= 0.8;
          a.speed = 0;
          continue;
        }
      }

      const dirX = dx / (dist + 0.001);
      const dirY = dy / (dist + 0.001);
      let spd = a.baseSpeed;
      if (a.currentZone === "zone_exit_corridor") spd *= 0.72;

      a.vx = dirX * spd;
      a.vy = dirY * spd;
      a.speed = Math.sqrt(a.vx * a.vx + a.vy * a.vy);
      a.heading_deg = (Math.atan2(a.vy, a.vx) * 180 / Math.PI + 360) % 360;

      a.x = Math.max(10, Math.min(990, a.x + a.vx * effDt * 16));
      a.y = Math.max(10, Math.min(990, a.y + a.vy * effDt * 16));
    }

    // Predictive Kinetic Calculation for Each Zone
    Object.keys(ZONE_CONFIGS).forEach(zid => {
      const z = state.zones[zid];
      const cfg = ZONE_CONFIGS[zid];
      const count = zoneCounts[zid] || 0;
      const prevCount = z.current_headcount;
      z.current_headcount = count;

      // Net flow and smoothing
      const rawNet = (count - prevCount) / Math.max(0.05, effDt);
      z.net_flow_per_sec = Math.round((z.net_flow_per_sec * 0.7 + rawNet * 0.3) * 10) / 10;
      z.inflow_rate_per_min = Math.max(0, Math.round((z.inflow_rate_per_min * 0.85 + Math.max(0, z.net_flow_per_sec * 60 + 15) * 0.15) * 10) / 10);
      z.outflow_rate_per_min = Math.max(0, Math.round((z.outflow_rate_per_min * 0.85 + Math.max(0, 15 - z.net_flow_per_sec * 30) * 0.15) * 10) / 10);

      // Trajectory Acceleration
      z.acceleration_per_sec2 = Math.round((z.net_flow_per_sec - (prevCount > 0 ? (count - prevCount) : 0)) * 0.1 * 100) / 100;

      // 2nd-order Taylor Kinetic Projection: N(t + tau) = N(t) + F_net * tau + 0.5 * a * tau^2
      const proj30 = Math.max(0, Math.round(count + (z.net_flow_per_sec * 30 * 0.85) + (0.5 * z.acceleration_per_sec2 * 900 * 0.08)));
      const proj60 = Math.max(0, Math.round(count + (z.net_flow_per_sec * 60 * 0.70) + (0.5 * z.acceleration_per_sec2 * 3600 * 0.04)));
      z.projected_30s = proj30;
      z.projected_60s = proj60;

      const cap = cfg.max_capacity;
      z.max_capacity = cap;
      z.occupancy_pct = Math.round((count / cap) * 1000) / 10;
      z.projected_30s_pct = Math.round((proj30 / cap) * 1000) / 10;
      z.projected_60s_pct = Math.round((proj60 / cap) * 1000) / 10;

      // Congestion Risk Index (CRI) %
      const rawCri = (z.occupancy_pct * 0.30 + z.projected_30s_pct * 0.45 + z.projected_60s_pct * 0.25);
      const accelPenalty = z.acceleration_per_sec2 > 0.03 ? Math.min(15, z.acceleration_per_sec2 * 45) : 0;
      z.cri_score = Math.min(100, Math.max(0, Math.round((rawCri + accelPenalty) * 10) / 10));

      if (z.cri_score >= 85 || z.projected_30s_pct >= 85) {
        z.risk_level = "CRITICAL";
      } else if (z.cri_score >= 70 || z.projected_60s_pct >= 75) {
        z.risk_level = "WARNING";
      } else {
        z.risk_level = "NORMAL";
      }

      // Time to breach
      if (count >= cap * 0.85) {
        z.time_to_breach_sec = 0;
      } else if (z.net_flow_per_sec > 0.1) {
        const remaining = (cap * 0.85) - count;
        const est = Math.round(remaining / z.net_flow_per_sec);
        z.time_to_breach_sec = (est > 0 && est <= 120) ? est : null;
      } else {
        z.time_to_breach_sec = null;
      }

      // Proactive Alert Trigger
      if (z.risk_level === "CRITICAL" || z.risk_level === "WARNING") {
        this.triggerAlert(zid, z);
      } else {
        // Auto resolve if active
        state.activeAlerts = state.activeAlerts.filter(a => a.zone_id !== zid);
      }
    });

    // Pedestrian Detections & Vectors
    state.pedestrians = this.agents.slice(0, 160).map(a => ({
      track_id: a.id,
      bbox: [a.x - 9, a.y - 16, a.x + 9, a.y + 16],
      confidence: 0.94,
      center: [a.x, a.y],
      velocity: [a.vx, a.vy],
      speed: a.speed,
      zone_id: a.currentZone
    }));

    // Vector Flow Field (14x14 grid)
    this.computeFlowField();
    this.computeHeatmap();
  }

  computeFlowField() {
    const cols = 14;
    const rows = 14;
    const cellW = 1000 / cols;
    const cellH = 620 / rows;
    const flow = [];

    const cellVx = Array.from({ length: rows }, () => Array(cols).fill(0));
    const cellVy = Array.from({ length: rows }, () => Array(cols).fill(0));
    const cellCounts = Array.from({ length: rows }, () => Array(cols).fill(0));

    this.agents.forEach(a => {
      const c = Math.min(cols - 1, Math.max(0, Math.floor(a.x / cellW)));
      const r = Math.min(rows - 1, Math.max(0, Math.floor(a.y / cellH)));
      cellVx[r][c] += a.vx;
      cellVy[r][c] += a.vy;
      cellCounts[r][c]++;
    });

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const count = cellCounts[r][c];
        if (count > 0) {
          const avgVx = cellVx[r][c] / count;
          const avgVy = cellVy[r][c] / count;
          flow.push({
            cx: (c + 0.5) * cellW,
            cy: (r + 0.5) * cellH,
            vx: avgVx,
            vy: avgVy,
            magnitude: Math.sqrt(avgVx * avgVx + avgVy * avgVy),
            angle_deg: (Math.atan2(avgVy, avgVx) * 180 / Math.PI + 360) % 360,
            density_count: count
          });
        }
      }
    }
    state.vectorFlow = flow;
  }

  computeHeatmap() {
    const cols = 22;
    const rows = 22;
    const cellW = 1000 / cols;
    const cellH = 620 / rows;
    const grid = Array.from({ length: rows }, () => Array(cols).fill(0));

    this.agents.forEach(a => {
      const c = Math.min(cols - 1, Math.max(0, Math.floor(a.x / cellW)));
      const r = Math.min(rows - 1, Math.max(0, Math.floor(a.y / cellH)));
      grid[r][c] += 1;
    });

    let maxVal = 1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c] > maxVal) maxVal = grid[r][c];
      }
    }

    state.densityHeatmap = grid.map(row => row.map(v => Math.min(1.0, v / Math.max(4, maxVal))));
  }

  triggerAlert(zid, z) {
    const existing = state.activeAlerts.find(a => a.zone_id === zid);
    if (existing) {
      existing.cri_score = Math.max(existing.cri_score, z.cri_score);
      existing.current_headcount = z.current_headcount;
      existing.projected_30s = z.projected_30s;
      existing.projected_60s = z.projected_60s;
      existing.time_to_breach_sec = z.time_to_breach_sec;
      return;
    }

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const breachStr = z.time_to_breach_sec ? `within ${z.time_to_breach_sec}s` : "immediately";
    const primaryRec = z.recommendations[0] || "Divert pedestrian inflow.";

    const alert = {
      id: `ALT-${zid.slice(-4).toUpperCase()}-${Math.floor(Math.random() * 9000 + 1000)}`,
      timestamp: Date.now(),
      formatted_time: timeStr,
      zone_id: zid,
      zone_name: z.zone_name,
      level: z.risk_level,
      cri_score: z.cri_score,
      current_headcount: z.current_headcount,
      max_capacity: z.max_capacity,
      projected_30s: z.projected_30s,
      projected_60s: z.projected_60s,
      time_to_breach_sec: z.time_to_breach_sec,
      message: `Predicted Bottleneck in ${z.zone_name} ${breachStr}. ${primaryRec}`,
      recommendations: z.recommendations,
      status: "ACTIVE",
      acknowledged_by: null
    };

    state.activeAlerts.unshift(alert);
    state.alertHistory.unshift(alert);
    if (state.alertHistory.length > 50) state.alertHistory.pop();

    // Play warning sound if enabled
    if (state.soundEnabled) {
      playAudioAlarm();
    }
  }
}

// Web Audio API Chime
function playAudioAlarm() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) {
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    }
  } catch (e) {}
}

const standalone = new StandaloneEngine();

// WebSocket Connection to Backend (if running)
function initWebSocket() {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const host = window.location.hostname || "localhost";
  const wsUrl = `${protocol}//${host}:8000/ws/live-feed`;

  try {
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      state.isConnected = true;
      state.usingBackend = true;
      updateHeaderBadge();
    };

    ws.onmessage = (event) => {
      try {
        const frame = JSON.parse(event.data);
        if (frame.type === "TELEMETRY_FRAME") {
          state.frameSeq = frame.frame_seq;
          state.scenario = frame.scenario;
          state.simulationSpeed = frame.simulation_speed;
          if (frame.zones) {
            frame.zones.forEach(z => { state.zones[z.zone_id] = z; });
          }
          if (frame.active_alerts) state.activeAlerts = frame.active_alerts;
          if (frame.detections) state.pedestrians = frame.detections;
          if (frame.vector_flow) state.vectorFlow = frame.vector_flow;
          if (frame.density_heatmap) state.densityHeatmap = frame.density_heatmap;
        }
      } catch (e) {}
    };

    ws.onclose = () => {
      state.isConnected = false;
      state.usingBackend = false;
      updateHeaderBadge();
      setTimeout(initWebSocket, 4000);
    };

    ws.onerror = () => {
      ws.close();
    };
  } catch (e) {
    state.usingBackend = false;
  }
}

// Canvas Visualizer Renderer
function renderCanvas() {
  const canvas = document.getElementById("visualizerCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;
  const sx = w / 1000;
  const sy = h / 620;

  // Background
  ctx.fillStyle = state.viewMode === "thermal" ? "#020617" : state.viewMode === "cctv" ? "#080c16" : "#050811";
  ctx.fillRect(0, 0, w, h);

  // Architectural Corridors
  ctx.strokeStyle = "#1e293b";
  ctx.lineWidth = 14 * sx;
  ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(350 * sx, 250 * sy); ctx.lineTo(600 * sx, 250 * sy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(240 * sx, 380 * sy); ctx.lineTo(240 * sx, 580 * sy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(740 * sx, 440 * sy); ctx.lineTo(740 * sx, 620 * sy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(420 * sx, 730 * sy); ctx.lineTo(580 * sx, 730 * sy); ctx.stroke();

  // Zone Boundaries
  Object.values(ZONE_CONFIGS).forEach(cfg => {
    const b = cfg.bounds;
    const zx = b.min_x * sx;
    const zy = b.min_y * sy;
    const zw = (b.max_x - b.min_x) * sx;
    const zh = (b.max_y - b.min_y) * sy;

    const zData = state.zones[cfg.id];
    const isCritical = zData && (zData.cri_score >= 85 || zData.risk_level === "CRITICAL");
    const isWarning = zData && (zData.cri_score >= 70 || zData.risk_level === "WARNING");
    const isSelected = state.selectedZone === cfg.id;

    // Fill
    ctx.fillStyle = isCritical ? "rgba(239, 68, 68, 0.14)" : isWarning ? "rgba(245, 158, 11, 0.10)" : "rgba(15, 23, 42, 0.55)";
    ctx.fillRect(zx, zy, zw, zh);

    // Border
    ctx.lineWidth = isSelected ? 2.5 : 1.5;
    ctx.strokeStyle = isCritical ? "rgba(239, 68, 68, 0.85)" : isWarning ? "rgba(245, 158, 11, 0.75)" : isSelected ? "#38bdf8" : "rgba(71, 85, 105, 0.4)";
    ctx.strokeRect(zx, zy, zw, zh);

    // Header Label Box
    ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
    ctx.fillRect(zx + 8, zy + 8, 190 * sx, 24 * sy);
    ctx.fillStyle = isCritical ? "#fca5a5" : isWarning ? "#fde047" : "#93c5fd";
    ctx.font = `bold ${Math.max(10, 11 * sx)}px monospace`;
    ctx.fillText(cfg.name.toUpperCase(), zx + 14, zy + 23 * sy);

    if (zData) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
      ctx.font = `${Math.max(9, 10 * sx)}px sans-serif`;
      ctx.fillText(`Count: ${zData.current_headcount}/${zData.max_capacity} | CRI: ${zData.cri_score.toFixed(0)}%`, zx + 14, zy + 40 * sy);
    }
  });

  // Density Heatmap Layer
  if (state.showHeatmap && state.densityHeatmap.length > 0) {
    const rows = state.densityHeatmap.length;
    const cols = state.densityHeatmap[0].length;
    const cellW = w / cols;
    const cellH = h / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const val = state.densityHeatmap[r][c];
        if (val > 0.06) {
          const cx = (c + 0.5) * cellW;
          const cy = (r + 0.5) * cellH;
          const rad = cellW * 1.5;
          const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);

          if (val > 0.7) {
            grad.addColorStop(0, `rgba(239, 68, 68, ${val * 0.42})`);
            grad.addColorStop(0.5, `rgba(245, 158, 11, ${val * 0.22})`);
            grad.addColorStop(1, "rgba(245, 158, 11, 0)");
          } else if (val > 0.35) {
            grad.addColorStop(0, `rgba(245, 158, 11, ${val * 0.32})`);
            grad.addColorStop(0.6, `rgba(16, 185, 129, ${val * 0.18})`);
            grad.addColorStop(1, "rgba(16, 185, 129, 0)");
          } else {
            grad.addColorStop(0, `rgba(6, 182, 212, ${val * 0.22})`);
            grad.addColorStop(1, "rgba(6, 182, 212, 0)");
          }
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(cx, cy, rad, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  // Macroscopic Flow Field
  if (state.showFlowField && state.vectorFlow.length > 0) {
    ctx.save();
    state.vectorFlow.forEach(vf => {
      if (vf.magnitude > 0.3) {
        const vx = vf.cx * sx;
        const vy = vf.cy * sy;
        const len = Math.min(20, vf.magnitude * 4.8) * sx;
        const rad = (vf.angle_deg * Math.PI) / 180;
        const endX = vx + Math.cos(rad) * len;
        const endY = vy + Math.sin(rad) * len;

        ctx.strokeStyle = vf.density_count > 6 ? "rgba(244, 63, 94, 0.65)" : "rgba(56, 189, 248, 0.45)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(vx, vy);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        const ah = 3.5 * sx;
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(endX - ah * Math.cos(rad - Math.PI / 6), endY - ah * Math.sin(rad - Math.PI / 6));
        ctx.moveTo(endX, endY);
        ctx.lineTo(endX - ah * Math.cos(rad + Math.PI / 6), endY - ah * Math.sin(rad + Math.PI / 6));
        ctx.stroke();
      }
    });
    ctx.restore();
  }

  // Pedestrians, Bounding Boxes & Velocity Arrows
  state.pedestrians.forEach(p => {
    const cx = p.center[0] * sx;
    const cy = p.center[1] * sy;

    // Dot
    ctx.beginPath();
    ctx.arc(cx, cy, 2.8 * sx, 0, Math.PI * 2);
    ctx.fillStyle = p.speed > 3.5 ? "#f43f5e" : "#38bdf8";
    ctx.fill();

    // Bounding Box
    if (state.showBoundingBoxes) {
      const bx = p.bbox[0] * sx;
      const by = p.bbox[1] * sy;
      const bw = (p.bbox[2] - p.bbox[0]) * sx;
      const bh = (p.bbox[3] - p.bbox[1]) * sy;

      ctx.strokeStyle = "rgba(56, 189, 248, 0.55)";
      ctx.lineWidth = 1.0;
      ctx.strokeRect(bx, by, bw, bh);

      if (p.track_id % 4 === 0) {
        ctx.fillStyle = "rgba(15, 23, 42, 0.8)";
        ctx.fillRect(bx, by - 10 * sy, 40 * sx, 10 * sy);
        ctx.fillStyle = "#38bdf8";
        ctx.font = `${Math.max(7, 8 * sx)}px monospace`;
        ctx.fillText(`P#${p.track_id}`, bx + 2, by - 2);
      }
    }

    // Velocity Vector
    if (state.showVelocityVectors && p.speed > 0.2) {
      const len = Math.min(18, p.speed * 4.2) * sx;
      const angle = Math.atan2(p.velocity[1], p.velocity[0]);
      const endX = cx + Math.cos(angle) * len;
      const endY = cy + Math.sin(angle) * len;

      ctx.strokeStyle = p.speed > 3.0 ? "#fb7185" : "#67e8f9";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      const ah = 3.2 * sx;
      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(endX - ah * Math.cos(angle - Math.PI / 6), endY - ah * Math.sin(angle - Math.PI / 6));
      ctx.moveTo(endX, endY);
      ctx.lineTo(endX - ah * Math.cos(angle + Math.PI / 6), endY - ah * Math.sin(angle + Math.PI / 6));
      ctx.stroke();
    }
  });

  // HUD Crosshairs & Cam Watermark
  ctx.strokeStyle = "rgba(56, 189, 248, 0.25)";
  ctx.lineWidth = 1;
  const bSize = 14 * sx;
  ctx.strokeRect(12, 12, bSize, bSize);
  ctx.strokeRect(w - 12 - bSize, 12, bSize, bSize);
  ctx.strokeRect(12, h - 12 - bSize, bSize, bSize);
  ctx.strokeRect(w - 12 - bSize, h - 12 - bSize, bSize, bSize);

  ctx.fillStyle = "#ef4444";
  ctx.beginPath(); ctx.arc(32 * sx, 28 * sy, 4 * sx, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#f87171";
  ctx.font = `bold ${Math.max(9, 10 * sx)}px monospace`;
  ctx.fillText("LIVE CCTV STREAM - CAM_OVERHEAD_MULTI_04", 42 * sx, 31 * sy);
}

// Update DOM UI Elements
function updateDOM() {
  updateHeaderBadge();
  updateAlertBanner();
  updateZoneCards();
  updateIncidentLog();
}

function updateHeaderBadge() {
  const peakCri = Math.max(...Object.values(state.zones).map(z => z.cri_score), 0);
  const statusPill = document.getElementById("statusPill");
  const peakCriSpan = document.getElementById("peakCriSpan");
  const totalAttendeesSpan = document.getElementById("totalAttendeesSpan");
  const wsStatusSpan = document.getElementById("wsStatusSpan");
  const activeScenarioSpan = document.getElementById("activeScenarioSpan");

  if (totalAttendeesSpan) totalAttendeesSpan.textContent = standalone.agents.length;
  if (peakCriSpan) peakCriSpan.textContent = peakCri.toFixed(1) + "%";
  if (activeScenarioSpan) activeScenarioSpan.textContent = state.scenario.replace(/_/g, " ");

  if (wsStatusSpan) {
    wsStatusSpan.innerHTML = state.usingBackend
      ? '<span class="w-2 h-2 rounded-full bg-emerald-400"></span> WS 12Hz #' + state.frameSeq
      : '<span class="w-2 h-2 rounded-full bg-cyan-400"></span> STANDALONE SIM';
  }

  if (statusPill) {
    if (peakCri >= 85 || state.activeAlerts.length > 0) {
      statusPill.className = "flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold bg-rose-500/20 text-rose-300 border-rose-500/50 glow-red animate-pulse";
      statusPill.innerHTML = ICONS.flame + '<span>CRITICAL BOTTLENECK IMMINENT</span> <span class="text-slate-400">|</span> <span>Peak CRI: ' + peakCri.toFixed(1) + '%</span>';
    } else if (peakCri >= 70) {
      statusPill.className = "flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold bg-amber-500/20 text-amber-300 border-amber-500/40 glow-amber";
      statusPill.innerHTML = ICONS.alert + '<span>ELEVATED CONGESTION RISK</span> <span class="text-slate-400">|</span> <span>Peak CRI: ' + peakCri.toFixed(1) + '%</span>';
    } else {
      statusPill.className = "flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
      statusPill.innerHTML = ICONS.check + '<span>ALL ZONES NORMAL</span> <span class="text-slate-400">|</span> <span>Peak CRI: ' + peakCri.toFixed(1) + '%</span>';
    }
  }
}

function updateAlertBanner() {
  const container = document.getElementById("alertBannerContainer");
  if (!container) return;

  if (state.activeAlerts.length === 0) {
    container.innerHTML = "";
    container.classList.add("hidden");
    return;
  }

  container.classList.remove("hidden");
  const alt = state.activeAlerts[0];
  const isCrit = alt.level === "CRITICAL";

  container.innerHTML = `
    <div class="relative overflow-hidden rounded-xl border border-rose-500/60 bg-gradient-to-r from-rose-950/85 via-[#1e101a]/90 to-[#121626]/90 p-4 sm:p-5 shadow-2xl glow-red animate-warning-pulse">
      <div class="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div class="space-y-1.5">
          <div class="flex flex-wrap items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-rose-500/30 text-rose-200 border border-rose-500/60">
              PROACTIVE BOTTLENECK WARNING
            </span>
            <span class="text-xs text-rose-300 font-mono flex items-center">${ICONS.clock} Triggered: ${alt.formatted_time}</span>
            ${alt.time_to_breach_sec !== null ? `<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse flex items-center">${ICONS.zap} T-${alt.time_to_breach_sec}s to 85% Bottleneck</span>` : ''}
            <span class="text-xs px-2 py-0.5 rounded bg-slate-900/90 text-slate-300 border border-slate-700 font-mono">CRI: ${alt.cri_score.toFixed(1)}%</span>
          </div>
          <h3 class="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
            ${isCrit ? ICONS.flame : ICONS.alert} ${alt.message}
          </h3>
          <div class="mt-2 space-y-1">
            <p class="text-xs font-semibold uppercase tracking-wider text-rose-300/90 flex items-center">
              ${ICONS.shield} Recommended Automated Mitigations:
            </p>
            <ul class="text-xs text-slate-200 space-y-1">
              ${alt.recommendations.map(r => `<li class="flex items-center gap-2 bg-slate-950/40 px-2.5 py-1 rounded border border-rose-900/40"><span class="text-rose-400">&gt;</span><span>${r}</span></li>`).join('')}
            </ul>
          </div>
        </div>
        <div class="flex flex-row lg:flex-col items-center lg:items-end justify-end gap-2.5 pt-2 lg:pt-0">
          <button onclick="acknowledgeAlert('${alt.id}')" class="px-4 py-2 rounded-lg bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/50 text-amber-200 text-xs font-bold transition flex items-center gap-1.5">
            ${ICONS.check} Acknowledge Alert
          </button>
          <button onclick="resolveAlert('${alt.id}')" class="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-lg flex items-center gap-1.5">
            ${ICONS.shield} Execute Mitigation & Clear
          </button>
        </div>
      </div>
    </div>
  `;
}

function updateZoneCards() {
  const grid = document.getElementById("zoneCardsGrid");
  if (!grid) return;

  grid.innerHTML = Object.values(state.zones).map(z => {
    const isCrit = z.risk_level === "CRITICAL" || z.cri_score >= 85;
    const isWarn = z.risk_level === "WARNING" || z.cri_score >= 70;
    const isSel = state.selectedZone === z.zone_id;

    let borderCls = isCrit ? "border-rose-500/60 glow-red" : isWarn ? "border-amber-500/50 glow-amber" : "border-slate-800/80";
    if (isSel) borderCls = "border-cyan-500 glow-cyan";
    let badgeCls = isCrit ? "bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse" : isWarn ? "bg-amber-500/20 text-amber-300 border-amber-500/40" : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    let barCls = isCrit ? "bg-gradient-to-r from-rose-600 to-rose-400" : isWarn ? "bg-gradient-to-r from-amber-500 to-yellow-400" : "bg-emerald-500";
    let criColor = isCrit ? "text-rose-400" : isWarn ? "text-amber-400" : "text-emerald-400";

    return `
      <div onclick="selectZone('${z.zone_id}')" class="relative rounded-xl bg-[#0c1220]/90 backdrop-blur border p-4 transition-all duration-200 cursor-pointer ${borderCls}">
        <div class="flex items-start justify-between gap-2 mb-3">
          <div>
            <h4 class="text-sm font-bold text-white tracking-tight">${z.zone_name}</h4>
            <p class="text-[11px] text-slate-400 font-mono">Cap: ${z.max_capacity} persons</p>
          </div>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center ${badgeCls}">
            ${isCrit ? ICONS.flame : isWarn ? ICONS.alert : ICONS.check} ${z.risk_level}
          </span>
        </div>
        <div class="grid grid-cols-2 gap-3 mb-3">
          <div class="bg-slate-900/80 rounded-lg p-2.5 border border-slate-800">
            <span class="text-[10px] uppercase font-semibold text-slate-400 tracking-wider flex items-center">${ICONS.users} Headcount</span>
            <div class="flex items-baseline gap-1.5 mt-1">
              <span class="text-2xl font-black font-mono text-white">${z.current_headcount}</span>
              <span class="text-[11px] text-slate-400 font-mono">/ ${z.max_capacity}</span>
            </div>
            <span class="text-[10px] text-slate-400 font-mono">${z.occupancy_pct}% load</span>
          </div>
          <div class="bg-slate-900/80 rounded-lg p-2.5 border border-slate-800">
            <span class="text-[10px] uppercase font-semibold text-slate-400 tracking-wider flex items-center">${ICONS.trending} CRI Score</span>
            <div class="flex items-baseline gap-1 mt-1">
              <span class="text-2xl font-black font-mono ${criColor}">${z.cri_score.toFixed(1)}%</span>
            </div>
            <div class="text-[10px] text-slate-400 font-mono">
              Accel: <span class="${z.acceleration_per_sec2 > 0 ? 'text-rose-400' : 'text-emerald-400'}">${z.acceleration_per_sec2 > 0 ? '+' : ''}${z.acceleration_per_sec2.toFixed(2)}/s²</span>
            </div>
          </div>
        </div>
        <div class="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden mb-3">
          <div class="h-full rounded-full transition-all duration-300 ${barCls}" style="width: ${Math.min(100, z.occupancy_pct)}%"></div>
        </div>
        <div class="flex items-center justify-between text-[11px] font-mono px-2 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800/60 mb-3">
          <span class="text-emerald-400">&uarr; In: ${z.inflow_rate_per_min}/min</span>
          <span class="text-sky-400">&darr; Out: ${z.outflow_rate_per_min}/min</span>
          <span class="text-slate-400">Net: ${z.net_flow_per_sec >= 0 ? '+' : ''}${z.net_flow_per_sec}/s</span>
        </div>
        <div class="bg-slate-950/60 rounded-lg p-2 border border-slate-800/80 text-xs space-y-1 mb-3">
          <div class="flex items-center justify-between text-[11px] font-semibold text-slate-300">
            <span class="text-cyan-400 flex items-center">${ICONS.zap} Forecast:</span>
            ${z.time_to_breach_sec !== null ? `<span class="text-[10px] text-rose-400 font-mono font-bold animate-pulse">Breach in ~${z.time_to_breach_sec}s</span>` : ''}
          </div>
          <div class="grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div class="bg-slate-900/90 px-2 py-1 rounded border border-slate-800 flex justify-between">
              <span class="text-slate-400">T+30s:</span>
              <span class="font-bold ${z.projected_30s_pct >= 85 ? 'text-rose-400' : 'text-slate-200'}">${z.projected_30s} (${z.projected_30s_pct}%)</span>
            </div>
            <div class="bg-slate-900/90 px-2 py-1 rounded border border-slate-800 flex justify-between">
              <span class="text-slate-400">T+60s:</span>
              <span class="font-bold ${z.projected_60s_pct >= 85 ? 'text-rose-400' : 'text-slate-200'}">${z.projected_60s} (${z.projected_60s_pct}%)</span>
            </div>
          </div>
        </div>
        <button onclick="event.stopPropagation(); spikeZone('${z.zone_id}', 25)" class="w-full py-1.5 px-2 rounded text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center justify-center gap-1.5 border border-slate-700">
          <span class="text-cyan-400 font-bold">+</span> Test Inflow Surge (+25)
        </button>
      </div>
    `;
  }).join('');
}

function updateIncidentLog() {
  const tbody = document.getElementById("incidentLogTableBody");
  if (!tbody) return;

  if (state.alertHistory.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="py-8 text-center text-slate-500">No Incidents Recorded. System Operating Normally.</td></tr>';
    return;
  }

  tbody.innerHTML = state.alertHistory.slice(0, 20).map(a => {
    let stCls = a.status === "ACTIVE" ? "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse" : a.status === "ACKNOWLEDGED" ? "bg-sky-500/20 text-sky-300 border-sky-500/40" : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
    return `
      <tr class="hover:bg-slate-900/40 transition">
        <td class="py-3 px-3 font-mono font-bold text-slate-200">${a.id}</td>
        <td class="py-3 px-3 font-mono text-slate-400 whitespace-nowrap">${a.formatted_time}</td>
        <td class="py-3 px-3 font-semibold text-white whitespace-nowrap">${a.zone_name}</td>
        <td class="py-3 px-3 font-mono font-bold"><span class="${a.cri_score >= 85 ? 'text-rose-400' : 'text-amber-400'}">${a.cri_score.toFixed(1)}%</span></td>
        <td class="py-3 px-3 whitespace-nowrap"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold border ${stCls}">${a.status}</span></td>
        <td class="py-3 px-3 text-slate-300 max-w-md"><p class="line-clamp-2 leading-relaxed">${a.message}</p></td>
        <td class="py-3 px-3 text-right whitespace-nowrap">
          ${a.status === "ACTIVE" ? `
            <button onclick="acknowledgeAlert('${a.id}')" class="px-2 py-1 rounded bg-amber-600/30 hover:bg-amber-600/50 text-amber-200 border border-amber-500/40 text-[11px] font-semibold">Ack</button>
            <button onclick="resolveAlert('${a.id}')" class="px-2 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-semibold ml-1">Resolve</button>
          ` : a.status === "ACKNOWLEDGED" ? `
            <button onclick="resolveAlert('${a.id}')" class="px-2 py-1 rounded bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 border border-emerald-500/40 text-[11px] font-semibold">Mark Resolved</button>
          ` : '<span class="text-emerald-400 font-mono text-[11px] flex items-center justify-end">' + ICONS.check + ' Resolved</span>'}
        </td>
      </tr>
    `;
  }).join('');
}

// Chart.js Setup
function initCharts() {
  if (typeof Chart === "undefined") return;

  const ctxProj = document.getElementById("chartForecastProjections")?.getContext("2d");
  const ctxHist = document.getElementById("chartHeadcountTimeline")?.getContext("2d");
  const ctxFlow = document.getElementById("chartFlowRates")?.getContext("2d");
  const ctxCri = document.getElementById("chartCriTimeline")?.getContext("2d");

  if (ctxProj) {
    state.charts.proj = new Chart(ctxProj, {
      type: "bar",
      data: {
        labels: ["Gate A", "Main Arena", "Food Court", "Exit Corridor"],
        datasets: [
          { label: "Current Count", data: [40, 140, 65, 32], backgroundColor: "#38bdf8", borderRadius: 4 },
          { label: "Projected (T+30s)", data: [50, 160, 80, 40], backgroundColor: "#f59e0b", borderRadius: 4 },
          { label: "Projected (T+60s)", data: [58, 175, 95, 48], backgroundColor: "#ef4444", borderRadius: 4 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: "#94a3b8", font: { size: 11 } } } },
        scales: {
          x: { ticks: { color: "#64748b" }, grid: { color: "#1e293b" } },
          y: { ticks: { color: "#64748b" }, grid: { color: "#1e293b" } }
        }
      }
    });
  }

  if (ctxHist) {
    state.charts.hist = new Chart(ctxHist, {
      type: "line",
      data: {
        labels: [],
        datasets: [
          { label: "Gate A", data: [], borderColor: "#3b82f6", borderWidth: 2, tension: 0.3, pointRadius: 0 },
          { label: "Main Arena", data: [], borderColor: "#8b5cf6", borderWidth: 2, tension: 0.3, pointRadius: 0 },
          { label: "Food Court", data: [], borderColor: "#ec4899", borderWidth: 2, tension: 0.3, pointRadius: 0 },
          { label: "Exit Corridor", data: [], borderColor: "#f59e0b", borderWidth: 2, tension: 0.3, pointRadius: 0 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: "#94a3b8", font: { size: 11 } } } },
        scales: {
          x: { ticks: { color: "#64748b" }, grid: { color: "#1e293b" } },
          y: { ticks: { color: "#64748b" }, grid: { color: "#1e293b" } }
        }
      }
    });
  }

  if (ctxFlow) {
    state.charts.flow = new Chart(ctxFlow, {
      type: "bar",
      data: {
        labels: ["Gate A", "Main Arena", "Food Court", "Exit Corridor"],
        datasets: [
          { label: "Inflow / min", data: [20, 40, 30, 15], backgroundColor: "#10b981", borderRadius: 4 },
          { label: "Outflow / min", data: [15, 35, 22, 12], backgroundColor: "#0284c7", borderRadius: 4 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: "#94a3b8", font: { size: 11 } } } },
        scales: {
          x: { ticks: { color: "#64748b" }, grid: { color: "#1e293b" } },
          y: { ticks: { color: "#64748b" }, grid: { color: "#1e293b" } }
        }
      }
    });
  }

  if (ctxCri) {
    state.charts.cri = new Chart(ctxCri, {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: "Peak CRI Score (%)",
            data: [],
            borderColor: "#ef4444",
            backgroundColor: "rgba(239, 68, 68, 0.15)",
            fill: true,
            borderWidth: 2,
            tension: 0.3,
            pointRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: "#94a3b8", font: { size: 11 } } } },
        scales: {
          x: { ticks: { color: "#64748b" }, grid: { color: "#1e293b" } },
          y: { min: 0, max: 100, ticks: { color: "#64748b" }, grid: { color: "#1e293b" } }
        }
      }
    });
  }
}

function updateCharts() {
  const zList = [
    state.zones.zone_gate_a,
    state.zones.zone_main_arena,
    state.zones.zone_food_court,
    state.zones.zone_exit_corridor
  ];

  // Bar Forecast Projections
  if (state.charts.proj) {
    state.charts.proj.data.datasets[0].data = zList.map(z => z.current_headcount);
    state.charts.proj.data.datasets[1].data = zList.map(z => z.projected_30s);
    state.charts.proj.data.datasets[2].data = zList.map(z => z.projected_60s);
    state.charts.proj.update('none');
  }

  // Flow Rates
  if (state.charts.flow) {
    state.charts.flow.data.datasets[0].data = zList.map(z => z.inflow_rate_per_min);
    state.charts.flow.data.datasets[1].data = zList.map(z => z.outflow_rate_per_min);
    state.charts.flow.update('none');
  }

  // Rolling Timelines
  const now = new Date();
  const timeStr = `${now.getMinutes()}:${String(now.getSeconds()).padStart(2, '0')}`;
  const peakCri = Math.max(...zList.map(z => z.cri_score), 0);

  state.historyData.times.push(timeStr);
  state.historyData.gateA.push(state.zones.zone_gate_a.current_headcount);
  state.historyData.arena.push(state.zones.zone_main_arena.current_headcount);
  state.historyData.foodCourt.push(state.zones.zone_food_court.current_headcount);
  state.historyData.exitCorridor.push(state.zones.zone_exit_corridor.current_headcount);
  state.historyData.criMax.push(peakCri);

  if (state.historyData.times.length > 18) {
    state.historyData.times.shift();
    state.historyData.gateA.shift();
    state.historyData.arena.shift();
    state.historyData.foodCourt.shift();
    state.historyData.exitCorridor.shift();
    state.historyData.criMax.shift();
  }

  if (state.charts.hist) {
    state.charts.hist.data.labels = [...state.historyData.times];
    state.charts.hist.data.datasets[0].data = [...state.historyData.gateA];
    state.charts.hist.data.datasets[1].data = [...state.historyData.arena];
    state.charts.hist.data.datasets[2].data = [...state.historyData.foodCourt];
    state.charts.hist.data.datasets[3].data = [...state.historyData.exitCorridor];
    state.charts.hist.update('none');
  }

  if (state.charts.cri) {
    state.charts.cri.data.labels = [...state.historyData.times];
    state.charts.cri.data.datasets[0].data = [...state.historyData.criMax];
    state.charts.cri.update('none');
  }
}

// User Action Handlers
window.selectZone = function(zid) {
  state.selectedZone = state.selectedZone === zid ? null : zid;
  updateZoneCards();
};

window.spikeZone = function(zid, count) {
  if (state.usingBackend) {
    fetch("http://localhost:8000/api/simulation/spike", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ zone_id: zid, count: count || 35 })
    }).catch(() => {});
  }
  standalone.injectSpike(zid, count || 35);
};

window.setScenario = function(sc) {
  if (state.usingBackend) {
    fetch("http://localhost:8000/api/simulation/scenario", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenario: sc })
    }).catch(() => {});
  }
  standalone.setScenario(sc);
  updateDOM();
};

window.setSpeed = function(spd) {
  state.simulationSpeed = spd;
  document.querySelectorAll(".speed-btn").forEach(btn => {
    btn.classList.toggle("bg-cyan-600", parseFloat(btn.dataset.speed) === spd);
    btn.classList.toggle("text-white", parseFloat(btn.dataset.speed) === spd);
  });
  if (state.usingBackend) {
    fetch("http://localhost:8000/api/simulation/speed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ speed: spd })
    }).catch(() => {});
  }
};

window.adjustCapacity = function(zid, delta) {
  const cfg = ZONE_CONFIGS[zid];
  if (cfg) {
    cfg.max_capacity = Math.max(20, cfg.max_capacity + delta);
    state.zones[zid].max_capacity = cfg.max_capacity;
    const span = document.getElementById(`capSpan_${zid}`);
    if (span) span.textContent = cfg.max_capacity;
  }
};

window.resetSimulation = function() {
  standalone.reset();
  if (state.usingBackend) {
    fetch("http://localhost:8000/api/simulation/reset", { method: "POST" }).catch(() => {});
  }
  updateDOM();
};

window.acknowledgeAlert = function(id) {
  const alt = state.activeAlerts.find(a => a.id === id);
  if (alt) alt.status = "ACKNOWLEDGED";
  const hist = state.alertHistory.find(a => a.id === id);
  if (hist) hist.status = "ACKNOWLEDGED";
  updateDOM();
};

window.resolveAlert = function(id) {
  state.activeAlerts = state.activeAlerts.filter(a => a.id !== id);
  const hist = state.alertHistory.find(a => a.id === id);
  if (hist) hist.status = "RESOLVED";
  updateDOM();
};

window.toggleSound = function() {
  state.soundEnabled = !state.soundEnabled;
  const btn = document.getElementById("soundToggleBtn");
  if (btn) {
    btn.classList.toggle("bg-cyan-950/60", state.soundEnabled);
    btn.classList.toggle("border-cyan-800/80", state.soundEnabled);
    btn.classList.toggle("text-cyan-300", state.soundEnabled);
    btn.innerHTML = state.soundEnabled ? ICONS.soundOn + ' Sound: ON' : ICONS.soundOff + ' Sound: OFF';
  }
};

window.switchTab = function(tabId) {
  state.activeTab = tabId;
  document.querySelectorAll(".tab-content").forEach(el => el.classList.add("hidden"));
  document.querySelectorAll(".nav-tab-btn").forEach(btn => {
    btn.classList.remove("bg-cyan-500/15", "text-cyan-300", "border-cyan-500/30");
    btn.classList.add("text-slate-400");
  });

  const activeContent = document.getElementById(`tab_${tabId}`);
  if (activeContent) activeContent.classList.remove("hidden");

  const activeBtn = document.getElementById(`btnTab_${tabId}`);
  if (activeBtn) {
    activeBtn.classList.add("bg-cyan-500/15", "text-cyan-300", "border-cyan-500/30");
    activeBtn.classList.remove("text-slate-400");
  }

  // Force chart layout recalculation if opening analytics tab
  if (tabId === "analytics" && state.charts.proj) {
    setTimeout(() => {
      Object.values(state.charts).forEach(c => c && c.resize());
    }, 100);
  }
};

window.toggleOverlay = function(overlay) {
  if (overlay === "bbox") state.showBoundingBoxes = !state.showBoundingBoxes;
  if (overlay === "vec") state.showVelocityVectors = !state.showVelocityVectors;
  if (overlay === "flow") state.showFlowField = !state.showFlowField;
  if (overlay === "heat") state.showHeatmap = !state.showHeatmap;

  const btn = document.getElementById(`btn_${overlay}`);
  if (btn) {
    const val = overlay === "bbox" ? state.showBoundingBoxes : overlay === "vec" ? state.showVelocityVectors : overlay === "flow" ? state.showFlowField : state.showHeatmap;
    btn.classList.toggle("bg-cyan-950/80", val);
    btn.classList.toggle("border-cyan-600", val);
    btn.classList.toggle("text-cyan-300", val);
    btn.classList.toggle("bg-slate-950", !val);
    btn.classList.toggle("text-slate-500", !val);
  }
};

window.setViewMode = function(mode) {
  state.viewMode = mode;
  document.querySelectorAll(".mode-btn").forEach(btn => {
    btn.classList.toggle("bg-cyan-600", btn.dataset.mode === mode);
    btn.classList.toggle("text-white", btn.dataset.mode === mode);
  });
};

// Main Animation and Telemetry Loop
let lastFrameTime = performance.now();
let lastChartUpdate = performance.now();

function mainLoop(now) {
  const dt = Math.min(0.1, (now - lastFrameTime) / 1000);
  lastFrameTime = now;

  // Step standalone simulation if not overridden by active backend frames
  if (!state.usingBackend) {
    standalone.step(dt);
  }

  // Render 2D Canvas
  renderCanvas();

  // Update Charts at 1 Hz for smooth animation
  if (now - lastChartUpdate > 1000) {
    updateCharts();
    lastChartUpdate = now;
  }

  // Update DOM at ~12 Hz
  updateDOM();

  requestAnimationFrame(mainLoop);
}

// Initialize on DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  initWebSocket();
  initCharts();
  updateDOM();
  requestAnimationFrame(mainLoop);
});

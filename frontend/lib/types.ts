export interface ZoneMetric {
  zone_id: string;
  zone_name: string;
  current_headcount: number;
  max_capacity: number;
  occupancy_pct: number;
  inflow_rate_per_min: number;
  outflow_rate_per_min: number;
  net_flow_per_sec: number;
  acceleration_per_sec2: number;
  projected_30s: number;
  projected_60s: number;
  projected_30s_pct: number;
  projected_60s_pct: number;
  cri_score: number;
  risk_level: "NORMAL" | "WARNING" | "CRITICAL";
  time_to_breach_sec: number | null;
  active_alert: ProactiveAlert | null;
  recommendations: string[];
}

export interface ProactiveAlert {
  id: string;
  timestamp: number;
  formatted_time: string;
  zone_id: string;
  zone_name: string;
  level: "CRITICAL" | "WARNING";
  cri_score: number;
  current_headcount: number;
  max_capacity: number;
  projected_30s: number;
  projected_60s: number;
  time_to_breach_sec: number | null;
  title: string;
  message: string;
  recommendations: string[];
  status: "ACTIVE" | "ACKNOWLEDGED" | "RESOLVED";
  resolved_at: number | null;
  acknowledged_by: string | null;
}

export interface Detection {
  track_id: number;
  bbox: [number, number, number, number]; // [x1, y1, x2, y2]
  confidence: number;
  class_name: string;
  center: [number, number];
  velocity: [number, number]; // [vx, vy]
  speed: number;
  zone_id: string | null;
}

export interface VectorFlowCell {
  grid_x: number;
  grid_y: number;
  cx: number;
  cy: number;
  vx: number;
  vy: number;
  magnitude: number;
  angle_deg: number;
  density_count: number;
}

export interface TelemetryFrame {
  type: string;
  frame_seq: number;
  timestamp: number;
  scenario: string;
  simulation_speed: number;
  total_attendees: number;
  zones: ZoneMetric[];
  active_alerts: ProactiveAlert[];
  detections: Detection[];
  vector_flow: VectorFlowCell[];
  density_heatmap: number[][];
}

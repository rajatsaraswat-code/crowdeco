"use client";

import React, { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import PredictiveAlertBanner from "@/components/PredictiveAlertBanner";
import ZoneOverviewGrid from "@/components/ZoneOverviewGrid";
import LiveFeedCanvas from "@/components/LiveFeedCanvas";
import AnalyticsCharts from "@/components/AnalyticsCharts";
import SimulationControlPanel from "@/components/SimulationControlPanel";
import AlertHistoryDrawer from "@/components/AlertHistoryDrawer";
import {
  ZoneMetric,
  ProactiveAlert,
  Detection,
  VectorFlowCell,
  TelemetryFrame,
} from "@/lib/types";

// Default fallback data for initial render before WebSocket frame arrives
const INITIAL_ZONES: ZoneMetric[] = [
  {
    zone_id: "zone_gate_a",
    zone_name: "Gate A - Main Entrance",
    current_headcount: 45,
    max_capacity: 130,
    occupancy_pct: 34.6,
    inflow_rate_per_min: 24.0,
    outflow_rate_per_min: 18.0,
    net_flow_per_sec: 0.1,
    acceleration_per_sec2: 0.01,
    projected_30s: 52,
    projected_60s: 60,
    projected_30s_pct: 40.0,
    projected_60s_pct: 46.2,
    cri_score: 41.5,
    risk_level: "NORMAL",
    time_to_breach_sec: null,
    active_alert: null,
    recommendations: ["Open auxiliary turnstiles #4 and #5 to alleviate queue buildup."],
  },
  {
    zone_id: "zone_main_arena",
    zone_name: "Main Arena Concourse",
    current_headcount: 140,
    max_capacity: 360,
    occupancy_pct: 38.9,
    inflow_rate_per_min: 42.0,
    outflow_rate_per_min: 36.0,
    net_flow_per_sec: 0.1,
    acceleration_per_sec2: -0.02,
    projected_30s: 154,
    projected_60s: 168,
    projected_30s_pct: 42.8,
    projected_60s_pct: 46.7,
    cri_score: 44.2,
    risk_level: "NORMAL",
    time_to_breach_sec: null,
    active_alert: null,
    recommendations: ["Halt incoming escalator flow from Mezzanine corridor."],
  },
  {
    zone_id: "zone_food_court",
    zone_name: "Food Court - Zone B",
    current_headcount: 65,
    max_capacity: 170,
    occupancy_pct: 38.2,
    inflow_rate_per_min: 28.0,
    outflow_rate_per_min: 20.0,
    net_flow_per_sec: 0.13,
    acceleration_per_sec2: 0.03,
    projected_30s: 75,
    projected_60s: 88,
    projected_30s_pct: 44.1,
    projected_60s_pct: 51.8,
    cri_score: 48.0,
    risk_level: "NORMAL",
    time_to_breach_sec: null,
    active_alert: null,
    recommendations: ["Activate secondary exit corridor adjacent to Concession #3."],
  },
  {
    zone_id: "zone_exit_corridor",
    zone_name: "Exit Corridor & South Egress",
    current_headcount: 32,
    max_capacity: 95,
    occupancy_pct: 33.7,
    inflow_rate_per_min: 18.0,
    outflow_rate_per_min: 15.0,
    net_flow_per_sec: 0.05,
    acceleration_per_sec2: 0.01,
    projected_30s: 38,
    projected_60s: 44,
    projected_30s_pct: 40.0,
    projected_60s_pct: 46.3,
    cri_score: 42.5,
    risk_level: "NORMAL",
    time_to_breach_sec: null,
    active_alert: null,
    recommendations: ["Release emergency magnetic door latches on secondary Egress Gate 2."],
  },
];

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [frameSeq, setFrameSeq] = useState(0);
  const [totalAttendees, setTotalAttendees] = useState(250);
  const [scenario, setScenario] = useState("NORMAL_EVENT_FLOW");
  const [simSpeed, setSimSpeed] = useState(1.0);
  const [zones, setZones] = useState<ZoneMetric[]>(INITIAL_ZONES);
  const [activeAlerts, setActiveAlerts] = useState<ProactiveAlert[]>([]);
  const [alertHistory, setAlertHistory] = useState<ProactiveAlert[]>([]);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [vectorFlow, setVectorFlow] = useState<VectorFlowCell[]>([]);
  const [densityHeatmap, setDensityHeatmap] = useState<number[][]>([]);
  
  // UI State
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [soundEnabled, setSoundEnabled] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);

  // Connect to backend WebSocket
  useEffect(() => {
    let isSubscribed = true;
    let reconnectTimeout: NodeJS.Timeout;

    const connectWs = () => {
      // Connect to port 8000
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = window.location.hostname || "localhost";
      const wsUrl = `${protocol}//${host}:8000/ws/live-feed`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!isSubscribed) return;
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        if (!isSubscribed) return;
        try {
          const frame: TelemetryFrame = JSON.parse(event.data);
          if (frame.type === "TELEMETRY_FRAME") {
            setFrameSeq(frame.frame_seq);
            setTotalAttendees(frame.total_attendees);
            setScenario(frame.scenario);
            setSimSpeed(frame.simulation_speed);
            if (frame.zones && frame.zones.length > 0) {
              setZones(frame.zones);
            }
            if (frame.active_alerts) {
              setActiveAlerts(frame.active_alerts);
            }
            if (frame.detections) {
              setDetections(frame.detections);
            }
            if (frame.vector_flow) {
              setVectorFlow(frame.vector_flow);
            }
            if (frame.density_heatmap) {
              setDensityHeatmap(frame.density_heatmap);
            }
          }
        } catch (e) {
          // ignore frame parse glitch
        }
      };

      ws.onclose = () => {
        if (!isSubscribed) return;
        setIsConnected(false);
        reconnectTimeout = setTimeout(connectWs, 2000);
      };

      ws.onerror = () => {
        ws.close();
      };
    };

    connectWs();

    // Also poll alert history periodically
    const historyInterval = setInterval(async () => {
      try {
        const host = window.location.hostname || "localhost";
        const res = await fetch(`http://${host}:8000/api/alerts`);
        if (res.ok) {
          const data = await res.json();
          setAlertHistory(data.alert_history || []);
        }
      } catch (e) {
        // ignore
      }
    }, 2500);

    return () => {
      isSubscribed = false;
      clearTimeout(reconnectTimeout);
      clearInterval(historyInterval);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // API Control Actions
  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      const host = window.location.hostname || "localhost";
      await fetch(`http://${host}:8000/api/alerts/${alertId}/acknowledge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operator_name: "Control Lead Alpha" }),
      });
      // Locally update
      setActiveAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, status: "ACKNOWLEDGED" } : a))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleResolveAlert = async (alertId: string, actionTaken: string) => {
    try {
      const host = window.location.hostname || "localhost";
      await fetch(`http://${host}:8000/api/alerts/${alertId}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action_taken: actionTaken,
          operator_name: "Control Lead Alpha",
        }),
      });
      // Locally clear active
      setActiveAlerts((prev) => prev.filter((a) => a.id !== alertId));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSetScenario = async (newScenario: string) => {
    try {
      const host = window.location.hostname || "localhost";
      await fetch(`http://${host}:8000/api/simulation/scenario`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario: newScenario }),
      });
      setScenario(newScenario);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSetSpeed = async (newSpeed: number) => {
    try {
      const host = window.location.hostname || "localhost";
      await fetch(`http://${host}:8000/api/simulation/speed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ speed: newSpeed }),
      });
      setSimSpeed(newSpeed);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSpikeCrowd = async (zoneId: string, count: number) => {
    try {
      const host = window.location.hostname || "localhost";
      await fetch(`http://${host}:8000/api/simulation/spike`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zone_id: zoneId, count }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleAdjustCapacity = async (zoneId: string, newCapacity: number) => {
    try {
      const host = window.location.hostname || "localhost";
      await fetch(`http://${host}:8000/api/simulation/capacity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zone_id: zoneId, new_capacity: newCapacity }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetSimulation = async () => {
    try {
      const host = window.location.hostname || "localhost";
      await fetch(`http://${host}:8000/api/simulation/reset`, {
        method: "POST",
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Peak CRI calculation
  const highestCri = zones.reduce((max, z) => Math.max(max, z.cri_score), 0);

  return (
    <main className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col">
      {/* Top Tactical Navigation & Operations Header */}
      <Header
        isConnected={isConnected}
        frameSeq={frameSeq}
        totalAttendees={totalAttendees}
        highestCri={highestCri}
        criticalAlertCount={activeAlerts.length}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        scenario={scenario}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
        
        {/* High-Priority Proactive Bottleneck Alert Banner */}
        <PredictiveAlertBanner
          alerts={activeAlerts}
          soundEnabled={soundEnabled}
          onAcknowledge={handleAcknowledgeAlert}
          onResolve={handleResolveAlert}
        />

        {/* Tab Content Routing */}
        {activeTab === "dashboard" && (
          <>
            {/* Multi-Zone Interactive Grid Cards */}
            <ZoneOverviewGrid
              zones={zones}
              selectedZone={selectedZone}
              onSelectZone={(zid) => setSelectedZone(selectedZone === zid ? null : zid)}
              onSpikeZone={handleSpikeCrowd}
            />

            {/* Live Camera Video / Simulation Canvas with Bounding Boxes & Flow Vectors */}
            <LiveFeedCanvas
              zones={zones}
              detections={detections}
              vectorFlow={vectorFlow}
              densityHeatmap={densityHeatmap}
              selectedZone={selectedZone}
              onSelectZone={(zid) => setSelectedZone(selectedZone === zid ? null : zid)}
            />

            {/* Real-time Dynamic Charts */}
            <AnalyticsCharts zones={zones} selectedZone={selectedZone} />

            {/* Quick Testing Simulation Deck */}
            <SimulationControlPanel
              currentScenario={scenario}
              simSpeed={simSpeed}
              zones={zones}
              onSetScenario={handleSetScenario}
              onSetSpeed={handleSetSpeed}
              onSpikeCrowd={handleSpikeCrowd}
              onAdjustCapacity={handleAdjustCapacity}
              onReset={handleResetSimulation}
            />
          </>
        )}

        {activeTab === "analytics" && (
          <>
            {/* Analytics Focus View */}
            <ZoneOverviewGrid
              zones={zones}
              selectedZone={selectedZone}
              onSelectZone={(zid) => setSelectedZone(selectedZone === zid ? null : zid)}
              onSpikeZone={handleSpikeCrowd}
            />
            <AnalyticsCharts zones={zones} selectedZone={selectedZone} />
          </>
        )}

        {activeTab === "alerts" && (
          <AlertHistoryDrawer
            alerts={alertHistory.length > 0 ? alertHistory : activeAlerts}
            onAcknowledge={handleAcknowledgeAlert}
            onResolve={handleResolveAlert}
          />
        )}

        {activeTab === "simulation" && (
          <>
            <SimulationControlPanel
              currentScenario={scenario}
              simSpeed={simSpeed}
              zones={zones}
              onSetScenario={handleSetScenario}
              onSetSpeed={handleSetSpeed}
              onSpikeCrowd={handleSpikeCrowd}
              onAdjustCapacity={handleAdjustCapacity}
              onReset={handleResetSimulation}
            />
            <LiveFeedCanvas
              zones={zones}
              detections={detections}
              vectorFlow={vectorFlow}
              densityHeatmap={densityHeatmap}
              selectedZone={selectedZone}
              onSelectZone={(zid) => setSelectedZone(selectedZone === zid ? null : zid)}
            />
          </>
        )}

      </div>

      {/* Footer System Status Bar */}
      <footer className="border-t border-slate-800/80 bg-[#090d18] py-3 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <span>Campus Sentinel Autonomous Safety Engine • Powered by Next.js, FastAPI & OpenCV/YOLO Vector Field</span>
          <div className="flex items-center gap-3 font-mono">
            <span>Latency: ~12ms</span>
            <span>Spatial Model: 2nd-order Taylor Kinetic Projection</span>
          </div>
        </div>
      </footer>
    </main>
  );
}

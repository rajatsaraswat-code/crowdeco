"use client";

import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  Activity,
  BarChart3,
  Clock,
  Zap,
} from "lucide-react";
import { ZoneMetric } from "@/lib/types";

interface AnalyticsChartsProps {
  zones: ZoneMetric[];
  selectedZone: string | null;
}

interface HistoryPoint {
  time: string;
  gateA: number;
  arena: number;
  foodCourt: number;
  exitCorridor: number;
  criMax: number;
}

export default function AnalyticsCharts({ zones, selectedZone }: AnalyticsChartsProps) {
  const [history, setHistory] = useState<HistoryPoint[]>([]);

  // Collect rolling history data points
  useEffect(() => {
    if (zones.length === 0) return;

    const now = new Date();
    const timeStr = `${now.getMinutes()}:${now.getSeconds() < 10 ? "0" : ""}${now.getSeconds()}`;

    const gate = zones.find((z) => z.zone_id === "zone_gate_a")?.current_headcount || 0;
    const arena = zones.find((z) => z.zone_id === "zone_main_arena")?.current_headcount || 0;
    const food = zones.find((z) => z.zone_id === "zone_food_court")?.current_headcount || 0;
    const exit = zones.find((z) => z.zone_id === "zone_exit_corridor")?.current_headcount || 0;
    const maxCri = Math.max(...zones.map((z) => z.cri_score), 0);

    const newPt: HistoryPoint = {
      time: timeStr,
      gateA: gate,
      arena: arena,
      foodCourt: food,
      exitCorridor: exit,
      criMax: maxCri,
    };

    setHistory((prev) => {
      const updated = [...prev, newPt];
      return updated.slice(-18); // Keep last 18 rolling data points
    });
  }, [zones]);

  // Forecast Comparison Data for Zones
  const forecastComparisonData = zones.map((z) => ({
    name: z.zone_name.split(" - ")[0],
    current: z.current_headcount,
    proj30: z.projected_30s,
    proj60: z.projected_60s,
    capacity: z.max_capacity,
    cri: z.cri_score,
  }));

  // Inflow vs Outflow Rates
  const flowRatesData = zones.map((z) => ({
    name: z.zone_name.split(" - ")[0],
    inflow: z.inflow_rate_per_min,
    outflow: z.outflow_rate_per_min,
    net: z.net_flow_per_sec,
  }));

  return (
    <div className="space-y-6 mb-6">
      
      {/* Chart Row 1: Kinetic Forecast Projection & Headcount Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Kinetic Forecast vs Capacity Comparison */}
        <div className="rounded-xl border border-slate-800 bg-[#0c1220]/90 p-4 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white tracking-tight">
                Predictive Headcount Projections (T+30s & T+60s)
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Capacity Limit Thresholds
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={forecastComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }}
                  itemStyle={{ color: "#f8fafc" }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Bar dataKey="current" name="Current Count" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="proj30" name="Projected (T+30s)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="proj60" name="Projected (T+60s)" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Rolling Headcount Timeline */}
        <div className="rounded-xl border border-slate-800 bg-[#0c1220]/90 p-4 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white tracking-tight">
                Real-Time Zone Headcount Dynamics
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Live Sensor Trajectory
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }}
                  itemStyle={{ color: "#f8fafc" }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Line type="monotone" dataKey="gateA" name="Gate A" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="arena" name="Main Arena" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="foodCourt" name="Food Court" stroke="#ec4899" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="exitCorridor" name="Exit Corridor" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Chart Row 2: Inflow vs Outflow Rate & Congestion Risk Index (CRI) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Inflow vs Outflow Rate Comparison */}
        <div className="rounded-xl border border-slate-800 bg-[#0c1220]/90 p-4 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-sky-400" />
              <h3 className="text-sm font-bold text-white tracking-tight">
                Pedestrian Flow Transfer Rates (Inflow vs Outflow / min)
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Transfer Differential
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={flowRatesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }}
                  itemStyle={{ color: "#f8fafc" }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Bar dataKey="inflow" name="Inflow Rate" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="outflow" name="Outflow Rate" fill="#0284c7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Peak Congestion Risk Index Timeline with 85% Bottleneck Reference Line */}
        <div className="rounded-xl border border-slate-800 bg-[#0c1220]/90 p-4 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-rose-400" />
              <h3 className="text-sm font-bold text-white tracking-tight">
                Congestion Risk Index (CRI) with Safety Threshold (85%)
              </h3>
            </div>
            <span className="text-[11px] font-mono text-rose-400 font-bold">
              Critical Warning Line: 85%
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="criGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }}
                  itemStyle={{ color: "#f8fafc" }}
                />
                <ReferenceLine y={85} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={2} label={{ value: "85% CRITICAL", fill: "#f87171", fontSize: 10, position: "top" }} />
                <ReferenceLine y={70} stroke="#f59e0b" strokeDasharray="3 3" strokeWidth={1.5} label={{ value: "70% WARNING", fill: "#fbbf24", fontSize: 10, position: "top" }} />
                <Area type="monotone" dataKey="criMax" name="Peak CRI Score (%)" stroke="#ef4444" fillOpacity={1} fill="url(#criGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}

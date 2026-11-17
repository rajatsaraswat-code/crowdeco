"use client";

import React, { useState } from "react";
import {
  Sliders,
  Zap,
  Flame,
  RotateCcw,
  Gauge,
  TrendingUp,
  AlertOctagon,
  Users,
  Compass,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { ZoneMetric } from "@/lib/types";

interface SimulationControlPanelProps {
  currentScenario: string;
  simSpeed: number;
  zones: ZoneMetric[];
  onSetScenario: (scenario: string) => void;
  onSetSpeed: (speed: number) => void;
  onSpikeCrowd: (zoneId: string, count: number) => void;
  onAdjustCapacity: (zoneId: string, newCapacity: number) => void;
  onReset: () => void;
}

export default function SimulationControlPanel({
  currentScenario,
  simSpeed,
  zones,
  onSetScenario,
  onSetSpeed,
  onSpikeCrowd,
  onAdjustCapacity,
  onReset,
}: SimulationControlPanelProps) {
  const [spikeCount, setSpikeCount] = useState(35);
  const [selectedSpikeZone, setSelectedSpikeZone] = useState("zone_food_court");

  const scenarios = [
    {
      id: "NORMAL_EVENT_FLOW",
      name: "Normal Event Flow",
      description: "Steady balanced circulation across concourses and amenities.",
      icon: Users,
      badge: "Baseline",
    },
    {
      id: "INFLOW_SPIKE_GATE_A",
      name: "Gate A Influx Spike",
      description: "Surge of attendees queuing at primary ticketing and security turnstiles.",
      icon: Zap,
      badge: "Inflow Stress",
    },
    {
      id: "HALFTIME_FOOD_RUSH",
      name: "Halftime Food Court Rush",
      description: "Mass migration from Main Arena into Food Court concessions.",
      icon: TrendingUp,
      badge: "Corridor Stress",
    },
    {
      id: "EMERGENCY_EGRESS_BOTTLENECK",
      name: "Emergency Egress & Stampede Bottleneck",
      description: "Rapid evacuation surge compressing into the narrow South Exit Corridor.",
      icon: Flame,
      badge: "Critical Alert Test",
    },
  ];

  return (
    <div className="rounded-xl border border-slate-800 bg-[#0c1220]/90 p-5 shadow-2xl mb-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Simulation & Synthetic Crowd Testing Control Deck
            </h3>
            <p className="text-xs text-slate-400">
              Artificially inject crowd spikes, alter pedestrian velocities, and test predictive bottleneck triggers.
            </p>
          </div>
        </div>

        {/* Reset Simulation Button */}
        <button
          onClick={onReset}
          className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition flex items-center gap-1.5 border border-slate-700"
        >
          <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
          Reset Simulation
        </button>
      </div>

      {/* Section 1: Pre-configured Scenario Injection */}
      <div className="mb-6">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          1. Select Event Crowd Dynamics Scenario
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {scenarios.map((sc) => {
            const isActive = currentScenario === sc.id;
            const Icon = sc.icon;

            return (
              <div
                key={sc.id}
                onClick={() => onSetScenario(sc.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isActive
                    ? "bg-cyan-950/60 border-cyan-500 glow-blue text-white"
                    : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700 text-slate-300"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className={`p-2 rounded-lg ${isActive ? "bg-cyan-500 text-white" : "bg-slate-800 text-slate-400"}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isActive ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/50" : "bg-slate-800 text-slate-400 border-slate-700"
                  }`}>
                    {sc.badge}
                  </span>
                </div>

                <h5 className="text-xs font-bold text-white mb-1">{sc.name}</h5>
                <p className="text-[11px] text-slate-400 leading-relaxed">{sc.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Artificial Surge Injection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-slate-800/80">
        
        {/* Instant Spike Surge Tools */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            2. Artificial Inflow Spike Injection
          </h4>
          <p className="text-xs text-slate-400">
            Rapidly inject converging pedestrians into a specific zone to test sub-second predictive warnings (T-30s / T-60s).
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedSpikeZone}
              onChange={(e) => setSelectedSpikeZone(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-medium focus:outline-none focus:border-cyan-500"
            >
              {zones.map((z) => (
                <option key={z.zone_id} value={z.zone_id}>
                  {z.zone_name} (Cap: {z.max_capacity})
                </option>
              ))}
            </select>

            <div className="flex items-center gap-1.5">
              {[25, 45, 60].map((count) => (
                <button
                  key={count}
                  onClick={() => onSpikeCrowd(selectedSpikeZone, count)}
                  className="px-3 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 text-xs font-bold transition flex items-center gap-1"
                >
                  +{count} Surge
                </button>
              ))}
            </div>
          </div>

          {/* Instant Stampede Bottleneck Trigger */}
          <div className="pt-2">
            <button
              onClick={() => onSetScenario("EMERGENCY_EGRESS_BOTTLENECK")}
              className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-600 hover:to-rose-500 text-white text-xs font-bold transition shadow-lg shadow-rose-950/60 flex items-center justify-center gap-2 glow-red"
            >
              <AlertOctagon className="w-4 h-4" />
              TRIGGER CRITICAL BOTTLENECK TEST (&gt;85% CRI FORECAST)
            </button>
          </div>
        </div>

        {/* Simulation Speed & Capacity Fine Tuning */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-cyan-400" />
            3. Simulation Speed & Capacity Limits
          </h4>

          {/* Speed Selector */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-300 font-medium">
              <span>Simulation Clock Rate</span>
              <span className="font-mono text-cyan-400 font-bold">{simSpeed.toFixed(1)}x Real-time</span>
            </div>
            <div className="flex items-center gap-2">
              {[0.5, 1.0, 1.5, 2.0, 3.0].map((spd) => (
                <button
                  key={spd}
                  onClick={() => onSetSpeed(spd)}
                  className={`flex-1 py-1.5 rounded text-xs font-mono font-bold transition border ${
                    simSpeed === spd
                      ? "bg-cyan-600 border-cyan-500 text-white"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          {/* Zone Capacity Override */}
          <div className="space-y-1.5 pt-2">
            <div className="text-xs text-slate-300 font-medium">
              Adjust Zone Max Capacity (Test Capacity Choking)
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {zones.map((z) => (
                <div key={z.zone_id} className="bg-slate-900 p-2 rounded border border-slate-800 flex items-center justify-between">
                  <span className="truncate max-w-[120px] text-slate-400">{z.zone_name.split(" - ")[0]}:</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onAdjustCapacity(z.zone_id, Math.max(30, z.max_capacity - 20))}
                      className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold"
                    >
                      -
                    </button>
                    <span className="font-mono text-white font-bold w-7 text-center">{z.max_capacity}</span>
                    <button
                      onClick={() => onAdjustCapacity(z.zone_id, z.max_capacity + 20)}
                      className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

"use client";

import React from "react";
import {
  Users,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  AlertTriangle,
  Zap,
  ShieldCheck,
  Flame,
  PlusCircle,
} from "lucide-react";
import { ZoneMetric } from "@/lib/types";

interface ZoneOverviewGridProps {
  zones: ZoneMetric[];
  selectedZone: string | null;
  onSelectZone: (zoneId: string) => void;
  onSpikeZone: (zoneId: string, count: number) => void;
}

export default function ZoneOverviewGrid({
  zones,
  selectedZone,
  onSelectZone,
  onSpikeZone,
}: ZoneOverviewGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      {zones.map((zone) => {
        const isSelected = selectedZone === zone.zone_id;
        const isCritical = zone.risk_level === "CRITICAL" || zone.cri_score >= 85;
        const isWarning = zone.risk_level === "WARNING" || zone.cri_score >= 70;

        // Color coding themes
        let badgeColor = "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
        let cardBorder = "border-slate-800/80 hover:border-slate-700";
        let progressBarColor = "bg-emerald-500";
        let criTextColor = "text-emerald-400";

        if (isCritical) {
          badgeColor = "bg-rose-500/20 text-rose-300 border-rose-500/50";
          cardBorder = "border-rose-500/60 glow-red";
          progressBarColor = "bg-gradient-to-r from-rose-600 to-rose-400";
          criTextColor = "text-rose-400";
        } else if (isWarning) {
          badgeColor = "bg-amber-500/20 text-amber-300 border-amber-500/40";
          cardBorder = "border-amber-500/50 glow-amber";
          progressBarColor = "bg-gradient-to-r from-amber-500 to-yellow-400";
          criTextColor = "text-amber-400";
        }

        if (isSelected) {
          cardBorder = "border-cyan-500 glow-blue";
        }

        return (
          <div
            key={zone.zone_id}
            onClick={() => onSelectZone(zone.zone_id)}
            className={`relative rounded-xl bg-[#0c1220]/90 backdrop-blur border p-4 transition-all duration-200 cursor-pointer ${cardBorder}`}
          >
            {/* Header: Name & Risk Badge */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                  {zone.zone_name}
                </h4>
                <p className="text-[11px] text-slate-400 font-mono">
                  Cap: {zone.max_capacity} persons
                </p>
              </div>

              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1 ${badgeColor} ${
                  isCritical ? "animate-pulse" : ""
                }`}
              >
                {isCritical ? (
                  <Flame className="w-3 h-3 text-rose-400" />
                ) : isWarning ? (
                  <AlertTriangle className="w-3 h-3 text-amber-400" />
                ) : (
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                )}
                {zone.risk_level}
              </span>
            </div>

            {/* Metrics Row: Headcount & CRI */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              
              {/* Headcount */}
              <div className="bg-slate-900/80 rounded-lg p-2.5 border border-slate-800">
                <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider flex items-center gap-1">
                  <Users className="w-3 h-3 text-cyan-400" />
                  Headcount
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-2xl font-black font-mono text-white">
                    {zone.current_headcount}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    / {zone.max_capacity}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {zone.occupancy_pct}% load
                </span>
              </div>

              {/* Congestion Risk Index */}
              <div className="bg-slate-900/80 rounded-lg p-2.5 border border-slate-800">
                <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-amber-400" />
                  CRI Score
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className={`text-2xl font-black font-mono ${criTextColor}`}>
                    {zone.cri_score.toFixed(1)}%
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                  <span>Accel:</span>
                  <span className={zone.acceleration_per_sec2 > 0 ? "text-rose-400" : "text-emerald-400"}>
                    {zone.acceleration_per_sec2 > 0 ? "+" : ""}
                    {zone.acceleration_per_sec2.toFixed(2)}/s²
                  </span>
                </div>
              </div>

            </div>

            {/* Capacity Progress Bar */}
            <div className="space-y-1 mb-3">
              <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${progressBarColor}`}
                  style={{ width: `${Math.min(100, zone.occupancy_pct)}%` }}
                />
              </div>
            </div>

            {/* Flow Dynamics: Inflow vs Outflow */}
            <div className="flex items-center justify-between text-[11px] font-mono px-2 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800/60 mb-3">
              <div className="flex items-center gap-1 text-emerald-400">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>In: {zone.inflow_rate_per_min} /min</span>
              </div>
              <div className="flex items-center gap-1 text-sky-400">
                <ArrowDownRight className="w-3.5 h-3.5" />
                <span>Out: {zone.outflow_rate_per_min} /min</span>
              </div>
              <div className="text-slate-400">
                Net: <span className={zone.net_flow_per_sec >= 0 ? "text-amber-400" : "text-emerald-400"}>
                  {zone.net_flow_per_sec >= 0 ? "+" : ""}{zone.net_flow_per_sec}/s
                </span>
              </div>
            </div>

            {/* 30s & 60s Kinetic Predictions */}
            <div className="bg-slate-950/60 rounded-lg p-2 border border-slate-800/80 text-xs space-y-1">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
                <span className="flex items-center gap-1 text-cyan-400">
                  <Zap className="w-3 h-3" /> Predictive Forecast:
                </span>
                {zone.time_to_breach_sec !== null && (
                  <span className="text-[10px] text-rose-400 font-mono font-bold animate-pulse">
                    Breach in ~{zone.time_to_breach_sec}s
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="bg-slate-900/90 px-2 py-1 rounded border border-slate-800 flex justify-between">
                  <span className="text-slate-400">T+30s:</span>
                  <span className={`font-bold ${zone.projected_30s_pct >= 85 ? "text-rose-400" : "text-slate-200"}`}>
                    {zone.projected_30s} ({zone.projected_30s_pct}%)
                  </span>
                </div>
                <div className="bg-slate-900/90 px-2 py-1 rounded border border-slate-800 flex justify-between">
                  <span className="text-slate-400">T+60s:</span>
                  <span className={`font-bold ${zone.projected_60s_pct >= 85 ? "text-rose-400" : "text-slate-200"}`}>
                    {zone.projected_60s} ({zone.projected_60s_pct}%)
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Test Spike Action */}
            <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/60">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSpikeZone(zone.zone_id, 25);
                }}
                className="w-full py-1 px-2.5 rounded text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center justify-center gap-1.5 border border-slate-700"
              >
                <PlusCircle className="w-3 h-3 text-cyan-400" />
                Test Inflow Surge (+25)
              </button>
            </div>

          </div>
        );
      })}
    </div>
  );
}

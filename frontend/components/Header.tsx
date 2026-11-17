"use client";

import React from "react";
import {
  ShieldAlert,
  Activity,
  Radio,
  Volume2,
  VolumeX,
  Users,
  Compass,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Sparkles
} from "lucide-react";

interface HeaderProps {
  isConnected: boolean;
  frameSeq: number;
  totalAttendees: number;
  highestCri: number;
  criticalAlertCount: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  scenario: string;
}

export default function Header({
  isConnected,
  frameSeq,
  totalAttendees,
  highestCri,
  criticalAlertCount,
  soundEnabled,
  onToggleSound,
  activeTab,
  setActiveTab,
  scenario
}: HeaderProps) {
  // Global Risk Assessment
  let statusBadge = {
    label: "ALL ZONES NORMAL",
    color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    icon: CheckCircle2,
    pulse: false,
  };

  if (highestCri >= 85 || criticalAlertCount > 0) {
    statusBadge = {
      label: "CRITICAL BOTTLENECK IMMINENT",
      color: "bg-rose-500/20 text-rose-300 border-rose-500/50 glow-red",
      icon: Flame,
      pulse: true,
    };
  } else if (highestCri >= 70) {
    statusBadge = {
      label: "ELEVATED CONGESTION RISK",
      color: "bg-amber-500/20 text-amber-300 border-amber-500/40 glow-amber",
      icon: AlertTriangle,
      pulse: false,
    };
  }

  const StatusIcon = statusBadge.icon;

  return (
    <header className="border-b border-slate-800/80 bg-[#0b101c]/95 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        
        {/* Brand & System Title */}
        <div className="flex items-center space-x-3.5">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-700 shadow-lg shadow-cyan-500/20">
            <Radio className="w-6 h-6 text-white animate-pulse" />
            <div className="absolute inset-0 rounded-xl border border-cyan-300/40" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                Crowd<span className="text-cyan-400">Eco</span>
              </h1>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-400">
                v2.4 PRO
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Predictive Crowd Dynamics & Kinetic Bottleneck Warning Engine
            </p>
          </div>
        </div>

        {/* Global Operational Status Pill */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold tracking-wide ${statusBadge.color} ${
              statusBadge.pulse ? "animate-pulse" : ""
            }`}
          >
            <StatusIcon className="w-4 h-4" />
            <span>{statusBadge.label}</span>
            <span className="text-slate-400 font-normal">|</span>
            <span className="font-mono">Peak CRI: {highestCri.toFixed(1)}%</span>
          </div>

          {/* Real-time Attendees Pill */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-300">Live Attendees:</span>
            <span className="font-mono font-bold text-white">{totalAttendees}</span>
          </div>

          {/* WebSocket Link Status */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-mono">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-emerald-400 shadow-[0_0_8px_#34d399]" : "bg-rose-500"
              }`}
            />
            <span className="text-slate-300">
              {isConnected ? "WS 12Hz" : "OFFLINE"}
            </span>
            <span className="text-slate-600 hidden md:inline">#{frameSeq}</span>
          </div>

          {/* Sound Alarm Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? "Mute Proactive Audio Warnings" : "Enable Proactive Audio Warnings"}
            className={`p-2 rounded-lg border transition-colors ${
              soundEnabled
                ? "bg-cyan-950/60 border-cyan-800/80 text-cyan-300 hover:bg-cyan-900/60"
                : "bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300"
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>

      </div>

      {/* Navigation Sub-bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between border-t border-slate-800/50 py-2">
        <div className="flex space-x-1.5">
          {[
            { id: "dashboard", label: "Operations Dashboard" },
            { id: "analytics", label: "Predictive Analytics & Charts" },
            { id: "alerts", label: `Alert Incident Log (${criticalAlertCount})` },
            { id: "simulation", label: "Simulation & Injection Controls" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                activeTab === tab.id
                  ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Current Scenario Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span>Active Scenario:</span>
          <span className="font-semibold text-slate-200 uppercase tracking-wider bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
            {scenario.replace(/_/g, " ")}
          </span>
        </div>
      </div>
    </header>
  );
}

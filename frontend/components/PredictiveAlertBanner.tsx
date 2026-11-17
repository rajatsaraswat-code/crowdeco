"use client";

import React, { useEffect } from "react";
import {
  AlertTriangle,
  Flame,
  Clock,
  ArrowRight,
  CheckCircle,
  ShieldCheck,
  Zap,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { ProactiveAlert } from "@/lib/types";

interface PredictiveAlertBannerProps {
  alerts: ProactiveAlert[];
  soundEnabled: boolean;
  onAcknowledge: (alertId: string) => void;
  onResolve: (alertId: string, action: string) => void;
}

export default function PredictiveAlertBanner({
  alerts,
  soundEnabled,
  onAcknowledge,
  onResolve,
}: PredictiveAlertBannerProps) {
  // Beep sound effect using AudioContext when high priority alert arrives
  useEffect(() => {
    if (!soundEnabled || alerts.length === 0) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, ctx.currentTime); // High warning tone
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }, [alerts.length, soundEnabled]);

  if (alerts.length === 0) {
    return null;
  }

  // Display the most critical active alert at the top
  const primaryAlert = alerts[0];
  const isCritical = primaryAlert.level === "CRITICAL";

  return (
    <div className="relative mb-6 overflow-hidden rounded-xl border border-rose-500/60 bg-gradient-to-r from-rose-950/80 via-[#1e101a]/90 to-[#121626]/90 p-4 sm:p-5 shadow-2xl shadow-rose-950/50 glow-red animate-in fade-in slide-in-from-top-4 duration-300">
      
      {/* Background Warning Stripe pattern */}
      <div className="absolute -right-16 -top-16 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Left Side: Icon & Warning Headline */}
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 mt-0.5">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isCritical ? "bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse" : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
            }`}>
              {isCritical ? <Flame className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-rose-500/30 text-rose-200 border border-rose-500/60">
                PROACTIVE BOTTLENECK WARNING
              </span>
              <span className="text-xs text-rose-300/80 font-mono flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Triggered: {primaryAlert.formatted_time}
              </span>
              {primaryAlert.time_to_breach_sec !== null && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 animate-pulse">
                  <Zap className="w-3.5 h-3.5" />
                  T-{primaryAlert.time_to_breach_sec}s to 85% Bottleneck
                </span>
              )}
              <span className="text-xs px-2 py-0.5 rounded bg-slate-900/90 text-slate-300 border border-slate-700 font-mono">
                CRI: {primaryAlert.cri_score.toFixed(1)}%
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              {primaryAlert.message}
            </h3>

            {/* AI Actionable Recommendations */}
            <div className="mt-2 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-rose-300/90 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                Recommended Automated Mitigations:
              </p>
              <ul className="text-xs text-slate-200 space-y-1">
                {primaryAlert.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-center gap-2 bg-slate-950/40 px-2.5 py-1 rounded border border-rose-900/40">
                    <ChevronRight className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right Side: Quick Action Operator Controls */}
        <div className="flex flex-row lg:flex-col items-center lg:items-end justify-end gap-2.5 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800/80">
          
          {primaryAlert.status === "ACTIVE" && (
            <button
              onClick={() => onAcknowledge(primaryAlert.id)}
              className="px-4 py-2 rounded-lg bg-amber-600/30 hover:bg-amber-600/40 border border-amber-500/50 text-amber-200 text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-amber-950/40"
            >
              <CheckCircle className="w-4 h-4" />
              Acknowledge Alert
            </button>
          )}

          <button
            onClick={() => onResolve(primaryAlert.id, primaryAlert.recommendations[0] || "Secondary egress opened")}
            className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-rose-900/50"
          >
            <ShieldCheck className="w-4 h-4" />
            Execute Mitigation & Clear
          </button>

          {alerts.length > 1 && (
            <span className="text-[11px] text-slate-400">
              +{alerts.length - 1} more active warning{alerts.length > 2 ? "s" : ""}
            </span>
          )}
        </div>

      </div>
    </div>
  );
}

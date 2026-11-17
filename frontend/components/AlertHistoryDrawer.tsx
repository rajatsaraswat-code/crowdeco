"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  Clock,
  CheckCircle,
  AlertTriangle,
  Flame,
  Search,
  Filter,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import { ProactiveAlert } from "@/lib/types";

interface AlertHistoryDrawerProps {
  alerts: ProactiveAlert[];
  onAcknowledge: (alertId: string) => void;
  onResolve: (alertId: string, action: string) => void;
}

export default function AlertHistoryDrawer({
  alerts,
  onAcknowledge,
  onResolve,
}: AlertHistoryDrawerProps) {
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = alerts.filter((alt) => {
    if (filterStatus !== "ALL" && alt.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        alt.zone_name.toLowerCase().includes(q) ||
        alt.message.toLowerCase().includes(q) ||
        alt.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="rounded-xl border border-slate-800 bg-[#0c1220]/90 p-5 shadow-2xl mb-6">
      
      {/* Header and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            Predictive Bottleneck Incident Log & Resolution History
          </h3>
          <p className="text-xs text-slate-400">
            Audit trail of AI-flagged congestion risks, time horizons, and event marshal resolutions.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Status Tabs */}
          <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
            {["ALL", "ACTIVE", "ACKNOWLEDGED", "RESOLVED"].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded transition text-xs font-medium ${
                  filterStatus === st
                    ? "bg-cyan-600 text-white font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Filter by zone or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

        </div>
      </div>

      {/* Table or Empty State */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-500/60" />
          <p className="font-semibold text-slate-300">No Incidents Matching Selected Filter</p>
          <p className="text-slate-500 text-[11px]">All venue zones are operating within acceptable density thresholds.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">Alert ID</th>
                <th className="py-3 px-3">Time</th>
                <th className="py-3 px-3">Zone</th>
                <th className="py-3 px-3">Peak CRI</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">AI Prediction & Mitigation</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((item) => {
                const isCritical = item.level === "CRITICAL";
                let statusBadge = "bg-slate-800 text-slate-300";
                if (item.status === "ACTIVE") {
                  statusBadge = isCritical
                    ? "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse"
                    : "bg-amber-500/20 text-amber-300 border-amber-500/40";
                } else if (item.status === "ACKNOWLEDGED") {
                  statusBadge = "bg-sky-500/20 text-sky-300 border-sky-500/40";
                } else if (item.status === "RESOLVED") {
                  statusBadge = "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
                }

                return (
                  <tr key={item.id} className="hover:bg-slate-900/40 transition">
                    <td className="py-3 px-3 font-mono font-bold text-slate-200">
                      {item.id}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400 whitespace-nowrap">
                      {item.formatted_time}
                    </td>
                    <td className="py-3 px-3 font-semibold text-white whitespace-nowrap">
                      {item.zone_name}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold">
                      <span className={item.cri_score >= 85 ? "text-rose-400" : "text-amber-400"}>
                        {item.cri_score.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-300 max-w-md">
                      <p className="line-clamp-2 leading-relaxed">{item.message}</p>
                      {item.acknowledged_by && (
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                          Ack by: {item.acknowledged_by}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      {item.status === "ACTIVE" && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onAcknowledge(item.id)}
                            className="px-2.5 py-1 rounded bg-amber-600/30 hover:bg-amber-600/50 text-amber-200 border border-amber-500/40 font-semibold text-[11px]"
                          >
                            Ack
                          </button>
                          <button
                            onClick={() => onResolve(item.id, item.recommendations[0] || "Resolved")}
                            className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-semibold text-[11px]"
                          >
                            Resolve
                          </button>
                        </div>
                      )}
                      {item.status === "ACKNOWLEDGED" && (
                        <button
                          onClick={() => onResolve(item.id, item.recommendations[0] || "Resolved")}
                          className="px-2.5 py-1 rounded bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 border border-emerald-500/40 font-semibold text-[11px]"
                        >
                          Mark Resolved
                        </button>
                      )}
                      {item.status === "RESOLVED" && (
                        <span className="text-emerald-400 font-mono text-[11px] flex items-center justify-end gap-1">
                          <CheckCircle className="w-3 h-3" /> Resolved
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}

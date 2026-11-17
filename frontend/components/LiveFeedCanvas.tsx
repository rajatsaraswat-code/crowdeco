"use client";

import React, { useRef, useEffect, useState } from "react";
import {
  Camera,
  Layers,
  Eye,
  Sliders,
  Crosshair,
  Maximize2,
  Minimize2,
  RefreshCw,
  Compass,
} from "lucide-react";
import { ZoneMetric, Detection, VectorFlowCell } from "@/lib/types";

interface LiveFeedCanvasProps {
  zones: ZoneMetric[];
  detections: Detection[];
  vectorFlow: VectorFlowCell[];
  densityHeatmap: number[][];
  selectedZone: string | null;
  onSelectZone: (zoneId: string) => void;
}

export default function LiveFeedCanvas({
  zones,
  detections,
  vectorFlow,
  densityHeatmap,
  selectedZone,
  onSelectZone,
}: LiveFeedCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Overlay toggles
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const [showVelocityVectors, setShowVelocityVectors] = useState(true);
  const [showFlowField, setShowFlowField] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [viewMode, setViewMode] = useState<"cctv" | "sensor" | "thermal">("cctv");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    if (viewMode === "thermal") {
      ctx.fillStyle = "#030712";
    } else if (viewMode === "cctv") {
      ctx.fillStyle = "#080c16";
    } else {
      ctx.fillStyle = "#050811";
    }
    ctx.fillRect(0, 0, width, height);

    // Coordinate scale factors (from backend 1000x1000 space)
    const scaleX = width / 1000.0;
    const scaleY = height / 1000.0;

    // 1. Draw Architectural Floorplan & Corridors
    // Corridor links
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 14 * scaleX;
    ctx.lineCap = "round";
    // Horizontal corridor (Gate A to Arena)
    ctx.beginPath();
    ctx.moveTo(350 * scaleX, 250 * scaleY);
    ctx.lineTo(600 * scaleX, 250 * scaleY);
    ctx.stroke();

    // Vertical corridor (Gate A to Food Court)
    ctx.beginPath();
    ctx.moveTo(240 * scaleX, 380 * scaleY);
    ctx.lineTo(240 * scaleX, 580 * scaleY);
    ctx.stroke();

    // Vertical corridor (Arena to Exit Corridor)
    ctx.beginPath();
    ctx.moveTo(740 * scaleX, 440 * scaleY);
    ctx.lineTo(740 * scaleX, 620 * scaleY);
    ctx.stroke();

    // Cross diagonal corridor (Food Court to Exit)
    ctx.beginPath();
    ctx.moveTo(420 * scaleX, 730 * scaleY);
    ctx.lineTo(580 * scaleX, 730 * scaleY);
    ctx.stroke();

    // 2. Draw Zone Boundaries
    const zoneRects = [
      { id: "zone_gate_a", name: "GATE A (MAIN ENTRANCE)", minX: 40, maxX: 440, minY: 40, maxY: 420, color: "#3B82F6" },
      { id: "zone_main_arena", name: "MAIN ARENA CONCOURSE", minX: 520, maxX: 960, minY: 40, maxY: 480, color: "#8B5CF6" },
      { id: "zone_food_court", name: "FOOD COURT (ZONE B)", minX: 40, maxX: 440, minY: 520, maxY: 940, color: "#EC4899" },
      { id: "zone_exit_corridor", name: "EXIT CORRIDOR (SOUTH EGRESS)", minX: 520, maxX: 960, minY: 580, maxY: 940, color: "#F59E0B" }
    ];

    zoneRects.forEach((zr) => {
      const zx = zr.minX * scaleX;
      const zy = zr.minY * scaleY;
      const zw = (zr.maxX - zr.minX) * scaleX;
      const zh = (zr.maxY - zr.minY) * scaleY;

      const isSelected = selectedZone === zr.id;
      const zoneData = zones.find((z) => z.zone_id === zr.id);
      const isCritical = zoneData && (zoneData.cri_score >= 85 || zoneData.risk_level === "CRITICAL");
      const isWarning = zoneData && (zoneData.cri_score >= 70 || zoneData.risk_level === "WARNING");

      // Zone background tint
      if (isCritical) {
        ctx.fillStyle = "rgba(239, 68, 68, 0.12)";
      } else if (isWarning) {
        ctx.fillStyle = "rgba(245, 158, 11, 0.10)";
      } else {
        ctx.fillStyle = "rgba(15, 23, 42, 0.55)";
      }
      ctx.fillRect(zx, zy, zw, zh);

      // Zone border
      ctx.lineWidth = isSelected ? 2.5 : 1.5;
      if (isCritical) {
        ctx.strokeStyle = "rgba(239, 68, 68, 0.8)";
      } else if (isWarning) {
        ctx.strokeStyle = "rgba(245, 158, 11, 0.7)";
      } else {
        ctx.strokeStyle = isSelected ? "#38bdf8" : "rgba(71, 85, 105, 0.4)";
      }
      ctx.strokeRect(zx, zy, zw, zh);

      // Zone Header Pill
      ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
      ctx.fillRect(zx + 8, zy + 8, 190 * scaleX, 22 * scaleY);
      ctx.fillStyle = isCritical ? "#fca5a5" : isWarning ? "#fde047" : "#93c5fd";
      ctx.font = `bold ${Math.max(10, 11 * scaleX)}px monospace`;
      ctx.fillText(zr.name, zx + 14, zy + 22 * scaleY);

      // Capacity watermark
      if (zoneData) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        ctx.font = `${Math.max(9, 10 * scaleX)}px sans-serif`;
        ctx.fillText(
          `Count: ${zoneData.current_headcount} / ${zoneData.max_capacity} | CRI: ${zoneData.cri_score.toFixed(0)}%`,
          zx + 14,
          zy + 38 * scaleY
        );
      }
    });

    // 3. Draw Density Heatmap Layer
    if (showHeatmap && densityHeatmap && densityHeatmap.length > 0) {
      const rows = densityHeatmap.length;
      const cols = densityHeatmap[0].length;
      const cellW = width / cols;
      const cellH = height / rows;

      ctx.save();
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const val = densityHeatmap[r][c];
          if (val > 0.05) {
            const cx = (c + 0.5) * cellW;
            const cy = (r + 0.5) * cellH;
            const radius = cellW * 1.6;

            const radGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
            if (val > 0.7) {
              radGrad.addColorStop(0, `rgba(239, 68, 68, ${val * 0.45})`);
              radGrad.addColorStop(0.5, `rgba(245, 158, 11, ${val * 0.25})`);
              radGrad.addColorStop(1, "rgba(245, 158, 11, 0)");
            } else if (val > 0.4) {
              radGrad.addColorStop(0, `rgba(245, 158, 11, ${val * 0.35})`);
              radGrad.addColorStop(0.6, `rgba(16, 185, 129, ${val * 0.2})`);
              radGrad.addColorStop(1, "rgba(16, 185, 129, 0)");
            } else {
              radGrad.addColorStop(0, `rgba(6, 182, 212, ${val * 0.25})`);
              radGrad.addColorStop(1, "rgba(6, 182, 212, 0)");
            }
            ctx.fillStyle = radGrad;
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      ctx.restore();
    }

    // 4. Draw Macroscopic Vector Flow Field (Grid Arrows)
    if (showFlowField && vectorFlow && vectorFlow.length > 0) {
      ctx.save();
      vectorFlow.forEach((vf) => {
        if (vf.magnitude > 0.3) {
          const vx = vf.cx * scaleX;
          const vy = vf.cy * scaleY;
          const arrowLen = Math.min(22, vf.magnitude * 5.0) * scaleX;
          const rad = (vf.angle_deg * Math.PI) / 180.0;
          const endX = vx + Math.cos(rad) * arrowLen;
          const endY = vy + Math.sin(rad) * arrowLen;

          // Arrow color based on density & magnitude
          ctx.strokeStyle = vf.density_count > 6 ? "rgba(244, 63, 94, 0.65)" : "rgba(56, 189, 248, 0.45)";
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(vx, vy);
          ctx.lineTo(endX, endY);
          ctx.stroke();

          // Arrowhead
          const headLen = 4 * scaleX;
          ctx.beginPath();
          ctx.moveTo(endX, endY);
          ctx.lineTo(
            endX - headLen * Math.cos(rad - Math.PI / 6),
            endY - headLen * Math.sin(rad - Math.PI / 6)
          );
          ctx.moveTo(endX, endY);
          ctx.lineTo(
            endX - headLen * Math.cos(rad + Math.PI / 6),
            endY - headLen * Math.sin(rad + Math.PI / 6)
          );
          ctx.stroke();
        }
      });
      ctx.restore();
    }

    // 5. Draw Individual Pedestrians, Bounding Boxes & Velocity Vectors
    detections.forEach((det) => {
      const cx = det.center[0] * scaleX;
      const cy = det.center[1] * scaleY;

      // Draw Pedestrian Center Dot
      ctx.beginPath();
      ctx.arc(cx, cy, 2.8 * scaleX, 0, Math.PI * 2);
      ctx.fillStyle = det.speed > 3.5 ? "#f43f5e" : "#38bdf8";
      ctx.fill();

      // Bounding Box (YOLO Detection)
      if (showBoundingBoxes) {
        const x1 = det.bbox[0] * scaleX;
        const y1 = det.bbox[1] * scaleY;
        const bw = (det.bbox[2] - det.bbox[0]) * scaleX;
        const bh = (det.bbox[3] - det.bbox[1]) * scaleY;

        ctx.strokeStyle = "rgba(56, 189, 248, 0.6)";
        ctx.lineWidth = 1.0;
        ctx.strokeRect(x1, y1, bw, bh);

        // Track ID + confidence label
        if (det.track_id % 4 === 0) {
          ctx.fillStyle = "rgba(15, 23, 42, 0.8)";
          ctx.fillRect(x1, y1 - 10 * scaleY, 44 * scaleX, 10 * scaleY);
          ctx.fillStyle = "#38bdf8";
          ctx.font = `${Math.max(7, 8 * scaleX)}px monospace`;
          ctx.fillText(`P#${det.track_id}`, x1 + 2, y1 - 2);
        }
      }

      // Individual Velocity Vector (Arrow)
      if (showVelocityVectors && (Math.abs(det.velocity[0]) > 0.2 || Math.abs(det.velocity[1]) > 0.2)) {
        const arrowLength = Math.min(18, det.speed * 4.5) * scaleX;
        const angle = Math.atan2(det.velocity[1], det.velocity[0]);
        const endX = cx + Math.cos(angle) * arrowLength;
        const endY = cy + Math.sin(angle) * arrowLength;

        ctx.strokeStyle = det.speed > 3.0 ? "#fb7185" : "#67e8f9";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Small arrowhead
        const ah = 3.5 * scaleX;
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(
          endX - ah * Math.cos(angle - Math.PI / 6),
          endY - ah * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(endX, endY);
        ctx.lineTo(
          endX - ah * Math.cos(angle + Math.PI / 6),
          endY - ah * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
      }
    });

    // 6. Surveillance HUD Watermarks & Crosshairs
    ctx.strokeStyle = "rgba(56, 189, 248, 0.25)";
    ctx.lineWidth = 1;
    // Corner brackets
    const bracketSize = 14 * scaleX;
    // Top-left
    ctx.beginPath();
    ctx.moveTo(12, 12 + bracketSize);
    ctx.lineTo(12, 12);
    ctx.lineTo(12 + bracketSize, 12);
    ctx.stroke();
    // Top-right
    ctx.beginPath();
    ctx.moveTo(width - 12 - bracketSize, 12);
    ctx.lineTo(width - 12, 12);
    ctx.lineTo(width - 12, 12 + bracketSize);
    ctx.stroke();
    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(12, height - 12 - bracketSize);
    ctx.lineTo(12, height - 12);
    ctx.lineTo(12 + bracketSize, height - 12);
    ctx.stroke();
    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(width - 12 - bracketSize, height - 12);
    ctx.lineTo(width - 12, height - 12);
    ctx.lineTo(width - 12, height - 12 - bracketSize);
    ctx.stroke();

    // Surveillance Timestamp and REC indicator
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.arc(32 * scaleX, 28 * scaleY, 4 * scaleX, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f87171";
    ctx.font = `bold ${Math.max(9, 10 * scaleX)}px monospace`;
    ctx.fillText("LIVE CCTV STREAM - CAM_OVERHEAD_MULTI_04", 42 * scaleX, 31 * scaleY);

  }, [zones, detections, vectorFlow, densityHeatmap, selectedZone, showBoundingBoxes, showVelocityVectors, showFlowField, showHeatmap, viewMode]);

  return (
    <div className="relative rounded-xl border border-slate-800/90 bg-[#070b14] overflow-hidden shadow-2xl mb-6">
      
      {/* Top Visualizer Control Bar */}
      <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Multi-Zone Visualizer & Movement Vector Engine
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-mono">
            {detections.length} Detected Tracks
          </span>
        </div>

        {/* View mode toggle tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setViewMode("cctv")}
            className={`px-2.5 py-1 rounded transition ${
              viewMode === "cctv"
                ? "bg-cyan-600 text-white font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            CCTV Overlay
          </button>
          <button
            onClick={() => setViewMode("sensor")}
            className={`px-2.5 py-1 rounded transition ${
              viewMode === "sensor"
                ? "bg-cyan-600 text-white font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Tactical Sensor
          </button>
          <button
            onClick={() => setViewMode("thermal")}
            className={`px-2.5 py-1 rounded transition ${
              viewMode === "thermal"
                ? "bg-cyan-600 text-white font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Thermal Density
          </button>
        </div>

        {/* Layer Toggles */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          
          <button
            onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
            className={`px-2 py-1 rounded border transition ${
              showBoundingBoxes
                ? "bg-cyan-950/80 border-cyan-600 text-cyan-300"
                : "bg-slate-950 border-slate-800 text-slate-500"
            }`}
          >
            Bounding Boxes
          </button>

          <button
            onClick={() => setShowVelocityVectors(!showVelocityVectors)}
            className={`px-2 py-1 rounded border transition ${
              showVelocityVectors
                ? "bg-cyan-950/80 border-cyan-600 text-cyan-300"
                : "bg-slate-950 border-slate-800 text-slate-500"
            }`}
          >
            Velocity Vectors (v⃗)
          </button>

          <button
            onClick={() => setShowFlowField(!showFlowField)}
            className={`px-2 py-1 rounded border transition ${
              showFlowField
                ? "bg-cyan-950/80 border-cyan-600 text-cyan-300"
                : "bg-slate-950 border-slate-800 text-slate-500"
            }`}
          >
            Flow Field
          </button>

          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-2 py-1 rounded border transition ${
              showHeatmap
                ? "bg-cyan-950/80 border-cyan-600 text-cyan-300"
                : "bg-slate-950 border-slate-800 text-slate-500"
            }`}
          >
            Heatmap
          </button>

        </div>

      </div>

      {/* Main 2D Canvas Feed */}
      <div className="relative aspect-[16/9] w-full max-h-[580px] bg-black flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={1000}
          height={620}
          className="w-full h-full object-contain"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = ((e.clientX - rect.left) / rect.width) * 1000;
            const clickY = ((e.clientY - rect.top) / rect.height) * 620;

            if (clickX <= 440 && clickY <= 420) onSelectZone("zone_gate_a");
            else if (clickX >= 520 && clickY <= 480) onSelectZone("zone_main_arena");
            else if (clickX <= 440 && clickY >= 520) onSelectZone("zone_food_court");
            else if (clickX >= 520 && clickY >= 580) onSelectZone("zone_exit_corridor");
          }}
        />

        {/* Legend Overlay at Bottom Right */}
        <div className="absolute bottom-3 right-3 bg-slate-950/85 backdrop-blur p-2.5 rounded-lg border border-slate-800 text-[11px] font-mono space-y-1 shadow-lg pointer-events-none">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
            Tactical Map Legend
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span className="text-slate-300">Normal Flow (v &lt; 3.0)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-slate-300">Surge Velocity / Rushing</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-0.5 bg-rose-500" />
            <span className="text-slate-300">Vector Flow Lines (v⃗)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded bg-rose-500/50 border border-rose-500" />
            <span className="text-slate-300">CRI &gt; 85% Bottleneck Warning</span>
          </div>
        </div>

      </div>

    </div>
  );
}

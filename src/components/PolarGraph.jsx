import React, { useMemo, useRef, useState } from "react";
import { KMH_TO_MS, clamp } from "../lib/physics";

export default function PolarGraph({
  t,
  unit,
  lang,
  mode,
  polar,
  flightMode,
  displaySpeedKmh,
  envWindKmh,
  envLiftMs,
  maccreadyMs,
  bestAir,
  bestGround,
  bestMacCready,
  STALL_DROP,
  COLLAPSE_DROP,
  onScrubSpeed,
}) {
  const svgRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const grabOffsetRef = useRef(0);

  const margin = { top: 24, right: 24, bottom: 36, left: 44 };
  const width = 720,
    height = 360;

  const xMin = 0;
  const xMax = Math.max(70, polar.range[1] + 10);
  const yMin = 0; // top (0 sink)
  const yMax = 4.0; // bottom (−4 m/s)

  const sx = (v) =>
    margin.left +
    ((v - xMin) / (xMax - xMin)) * (width - margin.left - margin.right);
  const sy = (vz) =>
    margin.top +
    ((vz - yMin) / (yMax - yMin)) * (height - margin.top - margin.bottom);

  const validPath = useMemo(() => {
    const pts = [];
    const step = 0.25;
    for (let v = polar.range[0]; v <= polar.range[1]; v += step) {
      pts.push([sx(v), sy(-polar.f(v))]);
    }
    return `M ${pts.map((p) => p.join(",")).join(" L ")}`;
  }, [polar]);

  const stallX = polar.range[0];
  const vmaxX = polar.range[1];
  const deepStallX = Math.max(5, stallX - 6);
  const overSpeedX = vmaxX + 6;

  const onPointer = (e) => {
    if (!dragging) return;
    const rect = svgRef.current.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const pxAdj = px - grabOffsetRef.current;
    const v =
      xMin +
      ((pxAdj - margin.left) / (width - margin.left - margin.right)) *
        (xMax - xMin);
    const vClamped = clamp(v, stallX, vmaxX);
    onScrubSpeed(vClamped);
  };

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-[340px] select-none"
      onPointerMove={onPointer}
      onPointerUp={() => setDragging(false)}
      onPointerLeave={() => setDragging(false)}
    >
      {/* Grid */}
      <rect
        x="0"
        y="0"
        width={width}
        height={height}
        rx="16"
        className="fill-white dark:fill-slate-800"
      />
      {(mode === "simple"
        ? [0, yMax]
        : [0, 1, 2, 3, yMax]
      ).map((i, idx) => (
        <line
          key={`y-${idx}-${i}`}
          x1={margin.left}
          x2={width - margin.right}
          y1={sy(i)}
          y2={sy(i)}
          className="stroke-slate-200 dark:stroke-slate-700"
        />
      ))}
      {(mode === "simple" ? [0, xMax] : [0, 10, 20, 30, 40, 50, 60, xMax]).map((x, idx) => (
        <line
          key={`x-${idx}-${x}`}
          y1={margin.top}
          y2={height - margin.bottom}
          x1={sx(x)}
          x2={sx(x)}
          className="stroke-slate-100 dark:stroke-slate-700"
        />
      ))}

      {/* Axes labels */}
      <text
        x={width / 2}
        y={height - 8}
        className="text-[12px] fill-slate-600 dark:fill-slate-300"
      >
        {t.axis_airspeed} (km/h)
      </text>
      <text
        transform={`translate(14 ${height / 2}) rotate(-90)`}
        className="text-[12px] fill-slate-600 dark:fill-slate-300"
      >
        {t.axis_sinkrate} (m/s)
      </text>
      {/* Minimal tick labels in simple mode */}
      {mode === "simple" && (
        <>
          <text x={sx(0)} y={sy(0) - 4} className="text-[12px] fill-slate-500">0</text>
          <text x={sx(0)} y={sy(yMax) - 4} className="text-[12px] fill-slate-500">-{yMax.toFixed(1)}</text>
          <text x={sx(xMax) - 16} y={height - margin.bottom + 14} className="text-[12px] fill-slate-500">{xMax}</text>
        </>
      )}

      {/* Valid polar */}
      <path
        d={validPath}
        className="fill-none stroke-sky-600"
        strokeWidth="2"
      />

      {/* Invalid regions: vertical dotted drops */}
      <line
        x1={sx(stallX)}
        x2={sx(stallX)}
        y1={sy(0)}
        y2={sy(-STALL_DROP)}
        className="stroke-slate-500"
        strokeDasharray="4 4"
      />
      <line
        x1={sx(vmaxX)}
        x2={sx(vmaxX)}
        y1={sy(0)}
        y2={sy(-COLLAPSE_DROP)}
        className="stroke-slate-500"
        strokeDasharray="4 4"
      />

      {/* Tangents */}
      {bestAir && (
        <line
          x1={sx(0)}
          y1={sy(0)}
          x2={sx(bestAir.vx)}
          y2={sy(-bestAir.vz)}
          className="stroke-fuchsia-500"
          strokeDasharray="6 4"
        />
      )}
  {bestGround && bestGround.vz < 0 && (
        <line
          x1={sx(envWindKmh)}
          y1={sy(0)}
          x2={sx(bestGround.vx)}
          y2={sy(-bestGround.vz)}
          className="stroke-emerald-500"
          strokeDasharray="6 4"
        />
      )}
    {bestMacCready && bestMacCready.vz < 0 && (
        <line
          x1={sx(envWindKmh)}
      y1={sy(0)}
          x2={sx(bestMacCready.vx)}
          y2={sy(-bestMacCready.vz)}
          className="stroke-amber-500"
          strokeDasharray="6 4"
        />
      )}

      {/* Current GR (air) line from origin to active point */}
      <line
        x1={sx(0)}
        y1={sy(0)}
        x2={sx(displaySpeedKmh)}
        y2={sy(-polar.f(displaySpeedKmh))}
        className="stroke-slate-400"
        strokeDasharray="4 4"
      />

      {/* Active point */}
      <circle
        cx={sx(displaySpeedKmh)}
        cy={sy(-polar.f(displaySpeedKmh))}
        r={6}
        className="fill-sky-600 stroke-white dark:stroke-slate-900"
        onPointerDown={(e) => {
          const rect = svgRef.current.getBoundingClientRect();
          const px = e.clientX - rect.left;
          grabOffsetRef.current = px - sx(displaySpeedKmh);
          setDragging(true);
        }}
      />

      {/* Intersection markers */}
      {bestAir && (
        <circle cx={sx(bestAir.vx)} cy={sy(-bestAir.vz)} r={4} className="fill-fuchsia-500" />
      )}
      {bestGround && bestGround.vz < 0 && (
        <rect x={sx(bestGround.vx) - 4} y={sy(-bestGround.vz) - 4} width={8} height={8} className="fill-emerald-500" />
      )}
      {bestMacCready && bestMacCready.vz < 0 && (
        <path d={`M ${sx(bestMacCready.vx)} ${sy(-bestMacCready.vz) - 5} L ${sx(bestMacCready.vx) - 5} ${sy(-bestMacCready.vz) + 4} L ${sx(bestMacCready.vx) + 5} ${sy(-bestMacCready.vz) + 4} Z`} className="fill-amber-500" />
      )}

      {/* Legend */}
      <g
        transform={`translate(${width - 190},${margin.top + 6})`}
        className="text-[12px]"
      >
        <LegendItem
          color="stroke-fuchsia-500"
          label="Best Glide (air)"
          dy={0}
        />
        <LegendItem
          color="stroke-emerald-500"
          label="Best Glide (ground)"
          dy={16}
        />
        <LegendItem color="stroke-amber-500" label="MacCready" dy={32} />
      </g>
    </svg>
  );
}

function LegendItem({ color, label, dy }) {
  return (
    <g transform={`translate(0,${dy})`}>
      <line
        x1={0}
        y1={0}
        x2={22}
        y2={0}
        className={`${color}`}
        strokeDasharray="6 4"
      />
      <text x={28} y={4} className="fill-slate-600 dark:fill-slate-300">
        {label}
      </text>
    </g>
  );
}

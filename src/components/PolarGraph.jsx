import { useMemo, useRef, useState } from "react";
import { clamp } from "../lib/units";

/**
 * SVG polar plot: the glide polar (airspeed vs sink), tangents for best glide
 * (air and ground) and MacCready, and a draggable active point.
 * Axes are the polar-chart convention: km/h horizontal, m/s vertical.
 */
export default function PolarGraph({
  t,
  mode,
  polar,
  ghostPolar,
  displaySpeedKmh,
  envWindKmh,
  envLiftMs = 0,
  maccreadyMs = 0,
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

  // The chart renders at ~390-540px in every placement (sidebar, overlay,
  // mobile panel) — the viewBox matches that, so text renders at true size.
  const margin = { top: 18, right: 12, bottom: 34, left: 40 };
  const width = 460;
  const height = 330;

  const xMin = 0;
  const xMax = Math.max(70, polar.range[1] + 10);
  // Sinking air moves the ground-glide origin ABOVE the zero line — give the
  // chart headroom so the shifting origin stays visible.
  const yMin = Math.min(0, Math.floor(envLiftMs));
  const yMax = 4.0; // bottom (−4 m/s)

  const sx = (v) =>
    margin.left + ((v - xMin) / (xMax - xMin)) * (width - margin.left - margin.right);
  const sy = (vz) =>
    margin.top + ((vz - yMin) / (yMax - yMin)) * (height - margin.top - margin.bottom);

  const pathFor = (p) => {
    const pts = [];
    const step = 0.25;
    for (let v = p.range[0]; v <= p.range[1]; v += step) {
      pts.push([sx(v), sy(-p.f(v))]);
    }
    return `M ${pts.map((pt) => pt.join(",")).join(" L ")}`;
  };
  const validPath = useMemo(
    () => pathFor(polar),
    // sx/sy depend on the polar range and the (dynamic) y-domain
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [polar, yMin],
  );
  const ghostPath = useMemo(
    () => (ghostPolar ? pathFor(ghostPolar) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ghostPolar, polar, yMin],
  );

  const stallX = polar.range[0];
  const vmaxX = polar.range[1];

  const onPointer = (e) => {
    if (!dragging) return;
    const rect = svgRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) * (width / rect.width) - grabOffsetRef.current;
    const v = xMin + ((px - margin.left) / (width - margin.left - margin.right)) * (xMax - xMin);
    onScrubSpeed(clamp(v, stallX, vmaxX));
  };

  const yTicks =
    mode === "simple"
      ? [0, 2, yMax]
      : Array.from({ length: 4 - yMin + 1 }, (_, i) => yMin + i);
  const xTicks = mode === "simple" ? [0, 20, 40, xMax] : [0, 10, 20, 30, 40, 50, 60, xMax];

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-auto select-none"
      onPointerMove={onPointer}
      onPointerUp={() => setDragging(false)}
      onPointerLeave={() => setDragging(false)}
      role="img"
      aria-label={`${t.axis_airspeed} / ${t.axis_sinkrate}`}
    >
      {/* Background + grid */}
      <rect x="0" y="0" width={width} height={height} rx="10" className="fill-ink/40" />
      {yTicks.map((v) => (
        <line
          key={`y-${v}`}
          x1={margin.left}
          x2={width - margin.right}
          y1={sy(v)}
          y2={sy(v)}
          className="stroke-white/10"
        />
      ))}
      {xTicks.map((v) => (
        <line
          key={`x-${v}`}
          y1={margin.top}
          y2={height - margin.bottom}
          x1={sx(v)}
          x2={sx(v)}
          className="stroke-white/5"
        />
      ))}

      {/* Zero (level flight) line */}
      <line
        x1={margin.left}
        x2={width - margin.right}
        y1={sy(0)}
        y2={sy(0)}
        className="stroke-white/30"
      />

      {/* Axis labels */}
      <text x={width / 2 - 40} y={height - 7} className="text-[11px] font-data fill-slate-300">
        {t.axis_airspeed} (km/h)
      </text>
      <text
        transform={`translate(11 ${height / 2 + 40}) rotate(-90)`}
        className="text-[11px] font-data fill-slate-300"
      >
        {t.axis_sinkrate} ({t.unit_ms})
      </text>

      {/* Tick labels */}
      {yTicks.map((v) => (
        <text key={`yl-${v}`} x={sx(0) - 26} y={sy(v) + 3.5} className="text-[10px] font-data fill-slate-400">
          {v === 0 ? "0" : v > 0 ? `-${v}` : `+${-v}`}
        </text>
      ))}
      {xTicks.map((v) => (
        <text
          key={`xl-${v}`}
          x={sx(v) - 5}
          y={height - margin.bottom + 13}
          className="text-[10px] font-data fill-slate-400"
        >
          {v}
        </text>
      ))}

      {/* Comparison polar (ghost) */}
      {ghostPath && (
        <path d={ghostPath} className="fill-none stroke-white/35" strokeWidth="1.5" strokeDasharray="2 3" />
      )}

      {/* Valid polar */}
      <path d={validPath} className="fill-none stroke-skywash-bright" strokeWidth="2" />

      {/* Invalid regions: vertical dotted drops at stall and overspeed */}
      <line
        x1={sx(stallX)}
        x2={sx(stallX)}
        y1={sy(0)}
        y2={sy(-STALL_DROP)}
        className="stroke-rose"
        strokeDasharray="4 4"
      />
      <line
        x1={sx(vmaxX)}
        x2={sx(vmaxX)}
        y1={sy(0)}
        y2={sy(-COLLAPSE_DROP)}
        className="stroke-rose"
        strokeDasharray="4 4"
      />

      {/* Tangents */}
      {bestAir && (
        <line
          x1={sx(0)}
          y1={sy(0)}
          x2={sx(bestAir.vx)}
          y2={sy(-bestAir.vz)}
          className="stroke-slate-400"
          strokeDasharray="6 4"
        />
      )}
      {bestGround && bestGround.vz < 0 && (
        <>
          <line
            x1={sx(envWindKmh)}
            y1={sy(envLiftMs)}
            x2={sx(bestGround.vx)}
            y2={sy(-bestGround.vz)}
            className="stroke-emerald-400"
            strokeDasharray="6 4"
          />
          {/* the shifted origin itself — the heart of the construction */}
          <circle cx={sx(envWindKmh)} cy={sy(envLiftMs)} r={3.5} className="fill-emerald-400" />
        </>
      )}
      {bestMacCready && bestMacCready.vz < 0 && (
        <>
          <line
            x1={sx(envWindKmh)}
            y1={sy(envLiftMs + maccreadyMs)}
            x2={sx(bestMacCready.vx)}
            y2={sy(-bestMacCready.vz)}
            className="stroke-thermal-bright"
            strokeDasharray="6 4"
          />
          <circle
            cx={sx(envWindKmh)}
            cy={sy(envLiftMs + maccreadyMs)}
            r={3.5}
            className="fill-thermal-bright"
          />
        </>
      )}

      {/* Current glide line from origin to active point */}
      <line
        x1={sx(0)}
        y1={sy(0)}
        x2={sx(displaySpeedKmh)}
        y2={sy(-polar.f(displaySpeedKmh))}
        className="stroke-white/30"
        strokeDasharray="4 4"
      />

      {/* Active point (draggable) */}
      <circle
        cx={sx(displaySpeedKmh)}
        cy={sy(-polar.f(displaySpeedKmh))}
        r={6}
        className="fill-thermal stroke-white cursor-grab"
        onPointerDown={(e) => {
          const rect = svgRef.current.getBoundingClientRect();
          const px = (e.clientX - rect.left) * (width / rect.width);
          grabOffsetRef.current = px - sx(displaySpeedKmh);
          setDragging(true);
        }}
      />

      {/* Intersection markers */}
      {bestAir && <circle cx={sx(bestAir.vx)} cy={sy(-bestAir.vz)} r={4} className="fill-slate-400" />}
      {bestGround && bestGround.vz < 0 && (
        <rect
          x={sx(bestGround.vx) - 4}
          y={sy(-bestGround.vz) - 4}
          width={8}
          height={8}
          className="fill-emerald-400"
        />
      )}
      {bestMacCready && bestMacCready.vz < 0 && (
        <path
          d={`M ${sx(bestMacCready.vx)} ${sy(-bestMacCready.vz) - 5} L ${sx(bestMacCready.vx) - 5} ${
            sy(-bestMacCready.vz) + 4
          } L ${sx(bestMacCready.vx) + 5} ${sy(-bestMacCready.vz) + 4} Z`}
          className="fill-thermal-bright"
        />
      )}

      {/* Legend */}
      <g transform={`translate(${width - 148},${margin.top + 8})`} className="text-[10px]">
        <LegendItem color="stroke-slate-400" label={t.legend_best_air} dy={0} />
        <LegendItem color="stroke-emerald-400" label={t.legend_best_ground} dy={16} />
        <LegendItem color="stroke-thermal-bright" label={t.legend_maccready} dy={32} />
      </g>
    </svg>
  );
}

function LegendItem({ color, label, dy }) {
  return (
    <g transform={`translate(0,${dy})`}>
      <line x1={0} y1={0} x2={16} y2={0} className={color} strokeDasharray="5 3" />
      <text x={21} y={3.5} className="font-data fill-slate-300">
        {label}
      </text>
    </g>
  );
}

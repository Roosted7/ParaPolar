import { useEffect, useRef, useState } from "react";
import {
  KMH_TO_MS,
  MS_TO_KMH,
  convertSpeed,
  formatSpeed,
  formatVertical,
} from "../lib/units";

/**
 * Canvas side-scroll "consequence view": glider motion over ground, wind/lift
 * particles, a windsock, and an optional audio vario.
 *
 * All per-frame state lives in refs — the rAF loop runs for the component's
 * lifetime and must never trigger React re-renders.
 */
export default function GroundViz({
  t,
  unit,
  vxGroundMs,
  vzGroundMs,
  airspeedKmh,
  envWindKmh,
  envLiftMs,
  showVario,
  groundGlideRatio,
}) {
  const canvasRef = useRef(null);
  const posRef = useRef({ x: 30, y: 120 }); // y = altitude px above ground line
  const particlesRef = useRef(makeParticles(120));
  const lastRef = useRef(0);
  const paramsRef = useRef({ vxGroundMs, vzGroundMs, airspeedKmh, envWindKmh, envLiftMs, unit, t });
  const windsockRef = useRef({ angle: -Math.PI / 2, ext: 0.1, phase: 0 });
  const dimsRef = useRef({ w: 0, h: 0, dpr: 1 });
  const hoverRef = useRef({ overSock: false });

  // Vario audio. varioActiveRef mirrors (showVario && varioEnabled) so the
  // animation loop — which closes over the first render — sees fresh values.
  const audioCtxRef = useRef(null);
  const gainRef = useRef(null);
  const beepRef = useRef({ nextTime: 0 });
  const [varioEnabled, setVarioEnabled] = useState(false);
  const varioActiveRef = useRef(false);

  const ensureAudioContext = () => {
    if (typeof window === "undefined") return null;
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) return null;
    if (!audioCtxRef.current) {
      const ctx = new AudioCtor();
      const master = ctx.createGain();
      master.gain.value = 0.15; // keep master volume restrained
      master.connect(ctx.destination);
      audioCtxRef.current = ctx;
      gainRef.current = master;
    }
    return audioCtxRef.current;
  };

  const suspendAudio = () => {
    beepRef.current.nextTime = 0;
    try {
      audioCtxRef.current?.suspend?.();
    } catch {
      /* ignore */
    }
  };

  // Keep latest params without restarting the loop.
  useEffect(() => {
    paramsRef.current = { vxGroundMs, vzGroundMs, airspeedKmh, envWindKmh, envLiftMs, unit, t };
  }, [vxGroundMs, vzGroundMs, airspeedKmh, envWindKmh, envLiftMs, unit, t]);

  const varioActive = showVario && varioEnabled;
  useEffect(() => {
    varioActiveRef.current = varioActive;
    if (!varioActive) suspendAudio();
     
  }, [varioActive]);

  useEffect(() => {
    let raf;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const beep = beepRef.current;
    let dpr = Math.max(1, window.devicePixelRatio || 1);
    lastRef.current = performance.now();

    function resizeCanvas() {
      const cssW = Math.max(200, Math.floor(canvas.clientWidth));
      const cssH = Math.max(160, Math.floor(canvas.clientHeight));
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dimsRef.current = { w: cssW, h: cssH, dpr };
      particlesRef.current = makeParticles(particlesRef.current.length, cssW, cssH);
    }

    resizeCanvas();
    const onResize = () => {
      dpr = Math.max(1, window.devicePixelRatio || 1);
      resizeCanvas();
    };
    window.addEventListener("resize", onResize);

    function loop(now) {
      const dt = Math.min(0.05, (now - lastRef.current) / 1000);
      lastRef.current = now;

      const { w: W, h: H } = dimsRef.current;
      const {
        vxGroundMs: vxMs,
        vzGroundMs: vzMs,
        airspeedKmh: vKmh,
        envWindKmh: wKmh,
        envLiftMs: lMs,
      } = paramsRef.current;

      // ---- Update glider position ----
      const PX_PER_MS = (W / 720) * 8;
      let { x, y } = posRef.current;
      x += vxMs * PX_PER_MS * dt;
      y = Math.max(0, y + vzMs * 25 * dt);
      const groundY = H - 40;
      const gy = groundY - y;

      const margin = 40;
      if (x > W + margin || x < -margin || gy < -margin || gy >= groundY) {
        // Respawn heuristics: start higher when sinking out, lower in strong lift.
        const strongLift = lMs > 1.5;
        const strongSink = lMs < -1.5;
        x = vxMs >= 0 ? -20 : W + 20;
        if (gy >= groundY || strongSink) y = Math.min(groundY - 10, 160);
        else if (gy < -margin || strongLift) y = 60;
        else y = 120;
      }
      posRef.current = { x, y };

      // ---- Wind & lift particles ----
      const windVx = -wKmh * KMH_TO_MS * PX_PER_MS; // px/s (headwind flows left)
      const liftVy = -lMs * 8; // px/s (lift goes up)
      const parts = particlesRef.current;
      for (const p of parts) {
        p.x += (windVx + (Math.random() - 0.5) * 1.6) * dt;
        p.y += (liftVy + (Math.random() - 0.5) * 1.2) * dt;
        if (p.x < -10) p.x = W + 10;
        if (p.x > W + 10) p.x = -10;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;
      }

      // ---- Draw ----
      ctx.clearRect(0, 0, W, H);
      drawTerrain(ctx, W, groundY);
      drawParticles(ctx, parts, wKmh, windVx, liftVy);
      drawWindsock(ctx, W, H, dt, windVx, liftVy, windsockRef.current);
      if (hoverRef.current.overSock) drawWindsockTooltip(ctx, W, H, paramsRef.current);
      drawGlider(ctx, x, groundY - posRef.current.y, vxMs, vzMs, vKmh, H);

      // ---- Vario audio ----
      if (varioActiveRef.current) scheduleVarioBeep(now, vzMs);

      raf = requestAnimationFrame(loop);
    }

    function scheduleVarioBeep(now, vzMs) {
      try {
        const climb = Math.max(0, vzMs);
        const sink = Math.max(0, -vzMs);
        if (climb <= 0.1 && sink <= 0.1) return;
        if (now / 1000 < beepRef.current.nextTime) return;

        const ac = ensureAudioContext();
        if (!ac || !gainRef.current) {
          beepRef.current.nextTime = now / 1000 + 0.5; // retry later
          return;
        }
        if (ac.state === "suspended") {
          try {
            ac.resume?.();
          } catch {
            /* ignore */
          }
        }

        // Lift: faster beeps, higher pitch. Sink: slower beeps, lower pitch.
        const isSink = sink > climb;
        const period = isSink
          ? Math.min(1.2, 0.7 + Math.min(0.8, sink * 0.25))
          : Math.max(0.2, 0.9 - Math.min(0.7, climb * 0.12));
        const freq = isSink
          ? Math.max(220, 420 - Math.min(200, sink * 60))
          : 650 + Math.min(900, climb * 220);

        const osc = ac.createOscillator();
        osc.type = "square";
        osc.frequency.setValueAtTime(freq, ac.currentTime);
        const g = ac.createGain();
        g.gain.setValueAtTime(0, ac.currentTime);
        g.connect(gainRef.current);
        osc.connect(g);
        const dur = isSink ? 0.06 : 0.08 + Math.min(0.08, climb * 0.02);
        const t0 = ac.currentTime;
        g.gain.linearRampToValueAtTime(0.5, t0 + 0.01);
        g.gain.linearRampToValueAtTime(0, t0 + dur);
        osc.start();
        osc.stop(t0 + dur + 0.02);
        beepRef.current.nextTime = now / 1000 + period;
      } catch {
        /* audio failures must never break the render loop */
      }
    }

    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      try {
        audioCtxRef.current?.close?.();
      } catch {
        /* ignore */
      }
      audioCtxRef.current = null;
      gainRef.current = null;
      beep.nextTime = 0;
    };
     
  }, []);

  const toggleVario = () => {
    const next = !varioEnabled;
    setVarioEnabled(next);
    if (next) {
      const ac = ensureAudioContext(); // must be created in the user gesture
      try {
        ac?.resume?.();
      } catch {
        /* ignore */
      }
      beepRef.current.nextTime = 0;
    } else {
      suspendAudio();
    }
  };

  return (
    <div className="w-full" style={{ minHeight: "280px" }}>
      <div className="text-sm text-slate-600 dark:text-slate-300 mb-2 flex items-center gap-3 flex-wrap">
        <span>
          {t.glide_ratio_ground}:{" "}
          {typeof groundGlideRatio === "number" ? `${groundGlideRatio.toFixed(1)}:1` : "—"}
        </span>
        <span>
          {t.groundspeed}: {formatSpeed(vxGroundMs * MS_TO_KMH, unit, t)}
        </span>
        {showVario && (
          <span className="ml-2">
            {t.vario}: {formatVertical(vzGroundMs, unit, t)}
          </span>
        )}
        <span className="ml-auto flex items-center gap-2">
          {showVario && (
            <button
              title={varioEnabled ? t.vario_mute : t.vario_unmute}
              aria-pressed={varioEnabled}
              className={`px-2 py-1 text-sm rounded-full border transition-colors ${
                varioEnabled
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
              }`}
              onClick={toggleVario}
            >
              {varioEnabled ? "🔊 On" : "🔇 Off"}
            </button>
          )}
        </span>
      </div>
      <canvas
        ref={canvasRef}
        onPointerMove={(e) => {
          const rect = canvasRef.current.getBoundingClientRect();
          const mx = e.clientX - rect.left;
          const my = e.clientY - rect.top;
          const { w: cssW, h: cssH } = dimsRef.current;
          const baseX = cssW - 28;
          const baseY = cssH - 40 - 24;
          hoverRef.current.overSock =
            mx >= baseX - 100 && mx <= baseX + 30 && my >= baseY - 60 && my <= baseY + 60;
        }}
        onPointerLeave={() => {
          hoverRef.current.overSock = false;
        }}
        style={{ width: "100%", height: "calc(100% - 36px)", display: "block" }}
      />
    </div>
  );
}

// ===== Drawing helpers (pure canvas, no React) =====

function drawTerrain(ctx, W, groundY) {
  ctx.strokeStyle = "rgba(148,163,184,0.6)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  for (let i = 0; i <= W; i += 40) {
    ctx.lineTo(i, groundY - (Math.sin(i / 120) * 8 + 6));
  }
  ctx.stroke();
}

function drawParticles(ctx, parts, wKmh, windVx, liftVy) {
  const windMag = Math.abs(wKmh);
  const baseAlpha = Math.min(0.8, 0.25 + windMag * 0.02);
  const segScale = 0.05 + Math.min(0.08, windMag * 0.002);
  ctx.strokeStyle = `rgba(59,130,246,${baseAlpha.toFixed(3)})`;
  ctx.lineWidth = 1.2 + Math.min(1.0, windMag * 0.03);
  for (const p of parts) {
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x - windVx * segScale, p.y - liftVy * segScale);
    ctx.stroke();
  }
}

function drawWindsock(ctx, W, H, dt, windVx, liftVy, st) {
  const poleHeight = 24;
  const baseX = W - 28;
  const groundY = H - 40;
  const baseY = groundY - poleHeight;
  const verticalFactor = 0.35; // near ground, lift/sink influence is weaker
  const vx = windVx;
  const vy = liftVy * verticalFactor;
  const speed = Math.hypot(vx, vy);
  const maxRef = (W / 720) * 220;
  const sNorm = clamp01(speed / (maxRef * 0.5));
  const droop = (1 - sNorm) * 70; // hang down when calm
  const targetAngle = Math.atan2(vy + droop, vx);

  const tau = 0.35; // smoothing time constant (s)
  const a = 1 - Math.exp(-dt / Math.max(0.001, tau));
  st.angle = lerpAngle(st.angle, targetAngle, a);
  st.ext += (clamp01(speed / (maxRef * 0.4)) - st.ext) * a;
  st.phase += dt * (1.5 + sNorm * 2.0);

  // Pole
  ctx.strokeStyle = "#64748b";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(baseX, groundY);
  ctx.lineTo(baseX, baseY);
  ctx.stroke();

  // Sock geometry
  const L = 36 * (0.6 + 0.4 * st.ext);
  const rHead = 7;
  const rTail = Math.max(2, rHead * (0.45 + 0.4 * st.ext));
  const uX = Math.cos(st.angle);
  const uY = Math.sin(st.angle);
  const nX = -uY;
  const nY = uX;
  const flutter = Math.sin(st.phase * 2.0) * 2.0 * (1 - st.ext);

  // Red/white tapered bands
  const bands = [
    { t0: 0.0, t1: 0.33, color: "#ef4444" },
    { t0: 0.33, t1: 0.66, color: "#e2e8f0" },
    { t0: 0.66, t1: 1.0, color: "#ef4444" },
  ];
  for (const b of bands) {
    const a0x = baseX + uX * (L * b.t0);
    const a0y = baseY + uY * (L * b.t0);
    const a1x = baseX + uX * (L * b.t1);
    const a1y = baseY + uY * (L * b.t1);
    const r0 = rHead + (rTail - rHead) * b.t0;
    const r1 = rHead + (rTail - rHead) * b.t1;
    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.moveTo(a0x + nX * (r0 + flutter * (1 - b.t0)), a0y + nY * (r0 + flutter * (1 - b.t0)));
    ctx.lineTo(a1x + nX * (r1 + flutter * (1 - b.t1)), a1y + nY * (r1 + flutter * (1 - b.t1)));
    ctx.lineTo(a1x - nX * (r1 - flutter * (1 - b.t1)), a1y - nY * (r1 - flutter * (1 - b.t1)));
    ctx.lineTo(a0x - nX * (r0 - flutter * (1 - b.t0)), a0y - nY * (r0 - flutter * (1 - b.t0)));
    ctx.closePath();
    ctx.fill();
  }

  // Outline (midtone that reads on light and dark backgrounds)
  ctx.strokeStyle = "#475569";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(baseX + nX * rHead, baseY + nY * rHead);
  ctx.lineTo(baseX - nX * rHead, baseY - nY * rHead);
  ctx.lineTo(baseX + uX * L - nX * (rTail - flutter), baseY + uY * L - nY * (rTail - flutter));
  ctx.lineTo(baseX + uX * L + nX * (rTail + flutter), baseY + uY * L + nY * (rTail + flutter));
  ctx.closePath();
  ctx.stroke();
}

function drawWindsockTooltip(ctx, W, H, { unit, t, envWindKmh }) {
  const baseX = W - 28;
  const baseY = H - 40 - 24;
  const magKmh = Math.abs(envWindKmh);
  const val = convertSpeed(magKmh, unit);
  const uLabel = t[`unit_${unit}`];
  const dirLabel = envWindKmh >= 0 ? t.headwind : t.tailwind;
  const text = `${t.wind}: ${val.toFixed(1)} ${uLabel} (${dirLabel})`;

  ctx.save();
  ctx.font = '12px ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial';
  const pad = 6;
  const tw = ctx.measureText(text).width + pad * 2;
  const th = 20;
  let bx = baseX - tw - 8;
  let by = baseY - (th + 8);
  if (bx < 6) bx = 6;
  if (by < 6) by = baseY + 8;
  const r = 6;
  ctx.beginPath();
  ctx.moveTo(bx + r, by);
  ctx.lineTo(bx + tw - r, by);
  ctx.quadraticCurveTo(bx + tw, by, bx + tw, by + r);
  ctx.lineTo(bx + tw, by + th - r);
  ctx.quadraticCurveTo(bx + tw, by + th, bx + tw - r, by + th);
  ctx.lineTo(bx + r, by + th);
  ctx.quadraticCurveTo(bx, by + th, bx, by + th - r);
  ctx.lineTo(bx, by + r);
  ctx.quadraticCurveTo(bx, by, bx + r, by);
  ctx.closePath();
  ctx.fillStyle = "rgba(15,23,42,0.9)";
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.fillText(text, bx + pad, by + 13);
  ctx.restore();
}

function drawGlider(ctx, x, gy, vxMs, vzMs, vKmh, H) {
  const angle = Math.atan2(vzMs, vxMs);
  const arrowLen = Math.max(18, vKmh * 0.6);
  const gliderR = Math.max(4, H * 0.03);

  ctx.fillStyle = "#0ea5e9";
  ctx.beginPath();
  ctx.arc(x, gy, gliderR, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(x, gy);
  ctx.rotate(angle);
  ctx.strokeStyle = "#475569";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(arrowLen, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(arrowLen, 0);
  ctx.lineTo(arrowLen - 6, 3);
  ctx.lineTo(arrowLen - 6, -3);
  ctx.closePath();
  ctx.fillStyle = "#475569";
  ctx.fill();
  ctx.restore();
}

function makeParticles(n, w = 720, h = 220) {
  const arr = [];
  for (let i = 0; i < n; i++) arr.push({ x: Math.random() * w, y: Math.random() * h });
  return arr;
}

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

function lerpAngle(a, b, t) {
  const d = ((b - a + Math.PI) % (2 * Math.PI)) - Math.PI;
  return a + d * t;
}

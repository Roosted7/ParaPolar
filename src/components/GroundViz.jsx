import { useEffect, useRef, useState } from "react";
import { KMH_TO_MS, clamp, convertSpeed } from "../lib/units";

/**
 * The scene: a paraglider flying over terrain, wind/lift particles, and a
 * draggable windsock — drawn on a transparent canvas over a CSS sky gradient.
 *
 * Direct manipulation:
 * - drag the wing horizontally  -> speed (onDragSpeed(deltaKmh))
 * - drag the windsock           -> wind  (onDragWind(windKmh))
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
  flightMode,
  showVario,
  onDragSpeed,
  onDragWind,
}) {
  const canvasRef = useRef(null);
  const posRef = useRef({ x: 80, y: 150 }); // y = altitude px above ground line
  const particlesRef = useRef(makeParticles(110));
  const lastRef = useRef(0);
  const paramsRef = useRef({ vxGroundMs, vzGroundMs, airspeedKmh, envWindKmh, envLiftMs, flightMode, unit, t });
  const windsockRef = useRef({ angle: -Math.PI / 2, ext: 0.1, phase: 0 });
  const dimsRef = useRef({ w: 0, h: 0 });
  const hoverRef = useRef({ overSock: false, overWing: false });
  const dragRef = useRef(null); // {type: 'wing'|'sock', lastX, startWind}
  const callbacksRef = useRef({ onDragSpeed, onDragWind });

  // Keep latest params/callbacks without restarting the loop.
  useEffect(() => {
    paramsRef.current = { vxGroundMs, vzGroundMs, airspeedKmh, envWindKmh, envLiftMs, flightMode, unit, t };
    callbacksRef.current = { onDragSpeed, onDragWind };
  });

  // Vario audio (unchanged model: refs feed the loop, state feeds the button)
  const audioCtxRef = useRef(null);
  const gainRef = useRef(null);
  const beepRef = useRef({ nextTime: 0 });
  const [varioEnabled, setVarioEnabled] = useState(false);
  const varioActiveRef = useRef(false);

  const ensureAudioContext = () => {
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) return null;
    if (!audioCtxRef.current) {
      const ctx = new AudioCtor();
      const master = ctx.createGain();
      master.gain.value = 0.15;
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
      dimsRef.current = { w: cssW, h: cssH };
      particlesRef.current = makeParticles(particlesRef.current.length, cssW, cssH);
    }

    resizeCanvas();
    const onResize = () => {
      dpr = Math.max(1, window.devicePixelRatio || 1);
      resizeCanvas();
    };
    window.addEventListener("resize", onResize);
    const ro = new ResizeObserver(onResize);
    ro.observe(canvas);

    function loop(now) {
      const dt = Math.min(0.05, (now - lastRef.current) / 1000);
      lastRef.current = now;

      // Recover from resizes that happened while the tab was hidden.
      if (canvas.clientWidth && Math.abs(canvas.clientWidth - dimsRef.current.w) > 1) {
        resizeCanvas();
      }

      const { w: W, h: H } = dimsRef.current;
      const {
        vxGroundMs: vxMs,
        vzGroundMs: vzMs,
        airspeedKmh: vKmh,
        envWindKmh: wKmh,
        envLiftMs: lMs,
        flightMode: fMode,
      } = paramsRef.current;

      // ---- Update glider position ----
      const PX_PER_MS = (W / 720) * 8;
      let { x, y } = posRef.current;
      x += vxMs * PX_PER_MS * dt;
      y = Math.max(0, y + vzMs * 25 * dt);
      const groundY = H - 42;
      const gy = groundY - y;

      const margin = 46;
      if (x > W + margin || x < -margin || gy < -margin || gy >= groundY) {
        const strongLift = lMs > 1.5;
        const strongSink = lMs < -1.5;
        x = vxMs >= 0 ? -24 : W + 24;
        if (gy >= groundY || strongSink) y = Math.min(groundY - 12, H * 0.55);
        else if (gy < -margin || strongLift) y = H * 0.25;
        else y = H * 0.45;
      }
      posRef.current = { x, y };

      // ---- Wind & lift particles ----
      const windVx = -wKmh * KMH_TO_MS * PX_PER_MS;
      const liftVy = -lMs * 8;
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
      drawTerrain(ctx, W, H, groundY);
      drawParticles(ctx, parts, wKmh, windVx, liftVy);
      drawWindsock(ctx, W, H, dt, windVx, liftVy, windsockRef.current, hoverRef.current.overSock);
      if (hoverRef.current.overSock || dragRef.current?.type === "sock") {
        drawWindsockTooltip(ctx, W, H, paramsRef.current);
      }
      drawGlider(ctx, x, groundY - y, vxMs, vzMs, vKmh, fMode, now, hoverRef.current.overWing);

      // ---- Vario audio ----
      if (varioActiveRef.current) scheduleVarioBeep(now, vzMs);

      raf = requestAnimationFrame(loop);
    }

    function scheduleVarioBeep(now, vzMs) {
      try {
        const climb = Math.max(0, vzMs);
        const sink = Math.max(0, -vzMs);
        if (climb <= 0.1 && sink <= 0.1) return;
        if (now / 1000 < beep.nextTime) return;

        const ac = ensureAudioContext();
        if (!ac || !gainRef.current) {
          beep.nextTime = now / 1000 + 0.5;
          return;
        }
        if (ac.state === "suspended") {
          try {
            ac.resume?.();
          } catch {
            /* ignore */
          }
        }
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
        beep.nextTime = now / 1000 + period;
      } catch {
        /* audio failures must never break the render loop */
      }
    }

    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      ro.disconnect();
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

  // ---- Pointer interactions: hover cursors + wing/sock dragging ----
  const localPoint = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { mx: e.clientX - rect.left, my: e.clientY - rect.top };
  };

  const hitTest = (mx, my) => {
    const { w: W, h: H } = dimsRef.current;
    const groundY = H - 42;
    const gx = posRef.current.x;
    const gyPix = groundY - posRef.current.y;
    const overWing = Math.hypot(mx - gx, my - gyPix) < 36;
    const sockX = W - 34;
    const sockY = groundY - 26;
    const overSock = mx >= sockX - 90 && mx <= sockX + 26 && my >= sockY - 55 && my <= sockY + 55;
    return { overWing, overSock: !overWing && overSock };
  };

  const onPointerDown = (e) => {
    const { mx, my } = localPoint(e);
    const hit = hitTest(mx, my);
    if (hit.overWing) {
      dragRef.current = { type: "wing", lastX: e.clientX };
    } else if (hit.overSock) {
      dragRef.current = { type: "sock", lastX: e.clientX, startWind: paramsRef.current.envWindKmh };
    } else {
      return;
    }
    e.currentTarget.setPointerCapture(e.pointerId);
    e.preventDefault();
  };

  const onPointerMove = (e) => {
    const drag = dragRef.current;
    if (drag) {
      const dx = e.clientX - drag.lastX;
      if (drag.type === "wing") {
        drag.lastX = e.clientX;
        if (dx !== 0) callbacksRef.current.onDragSpeed?.(dx * 0.14);
      } else {
        // dragging the sock tail left = stronger headwind (headwind is positive)
        const wind = clamp(drag.startWind + (drag.lastX - e.clientX) * 0.18, -30, 30);
        callbacksRef.current.onDragWind?.(Math.round(wind));
      }
      return;
    }
    const { mx, my } = localPoint(e);
    hoverRef.current = { ...hoverRef.current, ...hitTest(mx, my) };
    const c = canvasRef.current;
    c.style.cursor = hoverRef.current.overWing || hoverRef.current.overSock ? "grab" : "default";
  };

  const endDrag = (e) => {
    if (dragRef.current) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      dragRef.current = null;
    }
  };

  const toggleVario = () => {
    const next = !varioEnabled;
    setVarioEnabled(next);
    if (next) {
      const ac = ensureAudioContext(); // must be created inside the user gesture
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
    <>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block touch-none select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={(e) => {
          hoverRef.current = { overSock: false, overWing: false };
          endDrag(e);
        }}
      />
      {showVario && (
        <button
          title={varioEnabled ? t.vario_mute : t.vario_unmute}
          aria-pressed={varioEnabled}
          className={`absolute bottom-16 left-3 font-data text-[11px] tracking-[0.1em] uppercase px-2.5 py-1.5 border backdrop-blur-[2px] transition-colors ${
            varioEnabled
              ? "bg-thermal text-ink border-thermal font-semibold"
              : "bg-ink/60 text-glacier border-white/25"
          }`}
          onClick={toggleVario}
        >
          {t.vario} {varioEnabled ? "🔊" : "🔇"}
        </button>
      )}
    </>
  );
}

// ===== Drawing helpers (pure canvas, no React) =====

function drawTerrain(ctx, W, H, groundY) {
  // distant range
  ctx.fillStyle = "rgba(20, 30, 46, 0.35)";
  ctx.beginPath();
  ctx.moveTo(0, groundY - 4);
  for (let i = 0; i <= W; i += 8) {
    ctx.lineTo(i, groundY - 14 - Math.sin(i / 95 + 2) * 16 - Math.sin(i / 41) * 6);
  }
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fill();

  // foreground silhouette
  ctx.fillStyle = "#101a28";
  ctx.beginPath();
  ctx.moveTo(0, groundY + 2);
  for (let i = 0; i <= W; i += 6) {
    ctx.lineTo(i, groundY - (Math.sin(i / 130) * 9 + Math.sin(i / 57 + 1.3) * 4 + 7));
  }
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fill();
}

function drawParticles(ctx, parts, wKmh, windVx, liftVy) {
  const windMag = Math.abs(wKmh);
  const baseAlpha = Math.min(0.75, 0.2 + windMag * 0.02);
  const segScale = 0.05 + Math.min(0.08, windMag * 0.002);
  ctx.strokeStyle = `rgba(226, 238, 248, ${baseAlpha.toFixed(3)})`;
  ctx.lineWidth = 1.1 + Math.min(0.9, windMag * 0.03);
  for (const p of parts) {
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x - windVx * segScale, p.y - liftVy * segScale);
    ctx.stroke();
  }
}

function drawGlider(ctx, x, gy, vxMs, vzMs, vKmh, flightMode, now, highlighted) {
  const unstable = flightMode === "stall" || flightMode === "collapse";
  // shudder + pitch-back when the wing departs normal flight
  const jx = unstable ? Math.sin(now / 24) * 2.2 : 0;
  const jy = unstable ? Math.cos(now / 31) * 2.2 : 0;
  const glideAngle = Math.atan2(vzMs, Math.max(2, Math.abs(vxMs))) * (vxMs >= 0 ? 1 : -1);
  const pitch = unstable ? (flightMode === "stall" ? -0.5 : 0.4) : clamp(glideAngle * 0.5, -0.35, 0.35);

  ctx.save();
  ctx.translate(x + jx, gy + jy);
  ctx.rotate(pitch);

  // canopy
  const span = 21;
  ctx.beginPath();
  ctx.ellipse(0, -15, span, 7.5, 0, Math.PI, 2 * Math.PI);
  ctx.fillStyle = highlighted ? "#f5b46b" : "#e8833a";
  ctx.fill();
  ctx.strokeStyle = "rgba(16, 26, 40, 0.55)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // lines
  ctx.strokeStyle = "rgba(230, 238, 246, 0.75)";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(-span + 3, -13);
  ctx.lineTo(0, 3);
  ctx.moveTo(span - 3, -13);
  ctx.lineTo(0, 3);
  ctx.moveTo(0, -15);
  ctx.lineTo(0, 3);
  ctx.stroke();

  // pilot
  ctx.beginPath();
  ctx.arc(0, 5, 3.4, 0, Math.PI * 2);
  ctx.fillStyle = "#101a28";
  ctx.fill();
  ctx.strokeStyle = "rgba(230, 238, 246, 0.6)";
  ctx.stroke();

  ctx.restore();

  // motion vector
  const angle = Math.atan2(vzMs, vxMs);
  const arrowLen = Math.max(16, vKmh * 0.5);
  ctx.save();
  ctx.translate(x + jx, gy + jy);
  ctx.rotate(angle);
  ctx.strokeStyle = "rgba(230, 238, 246, 0.45)";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(10, 0);
  ctx.lineTo(arrowLen, 0);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(arrowLen, 0);
  ctx.lineTo(arrowLen - 6, 3);
  ctx.lineTo(arrowLen - 6, -3);
  ctx.closePath();
  ctx.fillStyle = "rgba(230, 238, 246, 0.55)";
  ctx.fill();
  ctx.restore();
}

function drawWindsock(ctx, W, H, dt, windVx, liftVy, st, highlighted) {
  const poleHeight = 26;
  const baseX = W - 34;
  const groundY = H - 42;
  const baseY = groundY - poleHeight;
  const vx = windVx;
  const vy = liftVy * 0.35;
  const speed = Math.hypot(vx, vy);
  const maxRef = (W / 720) * 220;
  const sNorm = clamp01(speed / (maxRef * 0.5));
  const droop = (1 - sNorm) * 70;
  const targetAngle = Math.atan2(vy + droop, vx);

  const a = 1 - Math.exp(-dt / 0.35);
  st.angle = lerpAngle(st.angle, targetAngle, a);
  st.ext += (clamp01(speed / (maxRef * 0.4)) - st.ext) * a;
  st.phase += dt * (1.5 + sNorm * 2.0);

  ctx.strokeStyle = "rgba(230, 238, 246, 0.6)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(baseX, groundY);
  ctx.lineTo(baseX, baseY);
  ctx.stroke();

  const L = 38 * (0.6 + 0.4 * st.ext);
  const rHead = 7;
  const rTail = Math.max(2, rHead * (0.45 + 0.4 * st.ext));
  const uX = Math.cos(st.angle);
  const uY = Math.sin(st.angle);
  const nX = -uY;
  const nY = uX;
  const flutter = Math.sin(st.phase * 2.0) * 2.0 * (1 - st.ext);

  const bands = [
    { t0: 0.0, t1: 0.33, color: highlighted ? "#ff6b57" : "#ef4444" },
    { t0: 0.33, t1: 0.66, color: "#e8eef4" },
    { t0: 0.66, t1: 1.0, color: highlighted ? "#ff6b57" : "#ef4444" },
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
}

function drawWindsockTooltip(ctx, W, H, { unit, t, envWindKmh }) {
  const baseX = W - 34;
  const baseY = H - 42 - 26;
  const magKmh = Math.abs(envWindKmh);
  const val = convertSpeed(magKmh, unit);
  const uLabel = t[`unit_${unit}`];
  const dirLabel = envWindKmh >= 0 ? t.headwind : t.tailwind;
  const text = `${t.wind}: ${val.toFixed(0)} ${uLabel} (${dirLabel}) ⇔`;

  ctx.save();
  ctx.font = '11px ui-monospace, "SF Mono", Consolas, monospace';
  const pad = 7;
  const tw = ctx.measureText(text).width + pad * 2;
  const th = 22;
  let bx = baseX - tw - 10;
  let by = baseY - (th + 10);
  if (bx < 6) bx = 6;
  if (by < 6) by = baseY + 10;
  ctx.fillStyle = "rgba(14, 26, 43, 0.9)";
  ctx.strokeStyle = "rgba(245, 180, 107, 0.5)";
  ctx.beginPath();
  ctx.rect(bx, by, tw, th);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#f5b46b";
  ctx.fillText(text, bx + pad, by + 15);
  ctx.restore();
}

function makeParticles(n, w = 720, h = 300) {
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

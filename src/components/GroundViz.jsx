import React, { useEffect, useRef, useState } from "react";
import { KMH_TO_MS } from "../lib/physics";

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
  // Keep animation state in refs to avoid React re-renders each frame
  const posRef = useRef({ x: 30, y: 120 }); // y = altitude pixels above ground line
  const particlesRef = useRef(makeParticles(120));
  const lastRef = useRef(performance.now());
  const paramsRef = useRef({ vxGroundMs, vzGroundMs, airspeedKmh, envWindKmh, envLiftMs, unit, t });
  // Windsock state (angle radians, extension 0..1, phase for flutter)
  const windsockRef = useRef({ angle: -Math.PI / 2, ext: 0.1, phase: Math.random() * 1000 });
  // Hover tooltip for windsock
  const dimsRef = useRef({ w: 0, h: 0, dpr: 1 });
  const hoverRef = useRef({ overSock: false, mx: 0, my: 0 });
  // Vario audio
  const audioCtxRef = useRef(null);
  const gainRef = useRef(null);
  const beepRef = useRef({ vol: 0.5, nextTime: 0 });
  const [varioEnabled, setVarioEnabled] = useState(false);
  const ensureAudioContext = () => {
    if (typeof window === "undefined") return null;
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) return null;
    if (!audioCtxRef.current) {
      const ctx = new AudioCtor();
      const master = ctx.createGain();
      master.gain.value = 0.15; // Keep master volume restrained
      master.connect(ctx.destination);
      audioCtxRef.current = ctx;
      gainRef.current = master;
    } else if (!gainRef.current && audioCtxRef.current) {
      const master = audioCtxRef.current.createGain();
      master.gain.value = 0.15;
      master.connect(audioCtxRef.current.destination);
      gainRef.current = master;
    }
    return audioCtxRef.current;
  };

  // Keep latest params without restarting the loop
  useEffect(() => {
    paramsRef.current = { vxGroundMs, vzGroundMs, airspeedKmh, envWindKmh, envLiftMs, unit, t };
    lastRef.current = performance.now();
  }, [vxGroundMs, vzGroundMs, airspeedKmh, envWindKmh, envLiftMs, unit, t]);

  // Stop audio when vario disabled or showVario is false
  useEffect(() => {
    if (!showVario) {
      setVarioEnabled(false);
      beepRef.current.nextTime = 0;
      if (audioCtxRef.current) {
        try { audioCtxRef.current.suspend && audioCtxRef.current.suspend(); } catch {}
      }
    }
  }, [showVario]);

  useEffect(() => {
    let raf;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let dpr = Math.max(1, window.devicePixelRatio || 1);

    function resizeCanvas() {
      const cssW = Math.max(200, Math.floor(canvas.clientWidth));
      const cssH = Math.max(160, Math.floor(canvas.clientHeight));
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dimsRef.current = { w: cssW, h: cssH, dpr };
      // regenerate particles to fill new size (keep previous count)
      const prev = particlesRef.current;
      particlesRef.current = makeParticles(prev.length, cssW, cssH);
    }

    // initial resize
    resizeCanvas();
    const onResize = () => {
      dpr = Math.max(1, window.devicePixelRatio || 1);
      resizeCanvas();
    };
    window.addEventListener("resize", onResize);

  function loop(now) {
      const dt = Math.min(0.05, (now - lastRef.current) / 1000); // seconds
      lastRef.current = now;

      const cssW = canvas.width / dpr;
      const cssH = canvas.height / dpr;
      const W = cssW, H = cssH;

      // Read latest params
      const { vxGroundMs: vxMs, vzGroundMs: vzMs, airspeedKmh: vKmh, envWindKmh: wKmh, envLiftMs: lMs } = paramsRef.current;

      // Update glider position
      const PX_PER_MS = (W / 720) * 8;
      const speedPx = vxMs * PX_PER_MS * dt; // px per frame
      const vzPx = vzMs * 25 * dt; // sink (<0) -> y decreases (go down)
      let { x, y } = posRef.current;
      x += speedPx;
      y = Math.max(0, y + vzPx);
      const groundY = H - 40; // baseline terrain height
      const gy = groundY - y; // canvas y position

      const margin = 40;
      if (x > W + margin || x < -margin || gy < -margin || gy >= groundY) {
        // Determine respawn altitude heuristically from last exit
        // If exited at ground or strong sink, start higher; if exited at top or strong lift, start lower
        const strongLift = lMs > 1.5;
        const strongSink = lMs < -1.5;
        // Spawn side based on current ground speed direction
        const goingRight = vxMs >= 0;
        x = goingRight ? -20 : W + 20;
        if (gy >= groundY || strongSink) {
          y = Math.min(groundY - 10, 160); // start higher to show more glide
        } else if (gy < -margin || strongLift) {
          y = 60; // start lower when lift is high so path stays visible
        } else {
          y = 120;
        }
      }

      // Wind & lift particles
      const windVx = -wKmh * KMH_TO_MS * PX_PER_MS; // px/s (headwind>0 flows left)
      const liftVy = -lMs * 8; // px/s (lift + goes up)
      const parts = particlesRef.current;
      for (const p of parts) {
        p.x += (windVx + (Math.random() - 0.5) * 1.6) * dt;
        p.y += (liftVy + (Math.random() - 0.5) * 1.2) * dt;
        if (p.x < -10) p.x = W + 10;
        if (p.x > W + 10) p.x = -10;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;
      }

  // Persist
      posRef.current = { x, y };

      // Draw
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = getComputedStyle(canvasRef.current).getPropertyValue("--bg") || "#ffffff";
      ctx.fillRect(0, 0, W, H);

      // terrain
      ctx.strokeStyle = "rgba(148,163,184,0.6)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      for (let i = 0; i <= W; i += 40) {
        const h = Math.sin(i / 120) * 8 + 6;
        ctx.lineTo(i, groundY - h);
      }
      ctx.stroke();

      // particles (visibility scales with wind magnitude; size increases slightly with speed)
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

  // Windsock physics: respond to wind with damping, reduced vertical influence near ground
      {
        const poleHeight = 24;
        const baseX = W - 28;
        const groundY = H - 40;
        const baseY = groundY - poleHeight;
        const verticalFactor = 0.35; // near ground, lift/sink influence is weaker
        const vx = windVx; // px/s (flow to left if headwind)
        const vy = liftVy * verticalFactor; // px/s
        const speed = Math.hypot(vx, vy);
        // Add droop (gravity) when wind is weak so sock hangs downward
        const maxRef = (W / 720) * 220; // reference scale for normalization
        const sNorm = clamp01(speed / (maxRef * 0.5));
        const droop = (1 - sNorm) * 70; // px/s downward bias when calm
        const tx = vx;
        const ty = vy + droop;
        let targetAngle = Math.atan2(ty, tx);
        // Smooth angle with shortest-arc interpolation
        const st = windsockRef.current;
        const tau = 0.35; // time constant (s)
        const a = 1 - Math.exp(-dt / Math.max(0.001, tau));
        st.angle = lerpAngle(st.angle, targetAngle, a);
        // Extension proportional to wind magnitude with soft cap
        const L0 = 36; // base sock length
        const extTarget = clamp01(speed / (maxRef * 0.4));
        st.ext = st.ext + (extTarget - st.ext) * a;
        st.phase += dt * (1.5 + sNorm * 2.0);

        // Draw windsock pole
        ctx.strokeStyle = "#64748b"; // slate-500
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(baseX, groundY);
        ctx.lineTo(baseX, baseY);
        ctx.stroke();

        // Sock geometry
        const L = L0 * (0.6 + 0.4 * st.ext);
        const rHead = 7;
        const rTail = Math.max(2, rHead * (0.45 + 0.4 * st.ext));
        const uX = Math.cos(st.angle);
        const uY = Math.sin(st.angle);
        const nX = -uY;
        const nY = uX;
        // Small flutter at tail, more when wind is light
        const flutterAmp = 2.0 * (1 - st.ext);
        const flutter = Math.sin(st.phase * 2.0) * flutterAmp;

        // Head (near pole) ellipse
        const headLeftX = baseX + nX * rHead;
        const headLeftY = baseY + nY * rHead;
        const headRightX = baseX - nX * rHead;
        const headRightY = baseY - nY * rHead;

        // Tail (downstream end)
        const tailCx = baseX + uX * L;
        const tailCy = baseY + uY * L;
        const tailLeftX = tailCx + nX * (rTail + flutter);
        const tailLeftY = tailCy + nY * (rTail + flutter);
        const tailRightX = tailCx - nX * (rTail - flutter);
        const tailRightY = tailCy - nY * (rTail - flutter);

        // Draw stripes (red/white) as three tapered bands
        const bands = [
          { t0: 0.0, t1: 0.33, color: "#ef4444" }, // red
          { t0: 0.33, t1: 0.66, color: "#e2e8f0" }, // white-ish (light)
          { t0: 0.66, t1: 1.0, color: "#ef4444" }, // red
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

        // Outline for clarity
        ctx.strokeStyle = "#0f172a"; // slate-900
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(headLeftX, headLeftY);
        ctx.lineTo(headRightX, headRightY);
        ctx.lineTo(tailRightX, tailRightY);
        ctx.lineTo(tailLeftX, tailLeftY);
        ctx.closePath();
        ctx.stroke();

        // Tooltip on hover near windsock
        if (hoverRef.current.overSock) {
          const { unit, t } = paramsRef.current;
          const magKmh = Math.abs(wKmh);
          let val, uLabel;
          if (unit === "kmh") {
            val = magKmh; uLabel = t.unit_kmh;
          } else if (unit === "ms") {
            val = magKmh * KMH_TO_MS; uLabel = t.unit_ms;
          } else if (unit === "mph") {
            val = magKmh * 0.6213712; uLabel = t.unit_mph;
          } else if (unit === "kt") {
            val = magKmh * 0.5399568; uLabel = t.unit_kt;
          } else {
            val = magKmh; uLabel = t.unit_kmh;
          }
          const dirLabel = wKmh >= 0 ? t.headwind : t.tailwind;
          const text = `${t.wind}: ${val.toFixed(1)} ${uLabel} (${dirLabel})`;
          ctx.save();
          ctx.font = '12px ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial';
          const pad = 6;
          const metrics = ctx.measureText(text);
          const tw = metrics.width + pad * 2;
          const th = 20;
          let bx = baseX - tw - 8;
          let by = baseY - (th + 8);
          if (bx < 6) bx = 6;
          if (by < 6) by = baseY + 8;
          // rounded rect
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
          ctx.fillStyle = 'rgba(15,23,42,0.9)';
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.fillText(text, bx + pad, by + 13);
          ctx.restore();
        }
      }

  // glider
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
      ctx.strokeStyle = "#0f172a";
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
      ctx.fillStyle = "#0f172a";
      ctx.fill();
      ctx.restore();

      // vario audio scheduling (lift & sink):
      // - lift: faster beeps, higher pitch (current max kept)
      // - sink: slower beeps, lower pitch
      try {
        if (showVario && varioEnabled) {
          const climb = Math.max(0, vzMs);
          const sink = Math.max(0, -vzMs);
          if (climb > 0.1 || sink > 0.1) {
            const isSink = sink > climb;
            const period = isSink
              ? Math.min(1.2, 0.7 + Math.min(0.8, sink * 0.25))
              : Math.max(0.2, 0.9 - Math.min(0.7, climb * 0.12));
            const freq = isSink
              ? Math.max(220, 420 - Math.min(200, sink * 60))
              : 650 + Math.min(900, climb * 220);
            if (now / 1000 >= beepRef.current.nextTime) {
              const ac = ensureAudioContext();
              if (!ac || !gainRef.current) {
                beepRef.current.nextTime = now / 1000 + 0.5;
                return;
              }
              if (ac.state === "suspended" && ac.resume) {
                try { ac.resume(); } catch {}
              }
              const osc = ac.createOscillator();
              osc.type = 'square';
              osc.frequency.setValueAtTime(freq, ac.currentTime);
              const g = ac.createGain();
              g.gain.setValueAtTime(0, ac.currentTime);
              g.connect(gainRef.current);
              osc.connect(g);
              const dur = isSink ? 0.06 : (0.08 + Math.min(0.08, climb * 0.02));
              const t0 = ac.currentTime;
              g.gain.linearRampToValueAtTime(0.5, t0 + 0.01);
              g.gain.linearRampToValueAtTime(0, t0 + dur);
              osc.start();
              osc.stop(t0 + dur + 0.02);
              beepRef.current.nextTime = now / 1000 + period;
            }
          } else {
            // no tone in sink/calm; let scheduled end naturally
          }
        }
      } catch {}

      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      if (audioCtxRef.current) {
        try { audioCtxRef.current.close && audioCtxRef.current.close(); } catch {}
        audioCtxRef.current = null;
      }
      gainRef.current = null;
      beepRef.current.nextTime = 0;
    };
  }, []);

  const groundRatioLabel = typeof groundGlideRatio === "number"
    ? `${groundGlideRatio.toFixed(1)}:1`
    : "—";

  return (
    <div className="w-full" style={{ minHeight: "280px" }}>
      <div className="text-sm text-slate-600 dark:text-slate-300 mb-2 flex items-center gap-3">
        <span>{t.glide_ratio_ground}: {groundRatioLabel}</span>
        <span>
          {t.groundspeed}: {(() => {
            const gsKmh = vxGroundMs * 3.6;
            // reuse speed conversion semantics from physics (duplicated minimal logic to avoid import cycle)
            if (unit === "kmh") return `${gsKmh.toFixed(1)} ${t.unit_kmh}`;
            if (unit === "ms") return `${(vxGroundMs).toFixed(1)} ${t.unit_ms}`;
            if (unit === "mph") return `${(gsKmh * 0.6213712).toFixed(1)} ${t.unit_mph}`;
            if (unit === "kt") return `${(gsKmh * 0.5399568).toFixed(1)} ${t.unit_kt}`;
            return `${gsKmh.toFixed(1)} ${t.unit_kmh}`;
          })()}
        </span>
        {showVario && (
          <span className="ml-2">{t.vario}: {(() => {
            const v = vzGroundMs; // m/s (lift positive)
            return `${v.toFixed(2)} ${t.unit_ms}`;
          })()}</span>
        )}
        <span className="ml-auto flex items-center gap-2">
          {showVario && (
          <button
            title={varioEnabled ? 'Mute vario' : 'Unmute vario'}
            className={`px-2 py-1 text-sm rounded-full border transition-colors ${varioEnabled ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600'}`}
            onClick={() => {
              const next = !varioEnabled;
              setVarioEnabled(next);
              // Suspend/Resume context for power when toggling
              if (!next) {
                beepRef.current.nextTime = 0;
                if (audioCtxRef.current) {
                  try { audioCtxRef.current.suspend && audioCtxRef.current.suspend(); } catch {}
                }
              } else {
                const ac = ensureAudioContext();
                if (ac && ac.resume) {
                  try { ac.resume(); } catch {}
                }
                beepRef.current.nextTime = 0;
              }
            }}
          >{varioEnabled ? '🔊 On' : '🔇 Off'}</button>)}
        </span>
      </div>
      <canvas
        ref={canvasRef}
        onPointerMove={(e) => {
          const c = canvasRef.current;
          if (!c) return;
          const rect = c.getBoundingClientRect();
          const mx = e.clientX - rect.left;
          const my = e.clientY - rect.top;
          const { w: cssW, h: cssH } = dimsRef.current;
          const groundY = cssH - 40;
          const baseX = cssW - 28;
          const baseY = groundY - 24;
          // Simple hit box around sock area
          const hit = mx >= baseX - 100 && mx <= baseX + 30 && my >= baseY - 60 && my <= baseY + 60;
          hoverRef.current = { overSock: !!hit, mx, my };
        }}
        onPointerLeave={() => { hoverRef.current = { overSock: false, mx: 0, my: 0 }; }}
        style={{
          width: "100%",
          height: "calc(100% - 36px)",
          background: "transparent",
          "--bg": "transparent",
          display: "block",
        }}
      />
    </div>
  );
}

function makeParticles(n, w = 720, h = 220) {
  const arr = [];
  const padY = 0; // allow full vertical coverage
  for (let i = 0; i < n; i++) arr.push({ x: Math.random() * w, y: padY + Math.random() * (h - padY * 2) });
  return arr;
}

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

function lerpAngle(a, b, t) {
  // Normalize to [-PI, PI]
  let d = ((b - a + Math.PI) % (2 * Math.PI)) - Math.PI;
  return a + d * t;
}

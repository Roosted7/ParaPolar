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
}) {
  const canvasRef = useRef(null);
  // Keep animation state in refs to avoid React re-renders each frame
  const posRef = useRef({ x: 30, y: 120 }); // y = altitude pixels above ground line
  const particlesRef = useRef(makeParticles(120));
  const lastRef = useRef(performance.now());
  const paramsRef = useRef({ vxGroundMs, vzGroundMs, airspeedKmh, envWindKmh, envLiftMs });
  // Windsock state (angle radians, extension 0..1, phase for flutter)
  const windsockRef = useRef({ angle: -Math.PI / 2, ext: 0.1, phase: Math.random() * 1000 });

  // Keep latest params without restarting the loop
  useEffect(() => {
    paramsRef.current = { vxGroundMs, vzGroundMs, airspeedKmh, envWindKmh, envLiftMs };
    lastRef.current = performance.now();
  }, [vxGroundMs, vzGroundMs, airspeedKmh, envWindKmh, envLiftMs]);

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
      if (x > W + margin || gy < -margin || gy >= groundY) {
        // Determine respawn altitude heuristically from last exit
        // If exited at ground or strong sink, start higher; if exited at top or strong lift, start lower
        const strongLift = lMs > 1.5;
        const strongSink = lMs < -1.5;
        x = -20; // come in from left
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

      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="w-full" style={{ minHeight: "280px" }}>
      <div className="text-sm text-slate-600 dark:text-slate-300 mb-2">
        {t.glide_ratio_ground}: {((-vzGroundMs) / (vxGroundMs || 1)).toFixed(1) + ":1"}
        <span className="ml-3">
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
      </div>
      <canvas
        ref={canvasRef}
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

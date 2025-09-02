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
    <div className="w-full" style={{ minHeight: "360px" }}>
      <div className="text-sm text-slate-600 dark:text-slate-300 mb-2">
        Glide Ratio: {" "}
        {vxGroundMs > 0 && vzGroundMs < 0
          ? (-vzGroundMs / vxGroundMs).toFixed(1) + ":1"
          : "—"}
        <span className="ml-3">Groundspeed: {(vxGroundMs * 3.6).toFixed(1)} km/h</span>
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

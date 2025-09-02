import React, { useEffect, useRef, useState } from "react";
import { KMH_TO_MS, clamp } from "../lib/physics";

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
  const [state, setState] = useState({ x: 30, y: 120 }); // y = altitude pixels above ground line
  const [particles, setParticles] = useState(() => makeParticles(120));
  const lastRef = useRef(performance.now());

  useEffect(() => {
    lastRef.current = performance.now();
  }, [vxGroundMs, vzGroundMs, airspeedKmh, envWindKmh, envLiftMs]);

  useEffect(() => {
    let raf;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let dpr = Math.max(1, window.devicePixelRatio || 1);

  function resizeCanvas() {
      const cssW = Math.max(200, Math.floor(canvas.clientWidth));
      const cssH = Math.max(120, Math.floor(canvas.clientHeight));
      // set the internal pixel size taking DPR into account
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      // map drawing coordinates so we can draw in CSS pixels
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  // regenerate particles to fill new size (keep previous count)
  setParticles((prev) => makeParticles(prev.length, cssW, cssH));
    }

    // initial resize
    resizeCanvas();
    // handle window resizes
    const onResize = () => {
      dpr = Math.max(1, window.devicePixelRatio || 1);
      resizeCanvas();
    };
    window.addEventListener("resize", onResize);

    function loop(now) {
      const dt = Math.min(0.05, (now - lastRef.current) / 1000); // seconds
      lastRef.current = now;

      // Work in CSS pixels. canvas.width/height are device pixels so derive CSS size
      const cssW = canvas.width / dpr;
      const cssH = canvas.height / dpr;
      const W = cssW,
        H = cssH;

      // Update glider state
      // Use a single px-per-(m/s) scale that adapts with canvas width so
      // glider and particles remain visually consistent when the canvas
      // is resized.
      const PX_PER_MS = (W / 720) * 8;
      const speedPx = vxGroundMs * PX_PER_MS * dt; // px per frame
      const vzPx = -vzGroundMs * 25 * dt; // sink negative -> go down
      let x = state.x + speedPx;
      let y = Math.max(0, state.y + vzPx);
      const groundY = H - 40; // baseline terrain height

      // Compute draw Y (canvas coordinates) from altitude
      const gy = groundY - y; // canvas y position (smaller => higher on canvas)

      // Respawn if out of box or collided:
      // - flew off the right edge (x > W + margin)
      // - flew well above the top (gy < -margin)
      // - collided with ground (gy >= groundY)
      const margin = 40;
      if (x > W + margin || gy < -margin || gy >= groundY) {
        x = -20;
        y = 120; // respawn from left
      }

      // Wind & lift particles
  // envWindKmh is positive for headwind (wind opposing the glider's
  // forward motion). A positive headwind means air is moving left while
  // the glider moves right, so particle velocity along +x must be the
  // negative of envWindKmh. Flip the sign to make particle motion match
  // the environment convention.
  // Scale particle motion to match glider visual scale
  const windVx = -envWindKmh * KMH_TO_MS * PX_PER_MS; // px/s
      // smaller vertical particle motion so particles don't zip away
      const liftVy = -envLiftMs * 8; // px/s (lift + goes up)
      for (const p of particles) {
        // reduced jitter so trails look smoother and comparable to wind
        p.x += (windVx + (Math.random() - 0.5) * 2) * dt;
        p.y += (liftVy + (Math.random() - 0.5) * 1.5) * dt;
        // wrap across full visible CSS bounds (no inner padding)
        if (p.x < -10) p.x = W + 10;
        if (p.x > W + 10) p.x = -10;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;
      }

      setState({ x, y });

      // Draw
  // clear in CSS pixels (ctx is already scaled to DPR)
  ctx.clearRect(0, 0, W, H);
      // background
      ctx.fillStyle =
        getComputedStyle(canvasRef.current).getPropertyValue("--bg") ||
        "#ffffff";
      ctx.fillRect(0, 0, W, H);

      // terrain
      ctx.strokeStyle = "rgba(148,163,184,0.6)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      for (let i = 0; i <= W; i += 40) {
        const h = Math.sin(i / 120) * 8 + 6; // gentle undulation
        ctx.lineTo(i, groundY - h);
      }
      ctx.stroke();

      // particles
      ctx.strokeStyle = "rgba(59,130,246,0.5)";
      ctx.lineWidth = 1.5;
      for (const p of particles) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - windVx * 0.06, p.y - liftVy * 0.06);
        ctx.stroke();
      }

  // glider icon + arrow (length ∝ airspeed)
  // `gy` already computed above
  const angle = Math.atan2(vzGroundMs, vxGroundMs); // radians (down is positive)
  const arrowLen = Math.max(18, airspeedKmh * 0.6); // px
  // scale glider size with canvas height for consistent appearance
  const gliderR = Math.max(4, H * 0.03);

  // body
  ctx.fillStyle = "#0ea5e9";
  ctx.beginPath();
  ctx.arc(state.x, gy, gliderR, 0, Math.PI * 2);
  ctx.fill();
      // arrow
      ctx.save();
      ctx.translate(state.x, gy);
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
  }, [
    vxGroundMs,
    vzGroundMs,
    airspeedKmh,
    envWindKmh,
    envLiftMs,
    particles,
    state,
  ]);

  return (
    <div className="w-full" style={{ minHeight: "360px" }}>
      <div className="text-sm text-slate-600 dark:text-slate-300 mb-2">
        Glide Ratio:{" "}
        {vxGroundMs > 0 ? (-vzGroundMs / vxGroundMs).toFixed(1) + ":1" : "—"}
        <span className="ml-3">
          Groundspeed: {(vxGroundMs * 3.6).toFixed(1)} km/h
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

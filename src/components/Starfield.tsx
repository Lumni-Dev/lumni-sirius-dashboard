"use client";

import { useEffect, useRef } from "react";

// Campo de estrelas portado do lumni-sirius-app (web/js/backdrop.js):
// estrelas em camadas com cintilancia, halo e parallax suave no ponteiro.
export default function Starfield() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    type Star = {
      x: number;
      y: number;
      z: number;
      r: number;
      phase: number;
      speed: number;
      twinkle: number;
      spark: number;
      cool: boolean;
      layer: "dust" | "far" | "mid" | "near";
    };

    let w = 0;
    let h = 0;
    let stars: Star[] = [];
    let raf = 0;
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const drift = { x: 0, y: 0, vx: 0.16, vy: 0.09 };

    function spawnStar(depth: number, x: number, y: number): Star {
      const near = depth > 0.7;
      return {
        x,
        y,
        z: depth,
        r: 0.18 + depth * 0.55 + Math.random() * (near ? 0.35 : 0.2),
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * (1.2 + depth),
        twinkle: 0.4 + Math.random() * 0.5,
        spark: near ? 0.12 + Math.random() * 0.28 : 0.04 + Math.random() * 0.12,
        cool: Math.random() < 0.32,
        layer: depth < 0.3 ? "dust" : depth < 0.55 ? "far" : depth < 0.75 ? "mid" : "near",
      };
    }

    function placeStars(count: number, zMin: number, zMax: number, minDist: number, placed: Star[]) {
      const out: Star[] = [];
      let tries = 0;
      while (out.length < count && tries < count * 50) {
        tries += 1;
        const x = Math.random();
        const y = Math.random();
        const tooClose = placed.some((p) => {
          const dx = p.x - x;
          const dy = p.y - y;
          const minZ = Math.min(p.z, (zMin + zMax) / 2);
          const allow = minDist * (0.55 + minZ * 0.7);
          return dx * dx + dy * dy < allow * allow;
        });
        if (tooClose) continue;
        const star = spawnStar(zMin + Math.random() * (zMax - zMin), x, y);
        out.push(star);
        placed.push(star);
      }
      return out;
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas!.width = Math.floor(w * dpr);
      canvas!.height = Math.floor(h * dpr);
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      const area = w * h;
      const dust = Math.max(18, Math.floor(area / 22000));
      const far = Math.max(12, Math.floor(area / 36000));
      const mid = Math.max(8, Math.floor(area / 52000));
      const near = Math.max(5, Math.floor(area / 90000));
      const close = Math.max(2, Math.floor(area / 160000));
      const placed: Star[] = [];
      stars = [
        ...placeStars(dust, 0.06, 0.28, 0.045, placed),
        ...placeStars(far, 0.28, 0.48, 0.06, placed),
        ...placeStars(mid, 0.48, 0.68, 0.08, placed),
        ...placeStars(near, 0.68, 0.86, 0.1, placed),
        ...placeStars(close, 0.86, 1.0, 0.13, placed),
      ];
    }

    function onMove(e: PointerEvent) {
      mouse.tx = (e.clientX / Math.max(w, 1)) * 2 - 1;
      mouse.ty = (e.clientY / Math.max(h, 1)) * 2 - 1;
    }
    function onLeave() {
      mouse.tx = 0;
      mouse.ty = 0;
    }

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerleave", onLeave);

    let last = performance.now();
    function draw(ts: number) {
      const dt = Math.min(0.05, (ts - last) / 1000);
      last = ts;
      const t = ts / 1000;

      mouse.x += (mouse.tx - mouse.x) * Math.min(1, 8 * dt);
      mouse.y += (mouse.ty - mouse.y) * Math.min(1, 8 * dt);
      drift.x += (drift.vx + Math.sin(t * 0.35) * 0.04) * dt;
      drift.y += (drift.vy + Math.cos(t * 0.28) * 0.028) * dt;

      const maxShift = Math.min(72, w * 0.07);
      const ox = mouse.x * maxShift;
      const oy = mouse.y * maxShift;

      ctx!.clearRect(0, 0, w, h);

      for (const st of stars) {
        const depth = 0.15 + st.z * 1.75;
        const persp = 1 + st.z * 0.4;
        const sx = (st.x + drift.x * (0.1 + st.z * 0.65)) * w - ox * depth;
        const sy = (st.y + drift.y * (0.08 + st.z * 0.55)) * h - oy * depth;
        const cx = w * 0.5;
        const cy = h * 0.5;
        const px = ((sx % w) + w) % w;
        const py = ((sy % h) + h) % h;
        const x = cx + (px - cx) * persp + mouse.x * st.z * 12;
        const y = cy + (py - cy) * persp + mouse.y * st.z * 9;

        const wave = 0.5 + 0.5 * Math.sin(st.phase + t * st.speed);
        const spark = Math.pow(Math.max(0, Math.sin(st.phase * 1.7 + t * st.speed * 2.4)), 12);
        const breath = 1 - st.twinkle + st.twinkle * wave;
        const shine = breath + spark * st.spark * 3;
        const layerGain =
          st.layer === "dust" ? 0.55 : st.layer === "far" ? 0.75 : st.layer === "mid" ? 0.9 : 1;
        const a = Math.min(1, (0.18 + st.z * 0.55) * shine * layerGain);
        const r = st.r * (0.8 + 0.4 * spark + 0.12 * wave) * persp;
        const tint = st.cool ? [200, 215, 245] : [255, 248, 236];

        const haloR = r * (4.5 + st.z * 6 + spark * 5);
        const halo = ctx!.createRadialGradient(x, y, 0, x, y, haloR);
        halo.addColorStop(0, `rgba(${tint[0]},${tint[1]},${tint[2]},${(a * 0.75).toFixed(3)})`);
        halo.addColorStop(0.28, `rgba(${tint[0]},${tint[1]},${tint[2]},${(a * 0.2).toFixed(3)})`);
        halo.addColorStop(1, `rgba(${tint[0]},${tint[1]},${tint[2]},0)`);
        ctx!.globalAlpha = 1;
        ctx!.fillStyle = halo;
        ctx!.beginPath();
        ctx!.arc(x, y, haloR, 0, Math.PI * 2);
        ctx!.fill();

        if (a > 0.5 && st.z > 0.55) {
          const flare = a * (0.22 + spark * 0.55);
          const arm = r * (3.5 + st.z * 5.5 + spark * 9);
          ctx!.strokeStyle = `rgba(${tint[0]},${tint[1]},${tint[2]},${flare.toFixed(3)})`;
          ctx!.lineWidth = Math.max(0.35, r * 0.4);
          ctx!.lineCap = "round";
          ctx!.beginPath();
          ctx!.moveTo(x - arm, y);
          ctx!.lineTo(x + arm, y);
          ctx!.moveTo(x, y - arm);
          ctx!.lineTo(x, y + arm);
          ctx!.stroke();
        }

        ctx!.globalAlpha = Math.min(1, a + (st.z > 0.7 ? 0.4 : 0.2));
        ctx!.fillStyle = `rgb(${tint[0]},${tint[1]},${tint[2]})`;
        ctx!.beginPath();
        ctx!.arc(x, y, Math.max(0.35, r), 0, Math.PI * 2);
        ctx!.fill();
      }

      ctx!.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    />
  );
}

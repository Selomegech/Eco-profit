"use client";

import { useEffect } from "react";

// All the landing-page scroll choreography in one place. The scroll work is
// one-shot (IntersectionObserver fires once, then unobserves) - no persistent
// rAF loop or particle canvas, which is what made the original HTML feel janky.
// The one pointer effect (hero dashboard tilt) is desktop-only and rAF-throttled
// to a single transform write per frame. Pure CSS handles everything else.
function smoothPath(pts: number[][]) {
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    const cx = (x0 + x1) / 2;
    d += ` C ${cx} ${y0}, ${cx} ${y1}, ${x1} ${y1}`;
  }
  return d;
}

export function drawLine(
  svg: SVGSVGElement,
  vals: number[],
  opt: { c1?: string; c2?: string; pad?: number; animate?: boolean } = {},
) {
  const vb = svg.viewBox.baseVal;
  const W = vb.width;
  const H = vb.height;
  const pad = opt.pad ?? 8;
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const rng = max - min || 1;
  const pts = vals.map((v, i) => [
    pad + ((W - 2 * pad) * i) / (vals.length - 1),
    H - pad - (H - 2 * pad) * ((v - min) / rng),
  ]);
  const id = "g" + Math.random().toString(36).slice(2, 7);
  const line = smoothPath(pts);
  const area = line + ` L ${pts.at(-1)![0]} ${H - pad} L ${pts[0][0]} ${H - pad} Z`;
  svg.innerHTML = `
    <defs>
      <linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${opt.c1 || "#00E5FF"}" stop-opacity=".35"/>
        <stop offset="1" stop-color="${opt.c1 || "#00E5FF"}" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="${id}l" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="${opt.c1 || "#00E5FF"}"/>
        <stop offset="1" stop-color="${opt.c2 || "#7C3AED"}"/>
      </linearGradient>
    </defs>
    <path d="${area}" fill="url(#${id})"/>
    <path d="${line}" fill="none" stroke="url(#${id}l)" stroke-width="2.4" stroke-linecap="round" class="cl"/>`;
  if (opt.animate !== false) {
    const p = svg.querySelector(".cl") as SVGPathElement | null;
    if (p) {
      const len = p.getTotalLength();
      p.style.strokeDasharray = String(len);
      p.style.strokeDashoffset = String(len);
      p.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], {
        duration: 1500,
        easing: "cubic-bezier(.2,.7,.2,1)",
        fill: "forwards",
      });
    }
  }
}

export function ScrollFX() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion:reduce)").matches;
    const fmt = (n: number) => n.toLocaleString("en-IN");
    document.body.classList.add("fx-on");
    const cleanups: Array<() => void> = [];

    // reveal
    const ro = new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            ro.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 },
    );
    document.querySelectorAll(".reveal").forEach((el) => ro.observe(el));
    cleanups.push(() => ro.disconnect());

    // count-up
    function animCount(el: HTMLElement) {
      const to = parseFloat(el.dataset.to || "0");
      const dec = parseInt(el.dataset.dec || "0");
      const suf = el.dataset.suf || "";
      if (reduced) {
        el.textContent = (dec ? to.toFixed(dec) : fmt(to)) + suf;
        return;
      }
      const dur = 1400;
      const t0 = performance.now();
      function step(t: number) {
        let p = Math.min((t - t0) / dur, 1);
        p = 1 - Math.pow(1 - p, 3);
        const v = to * p;
        el.textContent = (dec ? v.toFixed(dec) : fmt(Math.round(v))) + suf;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    const co = new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          if (e.isIntersecting) {
            animCount(e.target as HTMLElement);
            co.unobserve(e.target);
          }
        });
      },
      { threshold: 0.6 },
    );
    document.querySelectorAll<HTMLElement>(".count").forEach((el) => co.observe(el));
    cleanups.push(() => co.disconnect());

    // cost bars
    const costStack = document.getElementById("costStack");
    if (costStack) {
      const csObs = new IntersectionObserver(
        (es) => {
          es.forEach((e) => {
            if (e.isIntersecting) {
              e.target
                .querySelectorAll<HTMLElement>(".bar-fill")
                .forEach((b, i) =>
                  setTimeout(() => (b.style.width = (b.dataset.w || "0") + "%"), i * 180),
                );
              csObs.unobserve(e.target);
            }
          });
        },
        { threshold: 0.4 },
      );
      csObs.observe(costStack);
      cleanups.push(() => csObs.disconnect());
    }

    // steps progress
    const steps = document.getElementById("steps");
    if (steps) {
      const stObs = new IntersectionObserver(
        (es) => {
          es.forEach((e) => {
            if (e.isIntersecting) {
              const prog = document.getElementById("stepProg");
              if (prog) prog.style.width = "100%";
              e.target
                .querySelectorAll(".step")
                .forEach((s, i) => setTimeout(() => s.classList.add("in"), i * 260));
              stObs.unobserve(e.target);
            }
          });
        },
        { threshold: 0.3 },
      );
      stObs.observe(steps);
      cleanups.push(() => stObs.disconnect());
    }

    // hero chart
    const hero = document.getElementById("heroChart") as SVGSVGElement | null;
    if (hero)
      drawLine(hero, [20, 28, 24, 36, 32, 44, 40, 52, 48, 60, 58, 72], {
        c1: "#14F195",
        c2: "#00E5FF",
        animate: !reduced,
      });

    // hero dashboard cursor tilt. The original HTML wrote `style.transform` on
    // every mousemove, which is what made it feel janky. Here we only track a
    // pointer-fine desktop with motion allowed, coalesce to one transform write
    // per frame via rAF, and let the CSS .3s ease-out smooth the follow.
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const heroSection = document.querySelector<HTMLElement>(".hero");
    const dashMain = document.querySelector<HTMLElement>(".dash-main");
    if (!reduced && finePointer && heroSection && dashMain) {
      let raf = 0;
      let cx = 0;
      let cy = 0;
      const onMove = (e: MouseEvent) => {
        cx = e.clientX;
        cy = e.clientY;
        if (raf) return; // a frame is already scheduled; just update coords
        raf = requestAnimationFrame(() => {
          raf = 0;
          const r = dashMain.getBoundingClientRect();
          const rx = ((cy - r.top - r.height / 2) / r.height) * -6 + 4;
          const ry = ((cx - r.left - r.width / 2) / r.width) * 8 - 9;
          dashMain.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
        });
      };
      const onLeave = () => {
        if (raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
        dashMain.style.transform = ""; // ease back to the CSS resting tilt
      };
      heroSection.addEventListener("mousemove", onMove, { passive: true });
      heroSection.addEventListener("mouseleave", onLeave);
      cleanups.push(() => {
        if (raf) cancelAnimationFrame(raf);
        heroSection.removeEventListener("mousemove", onMove);
        heroSection.removeEventListener("mouseleave", onLeave);
      });
    }

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return null;
}

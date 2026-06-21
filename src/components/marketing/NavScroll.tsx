"use client";

import { useEffect } from "react";

// Adds `.scrolled` to the nav once the page is scrolled a little, so the bar
// fades from transparent to opaque. Passive listener + rAF throttle, and it
// only reads window.scrollY and toggles a class, no getBoundingClientRect or
// style reads, so there's no layout thrash (keeps scrolling smooth).
export function NavScroll() {
  useEffect(() => {
    const nav = document.getElementById("nav");
    if (!nav) return;

    let ticking = false;
    const apply = () => {
      ticking = false;
      nav.classList.toggle("scrolled", window.scrollY > 8);
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(apply);
      }
    };

    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return null;
}

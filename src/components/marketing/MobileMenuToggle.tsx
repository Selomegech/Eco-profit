"use client";

import { useEffect } from "react";

// Wires the header hamburger button to toggle the mobile nav panel by
// flipping a class on #nav, same DOM-class-toggle pattern as NavScroll
// (no React state / re-render needed for this). Also closes the panel
// when a link inside it is clicked or the viewport grows past mobile width.
export function MobileMenuToggle() {
  useEffect(() => {
    const nav = document.getElementById("nav");
    const btn = document.getElementById("menu-toggle");
    const panel = document.getElementById("mobile-menu");
    if (!nav || !btn || !panel) return;

    const close = () => {
      nav.classList.remove("menu-open");
      btn.setAttribute("aria-expanded", "false");
    };
    const toggle = () => {
      const open = nav.classList.toggle("menu-open");
      btn.setAttribute("aria-expanded", String(open));
    };

    btn.addEventListener("click", toggle);
    panel.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));

    const onResize = () => {
      if (window.innerWidth > 980) close();
    };
    window.addEventListener("resize", onResize);

    return () => {
      btn.removeEventListener("click", toggle);
      panel.querySelectorAll("a").forEach((a) => a.removeEventListener("click", close));
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return null;
}

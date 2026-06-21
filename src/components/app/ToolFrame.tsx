"use client";

import { useEffect, useRef } from "react";

// Wraps the analytics tool iframe and keeps its theme in sync with the
// dashboard. The initial match happens inside the served HTML (it reads the
// shared `theme` localStorage key); this bridge only handles LIVE toggles so an
// open tool recolours without a reload.
export function ToolFrame({
  src,
  title,
  className,
}: {
  src: string;
  title: string;
  className?: string;
}) {
  const ref = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    function currentTheme(): "light" | "dark" {
      return document.documentElement.getAttribute("data-theme") === "light"
        ? "light"
        : "dark";
    }
    function post(theme: "light" | "dark") {
      ref.current?.contentWindow?.postMessage(
        { __ecomTheme: theme },
        window.location.origin,
      );
    }
    function onThemeChange(e: Event) {
      const detail = (e as CustomEvent).detail;
      post(detail === "light" || detail === "dark" ? detail : currentTheme());
    }
    window.addEventListener("ecom-theme-change", onThemeChange);
    return () => window.removeEventListener("ecom-theme-change", onThemeChange);
  }, []);

  return (
    <iframe
      ref={ref}
      src={src}
      title={title}
      className={className}
      // The tool route sets its own scoped CSP; sandbox keeps it isolated while
      // still allowing scripts, downloads and same-origin reads.
      sandbox="allow-scripts allow-same-origin allow-downloads allow-popups allow-forms allow-modals"
    />
  );
}

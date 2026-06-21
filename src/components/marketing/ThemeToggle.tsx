"use client";

import { useEffect, useState } from "react";

// Flips the [data-theme] attribute on <html> and remembers the choice. The
// pre-paint inline script in the root layout applies the saved value before
// first render, so this only needs to sync the button icon after mount.
export function ThemeToggle() {
  const [light, setLight] = useState(false);

  useEffect(() => {
    setLight(document.documentElement.getAttribute("data-theme") === "light");
  }, []);

  function toggle() {
    const next = !light;
    setLight(next);
    if (next) {
      document.documentElement.setAttribute("data-theme", "light");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    try {
      localStorage.setItem("theme", next ? "light" : "dark");
    } catch {
      /* storage may be unavailable */
    }
    // Broadcast so same-page listeners (e.g. the tool iframe bridge) can react
    // without a reload.
    try {
      window.dispatchEvent(
        new CustomEvent("ecom-theme-change", { detail: next ? "light" : "dark" }),
      );
    } catch {
      /* CustomEvent unsupported */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="theme-toggle"
      aria-label={light ? "Switch to dark theme" : "Switch to light theme"}
    >
      {light ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path
            d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="4" />
          <path
            d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
            strokeLinecap="round"
          />
        </svg>
      )}
    </button>
  );
}

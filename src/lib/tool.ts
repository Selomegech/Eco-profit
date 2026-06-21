import { readFile } from "fs/promises";
import path from "path";

// ── Analytics tool delivery ──────────────────────────────────────────────────
// The client ships the tool as two self-contained HTML builds that they update
// fairly often. They live OUTSIDE /public so they can never be fetched
// anonymously; both are streamed through gated API routes instead.
//
//   private/tool/full.html  → the paid build. Real file upload is enabled, so a
//                             seller analyses their own Flipkart/Meesho data.
//                             Served by /api/tool to ACTIVE subscribers only.
//   private/tool/demo.html  → the demo build. File upload is disabled; it loads
//                             a year of realistic SAMPLE data instead. Served by
//                             /api/tool/demo to any logged-in user.
//
// SWAPPING IN A NEW BUILD: just overwrite the matching file. When the client
// sends e.g. `marketplace_pnl_Upload_Final.html`, copy it to `full.html`; the
// demo build goes to `demo.html`. Nothing else needs to change.
export type ToolBuild = "full" | "demo";

const FILES: Record<ToolBuild, string> = {
  full: "full.html",
  demo: "demo.html",
};

// Scoped CSP for the tool: it loads libraries from cdnjs and Google Fonts, and
// generates PDFs/Excel as blobs. Intentionally separate from (and stricter
// where it can be than) the app-wide policy.
const TOOL_CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src https://fonts.gstatic.com data:",
  "img-src 'self' data: blob:",
  "connect-src 'self' https://cdnjs.cloudflare.com",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'self'",
].join("; ");

// The client builds contain em dashes (—). The rest of the product is em-dash
// free, so we normalise the glyph to a hyphen at serve time. This keeps file
// swaps a pure drop-in (no hand-editing) and never touches the tool's JS, whose
// "no value" sentinels are plain hyphens, not em dashes.
function sanitize(html: string): string {
  return html.replace(/—/g, "-");
}

// Theme bridge injected into every tool build. The tool already ships a full
// light + dark palette (it reads its own `mp_theme` localStorage key and flips
// `body[data-theme]`). Because the iframe is served from this same origin, it
// shares the app's localStorage, so we:
//   1. On load, copy the app's `theme` (set by the site-wide toggle) into the
//      tool's `mp_theme` key BEFORE the tool's own init runs, so the tool opens
//      matching the rest of the dashboard instead of its cream default.
//   2. Listen for a postMessage from the parent page so toggling the dashboard
//      theme recolours the open tool live, with no reload (which would lose any
//      uploaded data on the paid build).
// It is intentionally tiny and only touches theme state, so it survives client
// build swaps untouched.
const THEME_BRIDGE = `<script>(function(){
function apply(t){var v=t==='light'?'light':'dark';try{localStorage.setItem('mp_theme',v);}catch(e){}if(document.body){document.body.setAttribute('data-theme',v);}}
var initial;try{initial=localStorage.getItem('theme');}catch(e){}
apply(initial==='light'?'light':'dark');
window.addEventListener('message',function(e){if(e&&e.data&&e.data.__ecomTheme){apply(e.data.__ecomTheme);}});
})();</script>`;

function injectThemeBridge(html: string): string {
  // Place it first inside <head> so it runs before the tool's own theme init.
  return html.replace(/<head>/i, `<head>${THEME_BRIDGE}`);
}

// Parity + chrome overrides. The client build's dark theme doesn't just recolour
// the tool: it also swaps the serif typeface (Fraunces -> Space Grotesk),
// resizes the logo and changes panel/badge/header radii. The product owner wants
// light and dark to differ in COLOUR ONLY, and the in-tool theme button is now
// redundant (the dashboard header controls the theme). This stylesheet, injected
// AFTER the tool's own <style> so it wins the cascade, normalises all of that.
// It targets only stable, top-level selectors so build swaps stay drop-in.
const PARITY_STYLE = `<style>
/* One typeface set in both modes (dark shipped Space Grotesk for --serif). */
:root, body[data-theme="dark"]{
  --serif:'Fraunces',Georgia,serif !important;
  --body:'Inter','Helvetica Neue',system-ui,sans-serif !important;
  --mono:'JetBrains Mono',ui-monospace,monospace !important;
}
/* Apply the same element font assignments in BOTH modes (dark-only in source). */
h2, h3, .exgst-title, .recon-section-hd, .sumbox-h, .zhd, .recon-card .rv, .stat.feature{font-family:var(--serif) !important}
.stat .v{font-family:var(--mono) !important; font-weight:700 !important}
.ex-tile .ex-v, .cmp-val, .aging-bucket .av, .sumbox table tr.total td.amt, .pname{font-family:var(--mono) !important}
/* The dashboard header already shows the brand logo, so the tool's own
   in-sidebar logo is a duplicate - hide it in both modes. */
#logoSoft{display:none !important}
/* Same reason for the left rail's brand block (E mark + "ECOM PROFIT"). */
.crail .cb{display:none !important}
/* Identical shapes/structure in both modes (force the light values in dark). */
body[data-theme="dark"] .panel{border-radius:6px !important}
body[data-theme="dark"] .badge{border-radius:2px !important; letter-spacing:.12em !important; border:none !important}
body[data-theme="dark"] header.top{border-bottom:2px solid var(--ink) !important}
/* The dashboard header owns the theme toggle now - hide the tool's own one. */
.themebtn, #themeToggle{display:none !important}
</style>`;

function injectParityStyle(html: string): string {
  // Place it just before </head> so it comes after the tool's own <style>.
  return html.replace(/<\/head>/i, `${PARITY_STYLE}</head>`);
}

export async function serveToolBuild(build: ToolBuild): Promise<Response> {
  const file = path.join(process.cwd(), "private", "tool", FILES[build]);
  const html = injectParityStyle(injectThemeBridge(sanitize(await readFile(file, "utf8"))));
  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Security-Policy": TOOL_CSP,
      "Cache-Control": "private, no-store",
      "X-Frame-Options": "SAMEORIGIN",
    },
  });
}

import { readFile } from "fs/promises";
import path from "path";
import { auth } from "@/auth";
import { hasActiveSubscription } from "@/lib/subscription";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// The analytics tool is a self-contained HTML file served ONLY to authenticated
// users with an active subscription. It lives outside /public so it can never
// be fetched anonymously. Swapping in a new tool version = replace the file.
const TOOL_PATH = path.join(process.cwd(), "private", "tool", "index.html");

// Scoped CSP for the tool: it loads libraries from cdnjs and Google Fonts, and
// generates PDFs/Excel as blobs. This is intentionally separate from (and
// stricter where it can be than) the app-wide policy.
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

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }
  const active = await hasActiveSubscription(session.user.id);
  if (!active) {
    return new Response("Subscription required", { status: 402 });
  }

  const html = await readFile(TOOL_PATH, "utf8");
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

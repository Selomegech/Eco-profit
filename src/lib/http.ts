import { NextResponse } from "next/server";
import { env } from "@/lib/env";

// Reject cross-site state-changing requests by checking the Origin header
// against our own. Defense-in-depth on top of SameSite cookies.
//
// We compare the Origin's host against the host the request was actually
// served on (x-forwarded-host behind Netlify's proxy, else Host) as well as
// the configured APP_URL. This keeps the check correct across the custom
// domain, the *.netlify.app URL, and preview deploys, instead of failing
// whenever the browsing domain differs from APP_URL.
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // non-browser / same-origin fetches may omit it

  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    return false;
  }

  const allowed = new Set<string>();
  const forwardedHost = req.headers.get("x-forwarded-host");
  const host = req.headers.get("host");
  if (forwardedHost) allowed.add(forwardedHost);
  if (host) allowed.add(host);
  try {
    allowed.add(new URL(env.APP_URL).host);
  } catch {
    /* APP_URL misconfigured, fall back to request host only */
  }

  return allowed.has(originHost);
}

export function json(data: unknown, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

export function badRequest(message: string): NextResponse {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function unauthorized(): NextResponse {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function forbidden(): NextResponse {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export function tooMany(): NextResponse {
  return NextResponse.json({ error: "Too many requests" }, { status: 429 });
}

// Wraps a route handler so any uncaught exception returns a JSON 500 instead
// of an empty response body, which would crash the client's res.json() call.
export function withErrorHandler(
  handler: (req: Request, ctx?: unknown) => Promise<NextResponse>,
): (req: Request, ctx?: unknown) => Promise<NextResponse> {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (err) {
      console.error("[api] unhandled error:", err);
      return NextResponse.json({ error: "Service temporarily unavailable. Please try again." }, { status: 500 });
    }
  };
}

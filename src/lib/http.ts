import { NextResponse } from "next/server";
import { env } from "@/lib/env";

// Reject cross-site state-changing requests by checking the Origin header
// against our own. Defense-in-depth on top of SameSite cookies.
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // non-browser / same-origin fetches may omit it
  try {
    return new URL(origin).origin === new URL(env.APP_URL).origin;
  } catch {
    return false;
  }
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

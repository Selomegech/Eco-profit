import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

const PROTECTED_PREFIXES = ["/dashboard", "/app", "/admin", "/billing", "/account"];
const ADMIN_PREFIXES = ["/admin"];

function makeNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

function buildCsp(nonce: string): string {
  const isProd = process.env.NODE_ENV === "production";
  const directives = [
    `default-src 'self'`,
    // strict-dynamic + nonce: only our nonce'd scripts (and what they load,
    // e.g. Stripe.js / Razorpay checkout) can execute. https: is a fallback
    // for browsers that ignore strict-dynamic. 'unsafe-eval' is added in dev
    // only; React's dev build needs eval() for debugging; production never does.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https:${isProd ? "" : " 'unsafe-eval'"}`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `font-src 'self' https://fonts.gstatic.com data:`,
    `img-src 'self' data: blob: https:`,
    `connect-src 'self' https://api.stripe.com https://*.razorpay.com`,
    `frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://*.razorpay.com`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    isProd ? `upgrade-insecure-requests` : ``,
  ].filter(Boolean);
  return directives.join("; ");
}

export default auth((req) => {
  const nonce = makeNonce();
  const csp = buildCsp(nonce);
  const { pathname } = req.nextUrl;

  const isLoggedIn = !!req.auth?.user;
  const isAdmin = req.auth?.user?.role === "ADMIN";
  const needsAuth = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const needsAdmin = ADMIN_PREFIXES.some((p) => pathname.startsWith(p));

  if (needsAuth && !isLoggedIn) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }
  if (needsAdmin && !isAdmin) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-nonce", nonce);
  // Next reads this request header to nonce its own bootstrap scripts.
  requestHeaders.set("content-security-policy", csp);

  const res = NextResponse.next({ request: { headers: requestHeaders } });
  res.headers.set("content-security-policy", csp);
  return res;
});

export const config = {
  // Run on pages but not API routes (they set their own headers), static
  // assets, or image optimizer.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};

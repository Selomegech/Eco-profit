import type { NextConfig } from "next";

// Security headers applied to every response. The Content-Security-Policy
// is set per-request in middleware so it can carry a per-request nonce.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  serverExternalPackages: ["@node-rs/argon2", "pdfkit"],
  // Ensure the gated tool HTML (read from disk at runtime) is bundled with the
  // serverless function on Vercel.
  outputFileTracingIncludes: {
    "/api/tool": ["./private/tool/**"],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;

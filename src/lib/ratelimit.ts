import { prisma } from "@/lib/prisma";

// Fixed-window rate limiter backed by Postgres. Good enough for auth and
// payment endpoints on a single small deployment. For high scale, swap the
// store for Upstash Redis behind this same interface.
export async function rateLimit(opts: {
  key: string; // logical bucket, e.g. `login:${ip}`
  limit: number;
  windowSeconds: number;
}): Promise<{ ok: boolean; remaining: number }> {
  const { key, limit, windowSeconds } = opts;
  const now = Date.now();
  const windowStart = Math.floor(now / (windowSeconds * 1000)) * windowSeconds * 1000;
  const id = `${key}:${windowStart}`;
  const expiresAt = new Date(windowStart + windowSeconds * 1000);

  const row = await prisma.rateLimit.upsert({
    where: { id },
    create: { id, count: 1, expiresAt },
    update: { count: { increment: 1 } },
  });

  // Opportunistic cleanup of expired rows (cheap, bounded).
  if (Math.random() < 0.02) {
    await prisma.rateLimit.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  }

  return { ok: row.count <= limit, remaining: Math.max(0, limit - row.count) };
}

export function clientIp(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return headers.get("x-real-ip") ?? "unknown";
}

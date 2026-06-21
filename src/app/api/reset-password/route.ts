import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { consumeToken } from "@/lib/tokens";
import { rateLimit, clientIp } from "@/lib/ratelimit";
import { audit } from "@/lib/audit";
import { sameOrigin, json, badRequest, tooMany } from "@/lib/http";

const schema = z.object({
  token: z.string().min(1).max(500),
  // Same policy as registration.
  password: z
    .string()
    .min(10, "Password must be at least 10 characters")
    .max(200)
    .regex(/[a-z]/, "Include a lowercase letter")
    .regex(/[A-Z]/, "Include an uppercase letter")
    .regex(/[0-9]/, "Include a number"),
});

export async function POST(req: Request) {
  if (!sameOrigin(req)) return badRequest("Bad origin");

  const ip = clientIp(req.headers);
  const rl = await rateLimit({ key: `reset:${ip}`, limit: 10, windowSeconds: 600 });
  if (!rl.ok) return tooMany();

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  // Single-use: consuming the token deletes it.
  const userId = await consumeToken({ raw: parsed.data.token, purpose: "PASSWORD_RESET" });
  if (!userId) {
    return badRequest("This reset link is invalid or has expired. Request a new one.");
  }

  const passwordHash = await hashPassword(parsed.data.password);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      // Receiving the email proves ownership, so confirm the address too.
      data: { passwordHash, emailVerified: new Date() },
    }),
    // Invalidate any other outstanding reset tokens for this user.
    prisma.verificationToken.deleteMany({
      where: { userId, purpose: "PASSWORD_RESET" },
    }),
  ]);
  await audit({ action: "AUTH_PASSWORD_RESET", userId, ip });

  return json({ ok: true, message: "Your password has been reset. You can log in now." });
}

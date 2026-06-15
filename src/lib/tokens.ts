import crypto from "crypto";
import { prisma } from "@/lib/prisma";

function sha256(s: string): string {
  return crypto.createHash("sha256").update(s).digest("hex");
}

// Issue a single-use token; we store only its hash. Returns the raw token to
// embed in an emailed link.
export async function issueToken(opts: {
  userId: string;
  purpose: "EMAIL_VERIFY" | "PASSWORD_RESET";
  ttlMs: number;
}): Promise<string> {
  const raw = crypto.randomBytes(32).toString("base64url");
  await prisma.verificationToken.create({
    data: {
      userId: opts.userId,
      tokenHash: sha256(raw),
      purpose: opts.purpose,
      expiresAt: new Date(Date.now() + opts.ttlMs),
    },
  });
  return raw;
}

// Consume a token if valid; returns userId or null. Single-use (deleted on use).
export async function consumeToken(opts: {
  raw: string;
  purpose: "EMAIL_VERIFY" | "PASSWORD_RESET";
}): Promise<string | null> {
  const tokenHash = sha256(opts.raw);
  const row = await prisma.verificationToken.findUnique({ where: { tokenHash } });
  if (!row || row.purpose !== opts.purpose || row.expiresAt < new Date()) return null;
  await prisma.verificationToken.delete({ where: { id: row.id } });
  return row.userId;
}

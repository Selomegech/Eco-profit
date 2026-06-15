import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sameOrigin, json, badRequest, unauthorized } from "@/lib/http";

const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

const schema = z.object({
  billingName: z.string().trim().max(150).optional().or(z.literal("")),
  gstin: z
    .string()
    .trim()
    .toUpperCase()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || gstinRegex.test(v), "Invalid GSTIN format"),
  stateCode: z.string().trim().max(2).optional().or(z.literal("")),
  billingAddress: z.string().trim().max(500).optional().or(z.literal("")),
});

export async function POST(req: Request) {
  if (!sameOrigin(req)) return badRequest("Bad origin");
  const session = await auth();
  if (!session?.user) return unauthorized();

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "Invalid input");

  // Derive state code from GSTIN prefix when present (authoritative).
  const gstin = parsed.data.gstin || null;
  const stateCode = gstin ? gstin.slice(0, 2) : parsed.data.stateCode || null;

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      billingName: parsed.data.billingName || null,
      gstin,
      stateCode,
      billingAddress: parsed.data.billingAddress || null,
    },
  });

  return json({ ok: true });
}

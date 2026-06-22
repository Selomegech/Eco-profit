import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { clientIp } from "@/lib/ratelimit";
import { rupeesToPaise } from "@/lib/money";
import { json, badRequest } from "@/lib/http";
import { requireAdminApi } from "@/lib/admin-auth";

// Price comes from the form in whole rupees (GST-inclusive, as charged); we
// store paise. Every field is optional so the form can patch just what changed.
const schema = z.object({
  planId: z.string().min(1),
  name: z.string().min(1).max(80).optional(),
  amountRupees: z.number().int().min(0).max(10_000_000).optional(),
  durationDays: z.number().int().min(1).max(3650).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(999).optional(),
});

export async function POST(req: Request) {
  const gate = await requireAdminApi(req);
  if (gate instanceof Response) return gate;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return badRequest("Invalid input");

  const { planId, amountRupees, name, durationDays, isActive, sortOrder } = parsed.data;
  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!plan) return badRequest("Plan not found");

  const data: Record<string, unknown> = {};
  if (name !== undefined) data.name = name;
  if (amountRupees !== undefined) data.amountPaise = rupeesToPaise(amountRupees);
  if (durationDays !== undefined) data.durationDays = durationDays;
  if (isActive !== undefined) data.isActive = isActive;
  if (sortOrder !== undefined) data.sortOrder = sortOrder;
  if (Object.keys(data).length === 0) return badRequest("Nothing to update");

  await prisma.plan.update({ where: { id: planId }, data });
  await audit({
    action: "ADMIN_PLAN_UPDATE",
    userId: gate.userId,
    ip: clientIp(req.headers),
    meta: { planId, changes: data },
  });

  return json({ ok: true });
}

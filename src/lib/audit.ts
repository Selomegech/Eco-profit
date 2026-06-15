import { prisma } from "@/lib/prisma";

export async function audit(opts: {
  action: string;
  userId?: string | null;
  ip?: string | null;
  meta?: Record<string, unknown>;
}): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action: opts.action,
        userId: opts.userId ?? null,
        ip: opts.ip ?? null,
        meta: opts.meta as object | undefined,
      },
    });
  } catch {
    // Never let audit logging break the request path.
  }
}

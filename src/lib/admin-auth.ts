import { auth } from "@/auth";
import { sameOrigin, badRequest, unauthorized, forbidden } from "@/lib/http";

export interface AdminContext {
  userId: string;
  email: string;
}

// Shared guard for admin-only API routes. Returns either the admin context or a
// ready-to-return error Response, so each handler stays a one-liner:
//
//   const gate = await requireAdminApi(req);
//   if (gate instanceof Response) return gate;
//   // ...gate.userId is the acting admin
//
// Mirrors the inline checks already used in /api/admin/subscription:
// same-origin (CSRF defence on top of SameSite cookies) + authenticated +
// ADMIN role. Fine-grained, server-side, every time - never trust the client.
export async function requireAdminApi(req: Request): Promise<AdminContext | Response> {
  if (!sameOrigin(req)) return badRequest("Bad origin");
  const session = await auth();
  if (!session?.user) return unauthorized();
  if (session.user.role !== "ADMIN") return forbidden();
  return { userId: session.user.id, email: session.user.email ?? "" };
}

import { auth } from "@/auth";
import { hasActiveSubscription } from "@/lib/subscription";
import { serveToolBuild } from "@/lib/tool";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Paid build: the real analytics tool with file upload enabled. Served only to
// authenticated users with an ACTIVE subscription.
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }
  const active = await hasActiveSubscription(session.user.id);
  if (!active) {
    return new Response("Subscription required", { status: 402 });
  }
  return serveToolBuild("full");
}

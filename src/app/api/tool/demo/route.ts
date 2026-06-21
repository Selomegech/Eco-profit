import { auth } from "@/auth";
import { serveToolBuild } from "@/lib/tool";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Demo build: the full dashboard locked to sample data (file upload disabled).
// Available to ANY logged-in user, no subscription required, so prospects can
// explore the product before paying to analyse their own data.
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }
  return serveToolBuild("demo");
}

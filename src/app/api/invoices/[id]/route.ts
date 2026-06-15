import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { buildInvoicePdf } from "@/lib/invoice/send";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const { id } = await ctx.params;
  const invoice = await prisma.invoice.findUnique({ where: { id }, select: { userId: true, number: true } });
  if (!invoice) return new Response("Not found", { status: 404 });

  // Only the owner or an admin may download.
  if (invoice.userId !== session.user.id && session.user.role !== "ADMIN") {
    return new Response("Forbidden", { status: 403 });
  }

  const { buffer, number } = await buildInvoicePdf(id);
  return new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${number.replace(/\//g, "-")}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}

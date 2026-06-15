import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AccountForm } from "./AccountForm";

export const metadata = { title: "Account — Ecom Profit" };

export default async function AccountPage() {
  const user = await requireUser();
  const dbUser = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    select: { name: true, email: true, billingName: true, gstin: true, stateCode: true, billingAddress: true },
  });

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-black">Account</h1>
        <p className="mt-1 text-muted">Your profile and GST billing details for invoices.</p>
      </div>

      <div className="rounded-2xl border border-line bg-card p-6 shadow-sm">
        <h2 className="font-serif text-xl font-semibold">Profile</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted">Name</div>
            <div className="mt-1 font-medium">{dbUser.name ?? "—"}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-muted">Email</div>
            <div className="mt-1 font-medium">{dbUser.email}</div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-card p-6 shadow-sm">
        <h2 className="font-serif text-xl font-semibold">GST &amp; billing</h2>
        <p className="mt-1 text-sm text-muted">
          Provide your GSTIN to receive B2B tax invoices with the correct CGST/SGST or IGST split.
        </p>
        <div className="mt-5">
          <AccountForm
            initial={{
              billingName: dbUser.billingName ?? "",
              gstin: dbUser.gstin ?? "",
              stateCode: dbUser.stateCode ?? "",
              billingAddress: dbUser.billingAddress ?? "",
            }}
          />
        </div>
      </div>
    </div>
  );
}

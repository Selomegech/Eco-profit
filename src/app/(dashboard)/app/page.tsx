import Link from "next/link";
import { requireUser } from "@/lib/session";
import { hasActiveSubscription } from "@/lib/subscription";

export const metadata = { title: "App — Ecom Profit" };

export default async function AppPage() {
  const user = await requireUser();
  const active = await hasActiveSubscription(user.id);

  if (!active) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-line bg-card p-8 text-center shadow-sm">
        <h1 className="font-serif text-2xl font-semibold">Subscription required</h1>
        <p className="mt-2 text-muted">
          Your subscription isn&apos;t active. Choose a plan to unlock the analytics tool.
        </p>
        <Link
          href="/billing"
          className="mt-6 inline-block rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white hover:bg-accent-dark"
        >
          Choose a plan
        </Link>
      </div>
    );
  }

  return (
    <div className="-mx-5 -my-8">
      <iframe
        src="/api/tool"
        title="Ecom Profit tool"
        className="h-[calc(100vh-64px)] w-full border-0"
        // The tool route sets its own scoped CSP; sandbox keeps it isolated
        // while still allowing scripts, downloads and same-origin reads.
        sandbox="allow-scripts allow-same-origin allow-downloads allow-popups allow-forms allow-modals"
      />
    </div>
  );
}

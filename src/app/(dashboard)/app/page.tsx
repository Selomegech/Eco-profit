import Link from "next/link";
import { requireUser } from "@/lib/session";
import { hasActiveSubscription } from "@/lib/subscription";
import { ToolFrame } from "@/components/app/ToolFrame";

export const metadata = { title: "App - Ecom Profit" };

export default async function AppPage() {
  const user = await requireUser();
  const active = await hasActiveSubscription(user.id);

  // Subscribers get the real tool (upload enabled). Everyone else gets the demo
  // build (sample data only) with a banner pointing to the paid upgrade.
  if (active) {
    return (
      // Full-bleed: break out of the centered max-w-6xl main so the tool uses
      // the entire viewport width instead of ~85%.
      <div className="mx-[calc(50%-50vw)] -my-8 w-screen">
        <ToolFrame
          src="/api/tool"
          title="Ecom Profit tool"
          className="h-[calc(100vh-64px)] w-full border-0"
        />
      </div>
    );
  }

  return (
    <div className="mx-[calc(50%-50vw)] -my-8 flex h-[calc(100vh-64px)] w-screen flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-accent/10 px-5 py-3">
        <p className="text-sm text-ink">
          <span className="font-semibold">Demo mode.</span> You&apos;re exploring with sample data.
          Upload your own Flipkart &amp; Meesho files to see your store&apos;s real profit.
        </p>
        <Link
          href="/billing"
          className="shrink-0 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-on-accent hover:bg-accent-dark"
        >
          Unlock my data
        </Link>
      </div>
      <ToolFrame
        src="/api/tool/demo"
        title="Ecom Profit demo"
        className="w-full flex-1 border-0"
      />
    </div>
  );
}

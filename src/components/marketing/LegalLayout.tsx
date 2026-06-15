import { Nav } from "@/components/marketing/Nav";
import { Footer } from "@/components/marketing/Footer";

export function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-3xl px-5 py-16">
        <h1 className="font-serif text-4xl font-black">{title}</h1>
        <p className="mt-2 text-sm text-muted">Last updated: {updated}</p>
        <div className="prose-legal mt-8 space-y-5 text-[15px] leading-relaxed text-ink/85">
          {children}
        </div>
        <p className="mt-12 rounded-lg border border-line bg-card p-4 text-xs text-muted">
          This document is a template provided for convenience and is not legal advice. Please have
          it reviewed by a qualified professional and replace the placeholder company details before
          going live.
        </p>
      </main>
      <Footer />
    </>
  );
}

export function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="font-serif text-xl font-semibold text-ink">{children}</h2>;
}

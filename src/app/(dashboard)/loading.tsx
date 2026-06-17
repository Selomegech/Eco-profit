export default function DashboardLoading() {
  return (
    <div
      className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-muted"
      role="status"
      aria-live="polite"
    >
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-accent" />
      <p className="text-sm">Loading…</p>
      <span className="sr-only">Loading</span>
    </div>
  );
}

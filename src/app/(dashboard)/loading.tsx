/**
 * Shown while a dashboard page's server data is in flight. Same skeleton for
 * every route: a title line, then three hairline cards. Kept deliberately
 * plain so it reads as "loading", not as a wrong page.
 */
export default function DashboardLoading() {
  return (
    <div aria-busy="true" aria-live="polite" className="space-y-6">
      <span className="sr-only">Loading</span>
      <div className="space-y-2">
        <div className="h-7 w-48 animate-pulse rounded-sm bg-muted" />
        <div className="h-4 w-72 animate-pulse rounded-sm bg-muted" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-28 rounded-md border border-border bg-card p-6">
            <div className="h-4 w-24 animate-pulse rounded-sm bg-muted" />
            <div className="mt-4 h-7 w-32 animate-pulse rounded-sm bg-muted" />
          </div>
        ))}
      </div>
      <div className="h-80 rounded-md border border-border bg-card" />
    </div>
  );
}

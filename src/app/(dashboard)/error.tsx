"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * Route-level error boundary for every dashboard page. Sits inside the
 * (dashboard) layout, so the sidebar and header stay put and the user keeps
 * a way back. Next passes a sanitised error in production; the digest is
 * the only thing that ties a report to a server log line.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section
      role="alert"
      className="mx-auto mt-16 max-w-md rounded-md border border-border bg-card p-6"
    >
      <h1 className="text-lg font-semibold tracking-tight">This page could not load</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Something went wrong while fetching it. Your data is unchanged. Try
        again; if it keeps failing, go back to the dashboard.
      </p>
      {error.digest ? (
        <p className="mt-3 font-mono text-xs text-muted-foreground">
          Reference {error.digest}
        </p>
      ) : null}
      <div className="mt-6 flex gap-2">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" asChild>
          <Link href="/">Back to dashboard</Link>
        </Button>
      </div>
    </section>
  );
}

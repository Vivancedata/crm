import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardNotFound() {
  return (
    <section className="mx-auto mt-16 max-w-md rounded-md border border-border bg-card p-6">
      <h1 className="text-lg font-semibold tracking-tight">There is nothing here</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        The page you followed a link to does not exist, or the record it
        pointed at has been deleted.
      </p>
      <div className="mt-6 flex gap-2">
        <Button asChild>
          <Link href="/">Back to dashboard</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/deals">Open deals</Link>
        </Button>
      </div>
    </section>
  );
}

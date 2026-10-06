import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isLocalDevAuth } from "@/lib/clerk-config";

const ENV_NAMES = ["NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "CLERK_SECRET_KEY"];

/**
 * The sign-in and sign-up pages when Clerk has no publishable key. Outside
 * production the dashboard still works as the local dev user, so offer it;
 * in production it would refuse, so do not link into it.
 */
export function AuthUnavailable({ title, action }: { title: string; action: string }) {
  const devMode = isLocalDevAuth();

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            Clerk keys are not configured in this environment, so {action} is disabled.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Set{" "}
            {ENV_NAMES.map((name, i) => (
              <span key={name}>
                <code className="rounded-sm bg-muted px-1 py-0.5 font-mono text-xs text-foreground">
                  {name}
                </code>
                {i < ENV_NAMES.length - 1 ? " and " : ""}
              </span>
            ))}{" "}
            to enable authentication.
          </p>
          {devMode ? (
            <p>
              Until then this instance runs as a single local dev user.{" "}
              <Link className="font-medium text-brand underline-offset-4 hover:underline" href="/">
                Open the CRM
              </Link>
            </p>
          ) : null}
        </CardContent>
      </Card>
    </main>
  );
}

import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isClerkClientConfigured } from "@/lib/clerk-config";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Vivance CRM to access your pipeline, contacts, and tasks.",
};

export default function SignInPage() {
  if (!isClerkClientConfigured()) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted/20 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication is unavailable</CardTitle>
            <CardDescription>
              Clerk keys are not configured in this environment, so sign-in is disabled.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` to enable CRM authentication.</p>
            <Link className="font-medium text-primary underline-offset-4 hover:underline" href="/">
              Return to the dashboard shell
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <SignIn />
    </main>
  );
}

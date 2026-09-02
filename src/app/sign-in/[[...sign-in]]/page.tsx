import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";
import { AuthUnavailable } from "@/components/auth/auth-unavailable";
import { isClerkClientConfigured } from "@/lib/clerk-config";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Vivancedata CRM to access your pipeline, contacts, and tasks.",
};

export default function SignInPage() {
  if (!isClerkClientConfigured()) {
    return <AuthUnavailable title="Sign-in is unavailable" action="sign-in" />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <SignIn />
    </main>
  );
}

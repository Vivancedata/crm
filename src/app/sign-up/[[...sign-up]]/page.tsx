import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";
import { AuthUnavailable } from "@/components/auth/auth-unavailable";
import { isClerkClientConfigured } from "@/lib/clerk-config";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create a Vivancedata CRM account to manage deals, contacts, and tasks.",
};

export default function SignUpPage() {
  if (!isClerkClientConfigured()) {
    return <AuthUnavailable title="Account creation is unavailable" action="sign-up" />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <SignUp />
    </main>
  );
}

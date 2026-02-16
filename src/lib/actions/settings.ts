"use server";

import { requireUser } from "@/lib/auth";

export async function getApiKeyStatus() {
  await requireUser();

  return {
    resend: !!process.env.RESEND_API_KEY,
    anthropic: !!process.env.ANTHROPIC_API_KEY,
  };
}

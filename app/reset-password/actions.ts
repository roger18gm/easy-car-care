"use server";

import { redirect } from "next/navigation";
import type { AuthFormState } from "@/components/auth-form";
import { createServerClient } from "@/lib/supabase/server";

const RESET_NOTICE =
  "If an account exists for that email, a reset link is on its way.";

export async function requestPasswordReset(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!email.includes("@")) {
    return { fieldErrors: { email: "Enter a valid email address." } };
  }

  const supabase = await createServerClient();
  await supabase.auth.resetPasswordForEmail(email);

  redirect(`/reset-password?notice=${encodeURIComponent(RESET_NOTICE)}`);
}

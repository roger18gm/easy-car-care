"use server";

import { redirect } from "next/navigation";
import type { AuthFormState } from "@/components/auth-form";
import { createServerClient } from "@/lib/supabase/server";

export async function signUp(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  const fieldErrors: Record<string, string> = {};
  if (!name) {
    fieldErrors.name = "Name is required.";
  }
  if (!email.includes("@")) {
    fieldErrors.email = "Enter a valid email address.";
  }
  if (password.length < 8) {
    fieldErrors.password = "Password must be at least 8 characters.";
  }
  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const supabase = await createServerClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    const message = error.message.toLowerCase();
    if (
      message.includes("already registered") ||
      message.includes("already been registered")
    ) {
      return { fieldErrors: { email: "That email is already in use." } };
    }
    return { formError: error.message };
  }

  if (data.user?.identities?.length === 0) {
    return { fieldErrors: { email: "That email is already in use." } };
  }

  if (!data.session) {
    return { formMessage: "Check your email to confirm your account." };
  }

  const { error: profileError } = await supabase.from("profiles").insert({
    id: data.user!.id,
    name,
    email,
  });

  if (profileError) {
    return { formError: "Could not create your profile. Please try again." };
  }

  redirect("/dashboard");
}

"use server";

import { redirect } from "next/navigation";
import type { AuthFormState } from "@/components/auth-form";
import { createServerClient } from "@/lib/supabase/server";

export async function signIn(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  const fieldErrors: Record<string, string> = {};
  if (!email.includes("@")) {
    fieldErrors.email = "Enter a valid email address.";
  }
  if (!password) {
    fieldErrors.password = "Password is required.";
  }
  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const supabase = await createServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { formError: "Email or password is incorrect." };
  }

  const user = data.user;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile) {
      const profileEmail = (user.email ?? email).toLowerCase();
      const name =
        typeof user.user_metadata?.name === "string" &&
        user.user_metadata.name.trim()
          ? user.user_metadata.name.trim()
          : profileEmail.split("@")[0];

      const { error: profileError } = await supabase.from("profiles").insert({
        id: user.id,
        name,
        email: profileEmail,
      });

      if (profileError) {
        return { formError: "Could not load your profile. Please try again." };
      }
    }
  }

  redirect("/dashboard");
}

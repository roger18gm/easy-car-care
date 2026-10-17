import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { signIn } from "./actions";

export default function SignInPage() {
  return (
    <AuthForm
      title="Sign in"
      submitLabel="Sign in"
      action={signIn}
      fields={[
        { name: "email", label: "Email", type: "email", autoComplete: "email" },
        {
          name: "password",
          label: "Password",
          type: "password",
          autoComplete: "current-password",
        },
      ]}
      footer={
        <p className="flex flex-col gap-2">
          <span>
            <Link
              href="/reset-password"
              className="font-medium text-foreground underline"
            >
              Forgot your password?
            </Link>
          </span>
          <span>
            Need an account?{" "}
            <Link href="/sign-up" className="font-medium text-foreground underline">
              Create account
            </Link>
          </span>
        </p>
      }
    />
  );
}

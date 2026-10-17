import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { signUp } from "./actions";

export default function SignUpPage() {
  return (
    <AuthForm
      title="Create account"
      submitLabel="Create account"
      action={signUp}
      fields={[
        { name: "name", label: "Name", type: "text", autoComplete: "name" },
        { name: "email", label: "Email", type: "email", autoComplete: "email" },
        {
          name: "password",
          label: "Password",
          type: "password",
          autoComplete: "new-password",
        },
      ]}
      footer={
        <p>
          Already have an account?{" "}
          <Link href="/sign-in" className="font-medium text-foreground underline">
            Sign in
          </Link>
        </p>
      }
    />
  );
}

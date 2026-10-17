import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { requestPasswordReset } from "./actions";

type ResetPasswordPageProps = {
  searchParams: Promise<{ notice?: string }>;
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const { notice } = await searchParams;

  return (
    <>
      {notice && (
        <div className="mx-auto w-full max-w-md px-4 pt-12">
          <p className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100">
            {notice}
          </p>
        </div>
      )}
      <AuthForm
        title="Reset password"
        submitLabel="Send reset link"
        action={requestPasswordReset}
        fields={[
          { name: "email", label: "Email", type: "email", autoComplete: "email" },
        ]}
        footer={
          <p>
            <Link href="/sign-in" className="font-medium text-foreground underline">
              Back to sign in
            </Link>
          </p>
        }
      />
    </>
  );
}

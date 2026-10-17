import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="mx-auto flex min-h-full max-w-2xl flex-col justify-center px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">EasyCarCare</h1>
      <p className="mt-4 text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
        EasyCarCare tells you what your car needs next, in plain language.
      </p>
      <nav className="mt-8 flex flex-wrap gap-4 text-sm font-medium">
        <Link
          href="/sign-up"
          className="rounded-md bg-foreground px-4 py-2 text-background"
        >
          Create account
        </Link>
        <Link
          href="/sign-in"
          className="rounded-md border border-zinc-300 px-4 py-2 dark:border-zinc-700"
        >
          Sign in
        </Link>
        {user && (
          <Link
            href="/dashboard"
            className="rounded-md border border-zinc-300 px-4 py-2 dark:border-zinc-700"
          >
            Dashboard
          </Link>
        )}
      </nav>
    </div>
  );
}

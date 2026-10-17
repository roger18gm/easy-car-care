"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

export type AuthFormState = {
  fieldErrors?: Record<string, string>;
  formError?: string;
  formMessage?: string;
};

export type AuthField = {
  name: string;
  label: string;
  type: "text" | "email" | "password";
  autoComplete?: string;
};

type AuthFormProps = {
  title: string;
  fields: AuthField[];
  submitLabel: string;
  action: (
    prevState: AuthFormState,
    formData: FormData,
  ) => Promise<AuthFormState>;
  footer?: React.ReactNode;
};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity disabled:opacity-60"
    >
      {pending ? "Please wait…" : label}
    </button>
  );
}

export function AuthForm({
  title,
  fields,
  submitLabel,
  action,
  footer,
}: AuthFormProps) {
  const [state, formAction] = useActionState(action, {});

  return (
    <div className="mx-auto w-full max-w-md px-4 py-12">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">{title}</h1>
      <form action={formAction} className="flex flex-col gap-4" noValidate>
        {state.formError && (
          <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
            {state.formError}
          </p>
        )}
        {state.formMessage && (
          <p className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100">
            {state.formMessage}
          </p>
        )}
        {fields.map((field) => {
          const error = state.fieldErrors?.[field.name];
          return (
            <div key={field.name} className="flex flex-col gap-1">
              <label htmlFor={field.name} className="text-sm font-medium">
                {field.label}
              </label>
              <input
                id={field.name}
                name={field.name}
                type={field.type}
                autoComplete={field.autoComplete}
                required
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `${field.name}-error` : undefined}
                className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              />
              {error && (
                <p
                  id={`${field.name}-error`}
                  className="text-sm text-red-600 dark:text-red-400"
                >
                  {error}
                </p>
              )}
            </div>
          );
        })}
        <SubmitButton label={submitLabel} />
      </form>
      {footer && <div className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">{footer}</div>}
    </div>
  );
}

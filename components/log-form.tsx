"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

export type LogFormState = {
  fieldErrors?: Record<string, string>;
  formError?: string;
  values?: Record<string, string>;
};

const inputClassName =
  "rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:border-zinc-700 dark:bg-zinc-900";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60"
    >
      {pending ? "Please wait…" : label}
    </button>
  );
}

type LogFormProps = {
  title: string;
  submitLabel: string;
  action: (prevState: LogFormState, formData: FormData) => Promise<LogFormState>;
  initialValues?: Record<string, string>;
};

const fields = [
  { name: "completedDate", label: "Completed date", type: "date" },
  { name: "completedMileage", label: "Mileage", type: "number" },
  { name: "cost", label: "Cost in dollars (optional)", type: "number" },
  { name: "notes", label: "Notes (optional)", type: "text" },
] as const;

export function LogForm({ title, submitLabel, action, initialValues }: LogFormProps) {
  const [state, formAction] = useActionState(action, { values: initialValues });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">{title}</h1>
      <form action={formAction} className="flex max-w-md flex-col gap-4" noValidate>
        {state.formError && (
          <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
            {state.formError}
          </p>
        )}
        {fields.map((field) => {
          const error = state.fieldErrors?.[field.name];
          const defaultValue = state.values?.[field.name] ?? initialValues?.[field.name] ?? "";
          return (
            <div key={field.name} className="flex flex-col gap-1">
              <label htmlFor={field.name} className="text-sm font-medium">
                {field.label}
              </label>
              <input
                id={field.name}
                name={field.name}
                type={field.type}
                step={field.name === "cost" ? "0.01" : undefined}
                required={field.name === "completedDate" || field.name === "completedMileage"}
                defaultValue={defaultValue}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `${field.name}-error` : undefined}
                className={inputClassName}
              />
              {error && (
                <p id={`${field.name}-error`} className="text-sm text-red-600">
                  {error}
                </p>
              )}
            </div>
          );
        })}
        <SubmitButton label={submitLabel} />
      </form>
    </div>
  );
}

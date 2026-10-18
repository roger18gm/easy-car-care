"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

export type VehicleFormState = {
  fieldErrors?: Record<string, string>;
  formError?: string;
  values?: Record<string, string>;
};

export type VehicleField = {
  name: string;
  label: string;
  type: "text" | "number" | "date";
  required?: boolean;
  autoComplete?: string;
};

type VehicleFormProps = {
  title: string;
  fields: VehicleField[];
  submitLabel: string;
  initialValues?: Record<string, string>;
  action: (
    prevState: VehicleFormState,
    formData: FormData,
  ) => Promise<VehicleFormState>;
};

const inputClassName =
  "rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:border-zinc-700 dark:bg-zinc-900";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60"
    >
      {pending ? "Please wait…" : label}
    </button>
  );
}

export function VehicleForm({
  title,
  fields,
  submitLabel,
  initialValues,
  action,
}: VehicleFormProps) {
  const [state, formAction] = useActionState(action, {
    values: initialValues,
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">{title}</h1>
      <form
        key={JSON.stringify(state.values ?? initialValues ?? {})}
        action={formAction}
        className="flex max-w-md flex-col gap-4"
        noValidate
      >
        {state.formError && (
          <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
            {state.formError}
          </p>
        )}
        {fields.map((field) => {
          const error = state.fieldErrors?.[field.name];
          const defaultValue =
            state.values?.[field.name] ?? initialValues?.[field.name] ?? "";
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
                required={field.required}
                defaultValue={defaultValue}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `${field.name}-error` : undefined}
                className={inputClassName}
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
    </div>
  );
}

export const vehicleFormFields: VehicleField[] = [
  { name: "year", label: "Year", type: "number", required: true },
  { name: "make", label: "Make", type: "text", required: true, autoComplete: "off" },
  { name: "model", label: "Model", type: "text", required: true, autoComplete: "off" },
  { name: "currentMileage", label: "Current mileage", type: "number", required: true },
  { name: "vin", label: "VIN (optional)", type: "text", autoComplete: "off" },
  { name: "purchaseDate", label: "Purchase date (optional)", type: "date" },
];

"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { MileageFormState } from "@/app/(protected)/vehicles/[vehicleId]/mileage-actions";

const inputClassName =
  "rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:border-zinc-700 dark:bg-zinc-900";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60"
    >
      {pending ? "Please wait…" : "Save mileage"}
    </button>
  );
}

type MileageFormProps = {
  vehicleId: string;
  currentMileage: number;
  action: (
    prevState: MileageFormState,
    formData: FormData,
  ) => Promise<MileageFormState>;
};

export function MileageForm({ vehicleId, currentMileage, action }: MileageFormProps) {
  const [state, formAction] = useActionState(action, {});

  return (
    <section id="update-mileage" className="mt-8 max-w-md">
      <h2 className="text-lg font-semibold tracking-tight">Update mileage</h2>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Current mileage: {currentMileage.toLocaleString()} miles
      </p>
      <form action={formAction} className="mt-4 flex flex-col gap-4" noValidate>
        {state.formError && (
          <p
            className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
            role="alert"
          >
            {state.formError}
          </p>
        )}
        <div className="flex flex-col gap-1">
          <label htmlFor={`mileage-${vehicleId}`} className="text-sm font-medium">
            New mileage
          </label>
          <input
            id={`mileage-${vehicleId}`}
            name="mileage"
            type="number"
            min={0}
            required
            defaultValue={String(currentMileage)}
            aria-invalid={state.fieldError ? true : undefined}
            aria-describedby={state.fieldError ? `mileage-${vehicleId}-error` : undefined}
            className={inputClassName}
          />
          {state.fieldError && (
            <p id={`mileage-${vehicleId}-error`} className="text-sm text-red-600 dark:text-red-400">
              {state.fieldError}
            </p>
          )}
        </div>
        <SubmitButton />
      </form>
    </section>
  );
}

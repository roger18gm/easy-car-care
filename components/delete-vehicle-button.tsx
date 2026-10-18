"use client";

import { useFormStatus } from "react-dom";
import { deleteVehicleFromForm } from "@/app/(protected)/vehicles/actions";

type DeleteVehicleFormProps = {
  vehicleId: string;
  vehicleLabel: string;
};

function DeleteSubmit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="text-sm text-red-600 underline outline-none hover:text-red-700 focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:text-red-400 dark:hover:text-red-300"
    >
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}

export function DeleteVehicleForm({
  vehicleId,
  vehicleLabel,
}: DeleteVehicleFormProps) {
  return (
    <form
      action={deleteVehicleFromForm}
      className="inline"
      onSubmit={(event) => {
        const confirmed = window.confirm(
          `Delete ${vehicleLabel}? Its maintenance tasks and logs will be removed.`,
        );
        if (!confirmed) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="vehicleId" value={vehicleId} />
      <DeleteSubmit />
    </form>
  );
}

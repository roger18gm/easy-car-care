"use client";

import { useFormStatus } from "react-dom";
import { deleteLog } from "@/app/(protected)/logs/[logId]/edit/actions";

function DeleteSubmit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="text-sm text-red-600 underline outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2"
    >
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}

export function DeleteLogForm({ logId, taskName }: { logId: string; taskName: string }) {
  return (
    <form
      action={deleteLog}
      onSubmit={(event) => {
        if (!window.confirm(`Delete this ${taskName} record?`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="logId" value={logId} />
      <DeleteSubmit />
    </form>
  );
}

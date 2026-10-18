"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import type { LogFormState } from "@/components/log-form";
import { parseLogForm } from "@/lib/log-form";
import { recalculateTask } from "@/lib/recalculate-task";
import { createServerClient } from "@/lib/supabase/server";

function valuesFromFormData(formData: FormData): Record<string, string> {
  return {
    completedDate: String(formData.get("completedDate") ?? ""),
    completedMileage: String(formData.get("completedMileage") ?? ""),
    cost: String(formData.get("cost") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  };
}

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function createLog(
  taskId: string,
  _prevState: LogFormState,
  formData: FormData,
): Promise<LogFormState> {
  const parsed = parseLogForm(formData, todayUtc());
  const values = valuesFromFormData(formData);
  if (!parsed.ok) {
    return { fieldErrors: parsed.errors, values };
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { data: task } = await supabase
    .from("maintenance_tasks")
    .select("id, vehicle_id, name")
    .eq("id", taskId)
    .maybeSingle();
  if (!task) {
    notFound();
  }

  const { data: vehicle } = await supabase
    .from("vehicles")
    .select("id, current_mileage")
    .eq("id", task.vehicle_id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!vehicle) {
    notFound();
  }

  const { error } = await supabase.from("maintenance_logs").insert({
    vehicle_id: vehicle.id,
    maintenance_task_id: task.id,
    completed_date: parsed.value.completedDate,
    completed_mileage: parsed.value.completedMileage,
    cost_cents: parsed.value.costCents,
    notes: parsed.value.notes,
  });

  if (error) {
    return { formError: "Could not save the service record. Please try again.", values };
  }

  if (parsed.value.completedMileage > vehicle.current_mileage) {
    const { error: mileageError } = await supabase
      .from("vehicles")
      .update({
        current_mileage: parsed.value.completedMileage,
        updated_at: new Date().toISOString(),
      })
      .eq("id", vehicle.id)
      .eq("user_id", user.id);
    if (mileageError) {
      return { formError: "The record was saved, but the vehicle mileage could not be updated.", values };
    }
  }

  const recalculated = await recalculateTask(supabase, task.id, user.id);
  if (!recalculated.ok) {
    return { formError: recalculated.message, values };
  }

  revalidatePath(`/vehicles/${vehicle.id}`);
  revalidatePath(`/tasks/${task.id}`);
  redirect(`/tasks/${task.id}`);
}

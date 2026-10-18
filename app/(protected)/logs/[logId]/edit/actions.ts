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

async function ownedLog(logId: string) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { data: log } = await supabase
    .from("maintenance_logs")
    .select("id, vehicle_id, maintenance_task_id, completed_date, completed_mileage, cost_cents, notes")
    .eq("id", logId)
    .maybeSingle();
  if (!log) {
    return null;
  }

  const { data: vehicle } = await supabase
    .from("vehicles")
    .select("id")
    .eq("id", log.vehicle_id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!vehicle) {
    return null;
  }

  return { supabase, userId: user.id, log };
}

export async function updateLog(
  logId: string,
  _prevState: LogFormState,
  formData: FormData,
): Promise<LogFormState> {
  const parsed = parseLogForm(formData, todayUtc());
  const values = valuesFromFormData(formData);
  if (!parsed.ok) {
    return { fieldErrors: parsed.errors, values };
  }

  const owned = await ownedLog(logId);
  if (!owned) {
    notFound();
  }

  const { error } = await owned.supabase
    .from("maintenance_logs")
    .update({
      completed_date: parsed.value.completedDate,
      completed_mileage: parsed.value.completedMileage,
      cost_cents: parsed.value.costCents,
      notes: parsed.value.notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", logId)
    .eq("vehicle_id", owned.log.vehicle_id);

  if (error) {
    return { formError: "Could not update the service record. Please try again.", values };
  }

  const { data: vehicle } = await owned.supabase
    .from("vehicles")
    .select("current_mileage")
    .eq("id", owned.log.vehicle_id)
    .eq("user_id", owned.userId)
    .maybeSingle();

  if (vehicle && parsed.value.completedMileage > vehicle.current_mileage) {
    await owned.supabase
      .from("vehicles")
      .update({
        current_mileage: parsed.value.completedMileage,
        updated_at: new Date().toISOString(),
      })
      .eq("id", owned.log.vehicle_id)
      .eq("user_id", owned.userId);
  }

  const recalculated = await recalculateTask(
    owned.supabase,
    owned.log.maintenance_task_id,
    owned.userId,
  );
  if (!recalculated.ok) {
    return { formError: recalculated.message, values };
  }

  revalidatePath(`/tasks/${owned.log.maintenance_task_id}`);
  redirect(`/tasks/${owned.log.maintenance_task_id}`);
}

export async function deleteLog(formData: FormData) {
  const logId = String(formData.get("logId") ?? "");
  const owned = await ownedLog(logId);
  if (!owned) {
    notFound();
  }

  const { error } = await owned.supabase
    .from("maintenance_logs")
    .delete()
    .eq("id", logId)
    .eq("vehicle_id", owned.log.vehicle_id);

  if (error) {
    redirect(`/tasks/${owned.log.maintenance_task_id}?error=delete`);
  }

  await recalculateTask(owned.supabase, owned.log.maintenance_task_id, owned.userId);
  revalidatePath(`/vehicles/${owned.log.vehicle_id}/history`);
  redirect(`/tasks/${owned.log.maintenance_task_id}`);
}

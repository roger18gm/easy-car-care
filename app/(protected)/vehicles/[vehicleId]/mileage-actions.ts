"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { taskStatus } from "@/lib/scheduling";
import { createServerClient } from "@/lib/supabase/server";

export type MileageFormState = {
  fieldError?: string;
  formError?: string;
};

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function updateMileage(
  vehicleId: string,
  _prevState: MileageFormState,
  formData: FormData,
): Promise<MileageFormState> {
  const raw = String(formData.get("mileage") ?? "").trim();
  const mileage = Number(raw);
  if (!raw || !Number.isInteger(mileage) || mileage < 0) {
    return { fieldError: "Enter a whole number of miles, 0 or more." };
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { data: vehicle, error: vehicleError } = await supabase
    .from("vehicles")
    .select("current_mileage")
    .eq("id", vehicleId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (vehicleError) {
    return { fieldError: "Could not read the saved mileage. Please try again." };
  }
  if (!vehicle) {
    notFound();
  }
  if (mileage < vehicle.current_mileage) {
    return { fieldError: "Mileage cannot be lower than the current value." };
  }

  const { error: updateError } = await supabase
    .from("vehicles")
    .update({ current_mileage: mileage, updated_at: new Date().toISOString() })
    .eq("id", vehicleId)
    .eq("user_id", user.id);

  if (updateError) {
    return { formError: "Could not save the mileage. Please try again." };
  }

  const { data: tasks, error: tasksError } = await supabase
    .from("maintenance_tasks")
    .select("id, next_due_mileage, next_due_date")
    .eq("vehicle_id", vehicleId);

  if (tasksError || !tasks) {
    return { formError: "Mileage was saved, but the maintenance plan could not be updated." };
  }

  const today = todayUtc();
  for (const task of tasks) {
    const status = taskStatus({
      currentMileage: mileage,
      today,
      nextDueMileage: task.next_due_mileage,
      nextDueDate: task.next_due_date,
    });
    const { error } = await supabase
      .from("maintenance_tasks")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", task.id)
      .eq("vehicle_id", vehicleId);

    if (error) {
      return { formError: "Mileage was saved, but a task status could not be updated." };
    }
  }

  revalidatePath(`/vehicles/${vehicleId}`);
  redirect(`/vehicles/${vehicleId}`);
}

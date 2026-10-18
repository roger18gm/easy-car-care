import type { SupabaseClient } from "@supabase/supabase-js";
import { nextDuePoint } from "@/lib/next-due";
import { taskStatus } from "@/lib/scheduling";

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function recalculateTask(
  supabase: SupabaseClient,
  taskId: string,
  userId: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const { data: task, error: taskError } = await supabase
    .from("maintenance_tasks")
    .select("id, vehicle_id, interval_miles, interval_months")
    .eq("id", taskId)
    .maybeSingle();

  if (taskError || !task) {
    return { ok: false, message: "Could not find that maintenance task." };
  }

  const { data: vehicle, error: vehicleError } = await supabase
    .from("vehicles")
    .select("id, current_mileage, created_at")
    .eq("id", task.vehicle_id)
    .eq("user_id", userId)
    .maybeSingle();

  if (vehicleError || !vehicle) {
    return { ok: false, message: "Could not find that vehicle." };
  }

  const { data: latestLog, error: logError } = await supabase
    .from("maintenance_logs")
    .select("completed_date, completed_mileage")
    .eq("maintenance_task_id", taskId)
    .order("completed_date", { ascending: false })
    .order("completed_mileage", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (logError) {
    return { ok: false, message: "Could not read the service history." };
  }

  const baseline = latestLog
    ? {
        baselineMileage: latestLog.completed_mileage,
        baselineDate: latestLog.completed_date,
      }
    : {
        // When no logs remain, next due uses the vehicle's current mileage and created_at date.
        baselineMileage: vehicle.current_mileage,
        baselineDate: String(vehicle.created_at).slice(0, 10),
      };

  const nextDue = nextDuePoint({
    ...baseline,
    intervalMiles: task.interval_miles,
    intervalMonths: task.interval_months,
  });
  const status = taskStatus({
    currentMileage: vehicle.current_mileage,
    today: todayUtc(),
    nextDueMileage: nextDue.nextDueMileage,
    nextDueDate: nextDue.nextDueDate,
  });

  const { error: updateError } = await supabase
    .from("maintenance_tasks")
    .update({
      next_due_mileage: nextDue.nextDueMileage,
      next_due_date: nextDue.nextDueDate,
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", taskId)
    .eq("vehicle_id", vehicle.id);

  if (updateError) {
    return { ok: false, message: "Could not update the next due date." };
  }

  return { ok: true };
}

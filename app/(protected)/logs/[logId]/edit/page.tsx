import Link from "next/link";
import { notFound } from "next/navigation";
import { LogForm } from "@/components/log-form";
import { createServerClient } from "@/lib/supabase/server";
import { updateLog } from "./actions";

type EditLogPageProps = {
  params: Promise<{ logId: string }>;
};

export default async function EditLogPage({ params }: EditLogPageProps) {
  const { logId } = await params;
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: log } = await supabase
    .from("maintenance_logs")
    .select("id, vehicle_id, maintenance_task_id, completed_date, completed_mileage, cost_cents, notes")
    .eq("id", logId)
    .maybeSingle();
  if (!log) {
    notFound();
  }

  const { data: vehicle } = await supabase
    .from("vehicles")
    .select("id")
    .eq("id", log.vehicle_id)
    .eq("user_id", user!.id)
    .maybeSingle();
  if (!vehicle) {
    notFound();
  }

  const { data: task } = await supabase
    .from("maintenance_tasks")
    .select("name")
    .eq("id", log.maintenance_task_id)
    .maybeSingle();

  return (
    <div>
      <p className="mb-4 text-sm">
        <Link href={`/tasks/${log.maintenance_task_id}`} className="underline">
          Back to {task?.name ?? "task"}
        </Link>
      </p>
      <LogForm
        title="Edit service record"
        submitLabel="Save changes"
        action={updateLog.bind(null, log.id)}
        initialValues={{
          completedDate: log.completed_date,
          completedMileage: String(log.completed_mileage),
          cost: log.cost_cents == null ? "" : (log.cost_cents / 100).toFixed(2),
          notes: log.notes ?? "",
        }}
      />
    </div>
  );
}

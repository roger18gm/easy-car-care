import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteLogForm } from "@/components/delete-log-button";
import { createServerClient } from "@/lib/supabase/server";

type TaskPageProps = {
  params: Promise<{ taskId: string }>;
};

function statusLabel(status: string): string {
  if (status === "overdue") return "Overdue";
  if (status === "due") return "Due soon";
  return "Upcoming";
}

export default async function TaskPage({ params }: TaskPageProps) {
  const { taskId } = await params;
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: task } = await supabase
    .from("maintenance_tasks")
    .select("id, vehicle_id, name, description, next_due_mileage, next_due_date, status, interval_miles, interval_months")
    .eq("id", taskId)
    .maybeSingle();
  if (!task) {
    notFound();
  }

  const { data: vehicle } = await supabase
    .from("vehicles")
    .select("id, year, make, model")
    .eq("id", task.vehicle_id)
    .eq("user_id", user!.id)
    .maybeSingle();
  if (!vehicle) {
    notFound();
  }

  const { data: logs } = await supabase
    .from("maintenance_logs")
    .select("id, completed_date, completed_mileage, cost_cents, notes")
    .eq("maintenance_task_id", task.id)
    .order("completed_date", { ascending: false });

  return (
    <div>
      <p className="mb-4 text-sm">
        <Link href={`/vehicles/${vehicle.id}`} className="underline">
          Back to {vehicle.year} {vehicle.make} {vehicle.model}
        </Link>
      </p>
      <h1 className="text-2xl font-semibold tracking-tight">{task.name}</h1>
      <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">{task.description}</p>
      <p className="mt-4 text-sm font-medium">{statusLabel(task.status)}</p>
      <dl className="mt-4 grid max-w-lg gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-zinc-500">Next due mileage</dt>
          <dd>{task.next_due_mileage != null ? `${task.next_due_mileage.toLocaleString()} miles` : "—"}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Next due date</dt>
          <dd>{task.next_due_date ?? "—"}</dd>
        </div>
      </dl>
      <p className="mt-6">
        <Link
          href={`/tasks/${task.id}/log`}
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
        >
          Log completion
        </Link>
      </p>
      <h2 className="mt-8 text-lg font-semibold">Records for this task</h2>
      {(logs ?? []).length === 0 ? (
        <p className="mt-2 text-sm text-zinc-600">No service has been logged yet.</p>
      ) : (
        <ul className="mt-4 divide-y divide-zinc-200 dark:divide-zinc-800">
          {(logs ?? []).map((log) => (
            <li key={log.id} className="flex flex-wrap items-start justify-between gap-3 py-3 text-sm">
              <div>
                <p>
                  {log.completed_date} · {log.completed_mileage.toLocaleString()} miles
                  {log.cost_cents != null ? ` · $${(log.cost_cents / 100).toFixed(2)}` : ""}
                </p>
                {log.notes && <p className="mt-1 text-zinc-600">{log.notes}</p>}
              </div>
              <div className="flex items-center gap-4">
                <Link href={`/logs/${log.id}/edit`} className="underline">
                  Edit
                </Link>
                <DeleteLogForm logId={log.id} taskName={task.name} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

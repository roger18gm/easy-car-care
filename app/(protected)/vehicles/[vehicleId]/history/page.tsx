import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";

type HistoryPageProps = {
  params: Promise<{ vehicleId: string }>;
};

export default async function VehicleHistoryPage({ params }: HistoryPageProps) {
  const { vehicleId } = await params;
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: vehicle } = await supabase
    .from("vehicles")
    .select("id, year, make, model")
    .eq("id", vehicleId)
    .eq("user_id", user!.id)
    .maybeSingle();
  if (!vehicle) {
    notFound();
  }

  const { data: logs, error } = await supabase
    .from("maintenance_logs")
    .select("id, completed_date, completed_mileage, cost_cents, notes, maintenance_task_id")
    .eq("vehicle_id", vehicle.id)
    .order("completed_date", { ascending: false });

  const taskIds = [...new Set((logs ?? []).map((log) => log.maintenance_task_id))];
  const { data: tasks } = taskIds.length
    ? await supabase.from("maintenance_tasks").select("id, name").in("id", taskIds)
    : { data: [] };
  const taskNames = new Map((tasks ?? []).map((task) => [task.id, task.name]));

  return (
    <div>
      <p className="mb-4 text-sm">
        <Link href={`/vehicles/${vehicle.id}`} className="underline">
          Back to {vehicle.year} {vehicle.make} {vehicle.model}
        </Link>
      </p>
      <h1 className="text-2xl font-semibold tracking-tight">Service history</h1>
      {error ? (
        <p className="mt-4 text-sm text-red-700" role="alert">
          Could not load the service history. Please try again.
        </p>
      ) : (logs ?? []).length === 0 ? (
        <p className="mt-4 text-sm text-zinc-600">No service has been logged yet.</p>
      ) : (
        <ul className="mt-6 divide-y divide-zinc-200 dark:divide-zinc-800">
          {(logs ?? []).map((log) => {
            const taskName = taskNames.get(log.maintenance_task_id);
            return (
              <li key={log.id} className="py-4 text-sm">
                <p className="font-medium">{taskName ?? "Service"}</p>
                <p className="mt-1">
                  {log.completed_date} · {log.completed_mileage.toLocaleString()} miles
                  {log.cost_cents != null ? ` · $${(log.cost_cents / 100).toFixed(2)}` : ""}
                </p>
                {log.notes && <p className="mt-1 text-zinc-600">{log.notes}</p>}
                <p className="mt-2">
                  <Link href={`/logs/${log.id}/edit`} className="underline">
                    Edit
                  </Link>
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

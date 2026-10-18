import Link from "next/link";
import { notFound } from "next/navigation";
import { healthSummary, type TaskStatus } from "@/lib/scheduling";
import { createServerClient } from "@/lib/supabase/server";

type DashboardPageProps = {
  searchParams: Promise<{ vehicle?: string }>;
};

function statusLabel(status: string): string {
  if (status === "overdue") return "Overdue";
  if (status === "due") return "Due soon";
  return "Upcoming";
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { vehicle: requestedVehicleId } = await searchParams;
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: vehicles } = await supabase
    .from("vehicles")
    .select("id, year, make, model, current_mileage, created_at")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  if (!vehicles || vehicles.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">Add your first car.</p>
        <p className="mt-4">
          <Link href="/vehicles/new" className="underline">
            Add a vehicle
          </Link>
        </p>
      </div>
    );
  }

  const selected =
    vehicles.find((vehicle) => vehicle.id === requestedVehicleId) ?? vehicles[0];
  if (!selected) {
    notFound();
  }

  const { data: tasks } = await supabase
    .from("maintenance_tasks")
    .select("id, name, status, next_due_mileage, next_due_date")
    .eq("vehicle_id", selected.id);

  const taskList = tasks ?? [];
  const health = healthSummary(
    taskList.map((task) => ({ status: task.status as TaskStatus })),
  );
  const urgent = taskList
    .filter((task) => task.status === "overdue" || task.status === "due")
    .sort((left, right) => (left.status === "overdue" ? -1 : 1) - (right.status === "overdue" ? -1 : 1));

  const { data: logs } = await supabase
    .from("maintenance_logs")
    .select("id, completed_date, completed_mileage, maintenance_task_id")
    .eq("vehicle_id", selected.id)
    .order("completed_date", { ascending: false })
    .limit(5);

  const taskNames = new Map(taskList.map((task) => [task.id, task.name]));

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {selected.year} {selected.make} {selected.model}
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            {selected.current_mileage.toLocaleString()} miles
          </p>
        </div>
        <p className="text-sm font-medium">
          {health.label} · {health.score}
        </p>
      </div>

      {vehicles.length > 1 && (
        <ul className="mt-4 flex flex-wrap gap-3 text-sm">
          {vehicles.map((vehicle) => (
            <li key={vehicle.id}>
              <Link
                href={`/dashboard?vehicle=${vehicle.id}`}
                className={vehicle.id === selected.id ? "font-semibold underline" : "underline"}
              >
                {vehicle.year} {vehicle.make} {vehicle.model}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-6">
        <Link href={`/vehicles/${selected.id}#update-mileage`} className="underline">
          Update mileage
        </Link>
      </p>

      <h2 className="mt-8 text-lg font-semibold">What needs attention</h2>
      {urgent.length === 0 ? (
        <p className="mt-2 text-sm text-zinc-600">You are caught up on this vehicle.</p>
      ) : (
        <ul className="mt-3 divide-y divide-zinc-200 dark:divide-zinc-800">
          {urgent.map((task) => (
            <li key={task.id} className="flex flex-wrap items-baseline justify-between gap-3 py-3 text-sm">
              <Link href={`/tasks/${task.id}`} className="font-medium underline">
                {task.name}
              </Link>
              <span>{statusLabel(task.status)}</span>
            </li>
          ))}
        </ul>
      )}

      <h2 className="mt-8 text-lg font-semibold">Recent activity</h2>
      {(logs ?? []).length === 0 ? (
        <p className="mt-2 text-sm text-zinc-600">No service has been logged yet.</p>
      ) : (
        <ul className="mt-3 space-y-2 text-sm">
          {(logs ?? []).map((log) => (
            <li key={log.id}>
              {taskNames.get(log.maintenance_task_id) ?? "Service"} · {log.completed_date} ·{" "}
              {log.completed_mileage.toLocaleString()} miles
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

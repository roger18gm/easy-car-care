export type MaintenanceTaskItem = {
  id: string;
  name: string;
  description: string;
  next_due_mileage: number | null;
  next_due_date: string | null;
  status: "upcoming" | "due" | "overdue";
};

function statusLabel(status: MaintenanceTaskItem["status"]): string {
  switch (status) {
    case "upcoming":
      return "Upcoming";
    case "due":
      return "Due soon";
    case "overdue":
      return "Overdue";
  }
}

function formatDueDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

type TaskListProps = {
  tasks: MaintenanceTaskItem[];
};

export function TaskList({ tasks }: TaskListProps) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold tracking-tight">Maintenance plan</h2>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        These intervals are general estimates.
      </p>
      <ul className="mt-4 divide-y divide-zinc-200 dark:divide-zinc-800">
        {tasks.map((task) => (
          <li key={task.id} className="py-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="font-medium">{task.name}</h3>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {task.description}
                </p>
                <dl className="mt-3 grid gap-1 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-zinc-500 dark:text-zinc-500">Next due mileage</dt>
                    <dd>
                      {task.next_due_mileage != null
                        ? `${task.next_due_mileage.toLocaleString()} miles`
                        : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500 dark:text-zinc-500">Next due date</dt>
                    <dd>
                      {task.next_due_date != null
                        ? formatDueDate(task.next_due_date)
                        : "—"}
                    </dd>
                  </div>
                </dl>
              </div>
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {statusLabel(task.status)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

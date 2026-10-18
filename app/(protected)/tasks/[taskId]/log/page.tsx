import Link from "next/link";
import { notFound } from "next/navigation";
import { LogForm } from "@/components/log-form";
import { createServerClient } from "@/lib/supabase/server";
import { createLog } from "./actions";

type LogPageProps = {
  params: Promise<{ taskId: string }>;
};

export default async function LogCompletionPage({ params }: LogPageProps) {
  const { taskId } = await params;
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: task } = await supabase
    .from("maintenance_tasks")
    .select("id, name, vehicle_id")
    .eq("id", taskId)
    .maybeSingle();
  if (!task) {
    notFound();
  }

  const { data: vehicle } = await supabase
    .from("vehicles")
    .select("id")
    .eq("id", task.vehicle_id)
    .eq("user_id", user!.id)
    .maybeSingle();
  if (!vehicle) {
    notFound();
  }

  return (
    <div>
      <p className="mb-4 text-sm">
        <Link href={`/tasks/${task.id}`} className="underline">
          Back to {task.name}
        </Link>
      </p>
      <LogForm
        title={`Log ${task.name.toLowerCase()}`}
        submitLabel="Save maintenance record"
        action={createLog.bind(null, task.id)}
      />
    </div>
  );
}

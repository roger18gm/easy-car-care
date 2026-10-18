import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteVehicleForm } from "@/components/delete-vehicle-button";
import { MileageForm } from "@/components/mileage-form";
import { TaskList } from "@/components/task-list";
import { createServerClient } from "@/lib/supabase/server";
import { updateMileage } from "./mileage-actions";

const linkClassName =
  "underline outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background";

type VehicleDetailPageProps = {
  params: Promise<{ vehicleId: string }>;
};

export default async function VehicleDetailPage({ params }: VehicleDetailPageProps) {
  const { vehicleId } = await params;
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: vehicle } = await supabase
    .from("vehicles")
    .select("id, year, make, model, current_mileage, vin, purchase_date")
    .eq("id", vehicleId)
    .eq("user_id", user!.id)
    .maybeSingle();

  if (!vehicle) {
    notFound();
  }

  const { data: tasks, error: tasksError } = await supabase
    .from("maintenance_tasks")
    .select("id, name, description, next_due_mileage, next_due_date, status")
    .eq("vehicle_id", vehicleId)
    .order("name");

  const heading = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{heading}</h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            {vehicle.current_mileage.toLocaleString()} miles
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <Link href="#update-mileage" className={linkClassName}>
            Update mileage
          </Link>
          <Link href={`/vehicles/${vehicle.id}/history`} className={linkClassName}>
            History
          </Link>
          <Link href={`/vehicles/${vehicle.id}/edit`} className={linkClassName}>
            Edit
          </Link>
          <DeleteVehicleForm vehicleId={vehicle.id} vehicleLabel={heading} />
        </div>
      </div>
      <MileageForm
        vehicleId={vehicle.id}
        currentMileage={vehicle.current_mileage}
        action={updateMileage.bind(null, vehicle.id)}
      />
      {tasksError ? (
        <section className="mt-8">
          <h2 className="text-lg font-semibold tracking-tight">Maintenance plan</h2>
          <div
            className="mt-4 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
            role="alert"
          >
            <p>Could not load the maintenance plan. Please try again.</p>
            <p className="mt-2">
              <Link href={`/vehicles/${vehicle.id}`} className={linkClassName}>
                Try again
              </Link>
            </p>
          </div>
        </section>
      ) : (
        <TaskList tasks={tasks ?? []} />
      )}
    </div>
  );
}

import Link from "next/link";
import { DeleteVehicleForm } from "@/components/delete-vehicle-button";
import { createServerClient } from "@/lib/supabase/server";

const linkClassName =
  "underline outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export default async function VehiclesPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: vehicles } = await supabase
    .from("vehicles")
    .select("id, year, make, model, current_mileage")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const list = vehicles ?? [];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Vehicles</h1>
        <Link href="/vehicles/new" className={linkClassName}>
          Add vehicle
        </Link>
      </div>

      {list.length === 0 ? (
        <p className="text-zinc-600 dark:text-zinc-400">
          No vehicles yet.{" "}
          <Link href="/vehicles/new" className={linkClassName}>
            Add vehicle
          </Link>
        </p>
      ) : (
        <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {list.map((vehicle) => {
            const label = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
            return (
              <li
                key={vehicle.id}
                className="flex flex-wrap items-center justify-between gap-3 py-4"
              >
                <div>
                  <Link
                    href={`/vehicles/${vehicle.id}`}
                    className={`font-medium ${linkClassName}`}
                  >
                    {label}
                  </Link>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {vehicle.current_mileage.toLocaleString()} miles
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <Link
                    href={`/vehicles/${vehicle.id}/edit`}
                    className={linkClassName}
                  >
                    Edit
                  </Link>
                  <DeleteVehicleForm
                    vehicleId={vehicle.id}
                    vehicleLabel={label}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

import { notFound } from "next/navigation";
import {
  VehicleForm,
  valuesFromVehicle,
  vehicleFormFields,
} from "@/components/vehicle-form";
import { createServerClient } from "@/lib/supabase/server";
import { updateVehicle } from "../../actions";

type EditVehiclePageProps = {
  params: Promise<{ vehicleId: string }>;
};

export default async function EditVehiclePage({ params }: EditVehiclePageProps) {
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

  const boundUpdate = updateVehicle.bind(null, vehicle.id);

  return (
    <VehicleForm
      title="Edit vehicle"
      fields={vehicleFormFields}
      submitLabel="Save changes"
      action={boundUpdate}
      initialValues={valuesFromVehicle(vehicle)}
    />
  );
}

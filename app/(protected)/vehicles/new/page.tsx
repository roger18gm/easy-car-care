import {
  VehicleForm,
  vehicleFormFields,
} from "@/components/vehicle-form";
import { createVehicle } from "../actions";

export default function NewVehiclePage() {
  return (
    <VehicleForm
      title="Add vehicle"
      fields={vehicleFormFields}
      submitLabel="Save vehicle"
      action={createVehicle}
    />
  );
}

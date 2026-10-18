export function valuesFromVehicle(vehicle: {
  year: number;
  make: string;
  model: string;
  current_mileage: number;
  vin: string | null;
  purchase_date: string | null;
}): Record<string, string> {
  return {
    year: String(vehicle.year),
    make: vehicle.make,
    model: vehicle.model,
    currentMileage: String(vehicle.current_mileage),
    vin: vehicle.vin ?? "",
    purchaseDate: vehicle.purchase_date ?? "",
  };
}

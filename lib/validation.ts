export type VehicleInput = {
  year: number;
  make: string;
  model: string;
  currentMileage: number;
  vin: string | null;
  purchaseDate: string | null;
};

const VIN_PATTERN = /^[A-HJ-NPR-Z0-9]{17}$/;

export type ParseVehicleFormResult =
  | { ok: true; value: VehicleInput }
  | { ok: false; errors: Record<string, string> };

export function parseVehicleForm(
  formData: FormData,
  previousMileage?: number,
): ParseVehicleFormResult {
  const make = String(formData.get("make") ?? "").trim();
  const model = String(formData.get("model") ?? "").trim();
  const yearRaw = String(formData.get("year") ?? "").trim();
  const mileageRaw = String(formData.get("currentMileage") ?? "").trim();
  const vinRaw = String(formData.get("vin") ?? "").trim();
  const purchaseDateRaw = String(formData.get("purchaseDate") ?? "").trim();

  const errors: Record<string, string> = {};
  const maxYear = new Date().getFullYear() + 1;

  if (!make) {
    errors.make = "Make is required.";
  }
  if (!model) {
    errors.model = "Model is required.";
  }

  const year = Number(yearRaw);
  if (!yearRaw || !Number.isInteger(year) || year < 1980 || year > maxYear) {
    errors.year = `Enter a year between 1980 and ${maxYear}.`;
  }

  const mileage = Number(mileageRaw);
  const mileageIsWhole =
    mileageRaw !== "" && Number.isInteger(mileage) && mileage >= 0;
  if (!mileageIsWhole) {
    errors.currentMileage = "Enter a whole number of miles, 0 or more.";
  } else if (
    previousMileage !== undefined &&
    mileage < previousMileage
  ) {
    errors.currentMileage = "Mileage cannot be lower than the current value.";
  }

  let vin: string | null = null;
  if (vinRaw) {
    const normalizedVin = vinRaw.toUpperCase();
    if (!VIN_PATTERN.test(normalizedVin)) {
      errors.vin =
        "VIN must be 17 characters (letters and numbers, no I, O, or Q).";
    } else {
      vin = normalizedVin;
    }
  }

  let purchaseDate: string | null = null;
  if (purchaseDateRaw) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(purchaseDateRaw)) {
      errors.purchaseDate = "Enter a valid date.";
    } else {
      const parsed = new Date(`${purchaseDateRaw}T00:00:00`);
      if (Number.isNaN(parsed.getTime())) {
        errors.purchaseDate = "Enter a valid date.";
      } else {
        purchaseDate = purchaseDateRaw;
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      year,
      make,
      model,
      currentMileage: mileage,
      vin,
      purchaseDate,
    },
  };
}

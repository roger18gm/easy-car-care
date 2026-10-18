import { describe, expect, it } from "vitest";
import { parseVehicleForm } from "./validation";

function form(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

describe("parseVehicleForm", () => {
  it("accepts the required fields", () => {
    const result = parseVehicleForm(form({
      year: "2018",
      make: "Honda",
      model: "Civic",
      currentMileage: "54200",
    }));
    expect(result).toEqual({
      ok: true,
      value: { year: 2018, make: "Honda", model: "Civic", currentMileage: 54200, vin: null, purchaseDate: null },
    });
  });

  it("rejects a short VIN", () => {
    const result = parseVehicleForm(form({
      year: "2018", make: "Honda", model: "Civic", currentMileage: "10", vin: "ABC",
    }));
    expect(result.ok).toBe(false);
  });

  it("rejects a lower mileage when previousMileage is provided", () => {
    const result = parseVehicleForm(form({
      year: "2018", make: "Honda", model: "Civic", currentMileage: "10",
    }), 50);
    expect(result.ok).toBe(false);
  });
});

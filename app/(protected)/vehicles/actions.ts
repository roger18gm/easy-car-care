"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import type { VehicleFormState } from "@/components/vehicle-form";
import { createServerClient } from "@/lib/supabase/server";
import { parseVehicleForm } from "@/lib/validation";

function valuesFromFormData(formData: FormData): Record<string, string> {
  return {
    year: String(formData.get("year") ?? ""),
    make: String(formData.get("make") ?? ""),
    model: String(formData.get("model") ?? ""),
    currentMileage: String(formData.get("currentMileage") ?? ""),
    vin: String(formData.get("vin") ?? ""),
    purchaseDate: String(formData.get("purchaseDate") ?? ""),
  };
}

async function requireUserId() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/sign-in");
  }
  return { supabase, userId: user.id };
}

export async function createVehicle(
  _prevState: VehicleFormState,
  formData: FormData,
): Promise<VehicleFormState> {
  const parsed = parseVehicleForm(formData);
  if (!parsed.ok) {
    return { fieldErrors: parsed.errors, values: valuesFromFormData(formData) };
  }

  const { supabase, userId } = await requireUserId();
  const { data, error } = await supabase
    .from("vehicles")
    .insert({
      user_id: userId,
      year: parsed.value.year,
      make: parsed.value.make,
      model: parsed.value.model,
      current_mileage: parsed.value.currentMileage,
      vin: parsed.value.vin,
      purchase_date: parsed.value.purchaseDate,
    })
    .select("id")
    .single();

  if (error || !data) {
    if (error?.code === "23505") {
      return {
        fieldErrors: { vin: "That VIN is already registered." },
        values: valuesFromFormData(formData),
      };
    }
    return {
      formError: "Could not save the vehicle. Please try again.",
      values: valuesFromFormData(formData),
    };
  }

  revalidatePath("/vehicles");
  redirect(`/vehicles/${data.id}`);
}

export async function updateVehicle(
  vehicleId: string,
  previousMileage: number,
  _prevState: VehicleFormState,
  formData: FormData,
): Promise<VehicleFormState> {
  const parsed = parseVehicleForm(formData, previousMileage);
  if (!parsed.ok) {
    return { fieldErrors: parsed.errors, values: valuesFromFormData(formData) };
  }

  const { supabase, userId } = await requireUserId();
  const { data, error } = await supabase
    .from("vehicles")
    .update({
      year: parsed.value.year,
      make: parsed.value.make,
      model: parsed.value.model,
      current_mileage: parsed.value.currentMileage,
      vin: parsed.value.vin,
      purchase_date: parsed.value.purchaseDate,
      updated_at: new Date().toISOString(),
    })
    .eq("id", vehicleId)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error) {
    if (error.code === "23505") {
      return {
        fieldErrors: { vin: "That VIN is already registered." },
        values: valuesFromFormData(formData),
      };
    }
    return {
      formError: "Could not save the vehicle. Please try again.",
      values: valuesFromFormData(formData),
    };
  }

  if (!data) {
    notFound();
  }

  revalidatePath("/vehicles");
  revalidatePath(`/vehicles/${vehicleId}`);
  redirect(`/vehicles/${vehicleId}`);
}

export async function deleteVehicle(vehicleId: string) {
  const { supabase, userId } = await requireUserId();
  const { data, error } = await supabase
    .from("vehicles")
    .delete()
    .eq("id", vehicleId)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error("Could not delete the vehicle.");
  }

  if (!data) {
    notFound();
  }

  revalidatePath("/vehicles");
  redirect("/vehicles");
}

export async function deleteVehicleFromForm(formData: FormData) {
  const vehicleId = String(formData.get("vehicleId") ?? "");
  if (!vehicleId) {
    notFound();
  }
  await deleteVehicle(vehicleId);
}

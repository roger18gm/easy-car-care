export type LogInput = {
  completedDate: string;
  completedMileage: number;
  costCents: number | null;
  notes: string | null;
};

export type LogParseResult =
  | { ok: true; value: LogInput }
  | { ok: false; errors: Record<string, string> };

export function parseLogForm(formData: FormData, today: string): LogParseResult {
  const completedDate = String(formData.get("completedDate") ?? "").trim();
  const mileageRaw = String(formData.get("completedMileage") ?? "").trim();
  const costRaw = String(formData.get("cost") ?? "").trim();
  const notesRaw = String(formData.get("notes") ?? "").trim();
  const errors: Record<string, string> = {};

  if (!completedDate) {
    errors.completedDate = "Enter the date the work was done.";
  } else if (completedDate > today) {
    errors.completedDate = "The completion date cannot be in the future.";
  }

  const mileage = Number(mileageRaw);
  if (!mileageRaw || !Number.isInteger(mileage) || mileage < 0) {
    errors.completedMileage = "Enter a whole number of miles, 0 or more.";
  }

  let costCents: number | null = null;
  if (costRaw) {
    const dollars = Number(costRaw);
    if (!Number.isFinite(dollars) || dollars < 0) {
      errors.cost = "Enter a cost of 0 or more, or leave it blank.";
    } else {
      costCents = Math.round(dollars * 100);
    }
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      completedDate,
      completedMileage: mileage,
      costCents,
      notes: notesRaw || null,
    },
  };
}

import { addMonths } from "./dates";

export function nextDuePoint(input: {
  baselineMileage: number;
  baselineDate: string;
  intervalMiles: number | null;
  intervalMonths: number | null;
}): { nextDueMileage: number | null; nextDueDate: string | null } {
  return {
    nextDueMileage:
      input.intervalMiles != null ? input.baselineMileage + input.intervalMiles : null,
    nextDueDate:
      input.intervalMonths != null
        ? addMonths(input.baselineDate.slice(0, 10), input.intervalMonths)
        : null,
  };
}

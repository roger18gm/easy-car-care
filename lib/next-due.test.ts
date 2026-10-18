import { describe, expect, it } from "vitest";
import { nextDuePoint } from "./next-due";

describe("nextDuePoint", () => {
  it("schedules an oil change 5000 miles and 6 months after completion", () => {
    expect(nextDuePoint({
      baselineMileage: 54200,
      baselineDate: "2026-10-01",
      intervalMiles: 5000,
      intervalMonths: 6,
    })).toEqual({
      nextDueMileage: 59200,
      nextDueDate: "2027-04-01",
    });
  });
});

import { describe, expect, it } from "vitest";
import { addMonths } from "./dates";

describe("addMonths", () => {
  it("adds months inside the same year", () => {
    expect(addMonths("2026-01-15", 6)).toBe("2026-07-15");
  });

  it("rolls into the next year", () => {
    expect(addMonths("2026-10-31", 6)).toBe("2027-04-30");
  });
});

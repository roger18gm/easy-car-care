import { describe, expect, it } from "vitest";
import { healthSummary, taskStatus } from "./scheduling";

const today = "2026-10-17";

describe("taskStatus", () => {
  it("is overdue when mileage is at the due mileage", () => {
    expect(taskStatus({
      currentMileage: 59000, today, nextDueMileage: 59000, nextDueDate: null,
    })).toBe("overdue");
  });

  it("is overdue when the date is today", () => {
    expect(taskStatus({
      currentMileage: 1000, today, nextDueMileage: null, nextDueDate: today,
    })).toBe("overdue");
  });

  it("is due soon within 500 miles", () => {
    expect(taskStatus({
      currentMileage: 58500, today, nextDueMileage: 59000, nextDueDate: null,
    })).toBe("due");
  });

  it("is due soon within 30 days", () => {
    expect(taskStatus({
      currentMileage: 1000, today, nextDueMileage: null, nextDueDate: "2026-11-16",
    })).toBe("due");
  });

  it("is upcoming outside both windows", () => {
    expect(taskStatus({
      currentMileage: 1000, today, nextDueMileage: 10000, nextDueDate: "2027-10-17",
    })).toBe("upcoming");
  });

  it("is upcoming when the mileage target is 501 miles away", () => {
    expect(taskStatus({
      currentMileage: 58499, today, nextDueMileage: 59000, nextDueDate: null,
    })).toBe("upcoming");
  });

  it("uses the more urgent of mileage and date", () => {
    expect(taskStatus({
      currentMileage: 59000, today, nextDueMileage: 59000, nextDueDate: "2027-01-01",
    })).toBe("overdue");
  });
});

describe("healthSummary", () => {
  it("starts at good shape", () => {
    expect(healthSummary([{ status: "upcoming" }])).toEqual({ score: 100, label: "Good shape" });
  });

  it("drops for due and overdue tasks", () => {
    expect(healthSummary([
      { status: "overdue" },
      { status: "due" },
    ])).toEqual({ score: 80, label: "Good shape" });
  });
});

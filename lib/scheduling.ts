export const DUE_SOON_MILES = 500;
export const DUE_SOON_DAYS = 30;

export type TaskStatus = "upcoming" | "due" | "overdue";

const STATUS_RANK: Record<TaskStatus, number> = {
  upcoming: 0,
  due: 1,
  overdue: 2,
};

function daysUntil(today: string, dueDate: string): number {
  const [year, month, day] = today.split("-").map(Number);
  const [dueYear, dueMonth, dueDay] = dueDate.split("-").map(Number);
  const start = Date.UTC(year, month - 1, day);
  const end = Date.UTC(dueYear, dueMonth - 1, dueDay);
  return Math.round((end - start) / 86_400_000);
}

function mileageStatus(currentMileage: number, nextDueMileage: number): TaskStatus {
  const milesRemaining = nextDueMileage - currentMileage;
  if (milesRemaining <= 0) {
    return "overdue";
  }
  if (milesRemaining <= DUE_SOON_MILES) {
    return "due";
  }
  return "upcoming";
}

function dateStatus(today: string, nextDueDate: string): TaskStatus {
  const daysRemaining = daysUntil(today, nextDueDate);
  if (daysRemaining <= 0) {
    return "overdue";
  }
  if (daysRemaining <= DUE_SOON_DAYS) {
    return "due";
  }
  return "upcoming";
}

function moreUrgent(left: TaskStatus, right: TaskStatus): TaskStatus {
  return STATUS_RANK[left] >= STATUS_RANK[right] ? left : right;
}

export function taskStatus(input: {
  currentMileage: number;
  today: string;
  nextDueMileage: number | null;
  nextDueDate: string | null;
}): TaskStatus {
  const fromMileage =
    input.nextDueMileage == null
      ? null
      : mileageStatus(input.currentMileage, input.nextDueMileage);
  const fromDate =
    input.nextDueDate == null ? null : dateStatus(input.today, input.nextDueDate);

  if (fromMileage && fromDate) {
    return moreUrgent(fromMileage, fromDate);
  }
  return fromMileage ?? fromDate ?? "upcoming";
}

export function healthSummary(tasks: { status: TaskStatus }[]): {
  score: number;
  label: "Good shape" | "Needs attention" | "Overdue care";
} {
  let score = 100;
  for (const task of tasks) {
    if (task.status === "overdue") {
      score -= 15;
    } else if (task.status === "due") {
      score -= 5;
    }
  }
  score = Math.max(0, score);

  const label =
    score >= 80 ? "Good shape" : score >= 50 ? "Needs attention" : "Overdue care";

  return { score, label };
}

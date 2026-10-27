export const DUE_SOON_MILES = 500
export const DUE_SOON_DAYS = 30

export type TaskStatus = 'upcoming' | 'due' | 'overdue'

const RANK: Record<TaskStatus, number> = { upcoming: 0, due: 1, overdue: 2 }
const FROM_RANK: TaskStatus[] = ['upcoming', 'due', 'overdue']

function utcTime(isoDate: string): number {
  const [year, month, day] = isoDate.split('-').map(Number)
  return Date.UTC(year, month - 1, day)
}

function daysUntil(today: string, next: string): number {
  return Math.round((utcTime(next) - utcTime(today)) / 86_400_000)
}

export function addMonths(isoDate: string, months: number): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  const monthIndex = month - 1 + months
  const nextYear = year + Math.floor(monthIndex / 12)
  const nextMonth = ((monthIndex % 12) + 12) % 12
  const lastDay = new Date(Date.UTC(nextYear, nextMonth + 1, 0)).getUTCDate()
  const nextDay = Math.min(day, lastDay)
  const monthText = String(nextMonth + 1).padStart(2, '0')
  const dayText = String(nextDay).padStart(2, '0')
  return `${nextYear}-${monthText}-${dayText}`
}

export function dueTargets(
  baseMileage: number,
  baseDate: string,
  intervalMiles: number | null,
  intervalMonths: number | null,
): { nextDueMileage: number | null; nextDueDate: string | null } {
  return {
    nextDueMileage: intervalMiles == null ? null : baseMileage + intervalMiles,
    nextDueDate: intervalMonths == null ? null : addMonths(baseDate, intervalMonths),
  }
}

function mileageRank(currentMileage: number, nextDueMileage: number | null): number | null {
  if (nextDueMileage == null) return null
  const remaining = nextDueMileage - currentMileage
  if (remaining <= 0) return 2
  if (remaining <= DUE_SOON_MILES) return 1
  return 0
}

function dateRank(today: string, nextDueDate: string | null): number | null {
  if (nextDueDate == null) return null
  const days = daysUntil(today, nextDueDate)
  if (days <= 0) return 2
  if (days <= DUE_SOON_DAYS) return 1
  return 0
}

export function taskStatus(args: {
  currentMileage: number
  today: string
  nextDueMileage: number | null
  nextDueDate: string | null
}): TaskStatus {
  const ranks = [mileageRank(args.currentMileage, args.nextDueMileage), dateRank(args.today, args.nextDueDate)].filter(
    (rank): rank is number => rank != null,
  )
  const winning = ranks.length === 0 ? 0 : Math.max(...ranks)
  return FROM_RANK[winning]
}

function formatLong(isoDate: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(utcTime(isoDate)))
}

function mileageSentence(currentMileage: number, nextDueMileage: number): string {
  const remaining = nextDueMileage - currentMileage
  if (remaining > 0) return `Due in about ${remaining} miles`
  if (remaining === 0) return 'Due now'
  return `About ${Math.abs(remaining)} miles overdue`
}

function dateSentence(today: string, nextDueDate: string): string {
  const days = daysUntil(today, nextDueDate)
  if (days > 0) return `Due ${formatLong(nextDueDate)}`
  if (days === 0) return 'Due today'
  return `Overdue since ${formatLong(nextDueDate)}`
}

export function dueSentences(args: {
  currentMileage: number
  today: string
  nextDueMileage: number | null
  nextDueDate: string | null
}): string[] {
  const mile = mileageRank(args.currentMileage, args.nextDueMileage)
  const date = dateRank(args.today, args.nextDueDate)
  const winningRank = RANK[taskStatus(args)]
  const sentences: string[] = []
  if (mile === winningRank && args.nextDueMileage != null) {
    sentences.push(mileageSentence(args.currentMileage, args.nextDueMileage))
  }
  if (date === winningRank && args.nextDueDate != null) {
    sentences.push(dateSentence(args.today, args.nextDueDate))
  }
  return sentences
}

export function selectScheduleLog<T extends {
  completedDate: string
  completedMileage: number
  createdAt: string
}>(logs: T[]): T | null {
  if (logs.length === 0) return null
  return [...logs].sort((a, b) => {
    if (a.completedDate !== b.completedDate) return a.completedDate < b.completedDate ? 1 : -1
    if (a.completedMileage !== b.completedMileage) return b.completedMileage - a.completedMileage
    if (a.createdAt !== b.createdAt) return a.createdAt < b.createdAt ? 1 : -1
    return 0
  })[0]
}

export function localToday(now = new Date()): string {
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function utcCalendarDate(isoTimestamp: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoTimestamp)) return isoTimestamp
  return new Date(isoTimestamp).toISOString().slice(0, 10)
}

export function statusLabel(status: TaskStatus): 'Upcoming' | 'Due soon' | 'Overdue' {
  if (status === 'due') return 'Due soon'
  if (status === 'overdue') return 'Overdue'
  return 'Upcoming'
}

export function healthLabel(statuses: TaskStatus[]): 'Needs attention' | 'Due soon' | 'Good shape' {
  if (statuses.includes('overdue')) return 'Needs attention'
  if (statuses.includes('due')) return 'Due soon'
  return 'Good shape'
}

export function groupByStatus<T extends { status: TaskStatus }>(tasks: T[]): {
  overdue: T[]
  due: T[]
  upcoming: T[]
} {
  return {
    overdue: tasks.filter((task) => task.status === 'overdue'),
    due: tasks.filter((task) => task.status === 'due'),
    upcoming: tasks.filter((task) => task.status === 'upcoming'),
  }
}

export function recalculatedTaskFields(args: {
  intervalMiles: number | null
  intervalMonths: number | null
  currentMileage: number
  createdOn: string
  today: string
  logs: { completedDate: string; completedMileage: number; createdAt: string }[]
}): { nextDueMileage: number | null; nextDueDate: string | null; status: TaskStatus } {
  const log = selectScheduleLog(args.logs)
  const targets = log
    ? dueTargets(log.completedMileage, log.completedDate, args.intervalMiles, args.intervalMonths)
    : dueTargets(args.currentMileage, args.createdOn, args.intervalMiles, args.intervalMonths)
  return {
    ...targets,
    status: taskStatus({
      currentMileage: args.currentMileage,
      today: args.today,
      nextDueMileage: targets.nextDueMileage,
      nextDueDate: targets.nextDueDate,
    }),
  }
}

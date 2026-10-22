import { describe, expect, it } from 'vitest'
import { addMonths, dueSentences, dueTargets, selectScheduleLog, taskStatus } from './schedule'

const today = '2026-10-22'

describe('taskStatus mileage', () => {
  it('marks 501 miles remaining as upcoming', () => {
    expect(taskStatus({ currentMileage: 10000, today, nextDueMileage: 10501, nextDueDate: null })).toBe('upcoming')
  })

  it('marks 500 miles remaining as due', () => {
    expect(taskStatus({ currentMileage: 10000, today, nextDueMileage: 10500, nextDueDate: null })).toBe('due')
  })

  it('marks 0 miles remaining as overdue', () => {
    expect(taskStatus({ currentMileage: 10000, today, nextDueMileage: 10000, nextDueDate: null })).toBe('overdue')
  })

  it('marks past mileage as overdue', () => {
    expect(taskStatus({ currentMileage: 10000, today, nextDueMileage: 9800, nextDueDate: null })).toBe('overdue')
  })
})

describe('taskStatus dates', () => {
  it('marks 31 days out as upcoming', () => {
    expect(taskStatus({ currentMileage: 10000, today, nextDueMileage: null, nextDueDate: '2026-11-22' })).toBe('upcoming')
  })

  it('marks 30 days out as due', () => {
    expect(taskStatus({ currentMileage: 10000, today, nextDueMileage: null, nextDueDate: '2026-11-21' })).toBe('due')
  })

  it('marks today as overdue', () => {
    expect(taskStatus({ currentMileage: 10000, today, nextDueMileage: null, nextDueDate: today })).toBe('overdue')
  })

  it('marks an earlier date as overdue', () => {
    expect(taskStatus({ currentMileage: 10000, today, nextDueMileage: null, nextDueDate: '2026-10-21' })).toBe('overdue')
  })
})

describe('taskStatus urgency', () => {
  it('lets overdue mileage beat an upcoming date', () => {
    expect(taskStatus({ currentMileage: 10000, today, nextDueMileage: 9990, nextDueDate: '2026-11-22' })).toBe('overdue')
  })

  it('lets a due date beat upcoming mileage', () => {
    expect(taskStatus({ currentMileage: 10000, today, nextDueMileage: 10501, nextDueDate: '2026-11-21' })).toBe('due')
  })

  it('lets an overdue date beat due-soon mileage', () => {
    expect(taskStatus({ currentMileage: 10000, today, nextDueMileage: 10500, nextDueDate: '2026-10-21' })).toBe('overdue')
  })

  it('ignores a null mileage target', () => {
    expect(taskStatus({ currentMileage: 10000, today, nextDueMileage: null, nextDueDate: '2026-10-21' })).toBe('overdue')
  })

  it('ignores a null date target', () => {
    expect(taskStatus({ currentMileage: 10000, today, nextDueMileage: 10501, nextDueDate: null })).toBe('upcoming')
  })

  it('marks a task with no targets as upcoming', () => {
    expect(taskStatus({ currentMileage: 10000, today, nextDueMileage: null, nextDueDate: null })).toBe('upcoming')
  })
})

describe('addMonths', () => {
  it('clamps January 31 to February 28 in a common year', () => {
    expect(addMonths('2026-01-31', 1)).toBe('2026-02-28')
  })

  it('clamps January 31 to February 29 in a leap year', () => {
    expect(addMonths('2024-01-31', 1)).toBe('2024-02-29')
  })
})

describe('dueTargets', () => {
  it('adds both intervals to the bases', () => {
    expect(dueTargets(54200, '2026-10-22', 5000, 6)).toEqual({
      nextDueMileage: 59200,
      nextDueDate: '2027-04-22',
    })
  })

  it('leaves a missing interval null', () => {
    expect(dueTargets(100, '2026-10-22', null, 6)).toEqual({
      nextDueMileage: null,
      nextDueDate: '2027-04-22',
    })
  })
})

describe('selectScheduleLog', () => {
  const older = { completedDate: '2026-01-01', completedMileage: 9000, createdAt: '2026-01-02T00:00:00Z' }
  const sameDayLowerMiles = { completedDate: '2026-06-01', completedMileage: 1000, createdAt: '2026-06-02T00:00:00Z' }
  const sameDayHigherMilesEarlier = { completedDate: '2026-06-01', completedMileage: 4000, createdAt: '2026-06-01T00:00:00Z' }
  const sameDayHigherMilesLater = { completedDate: '2026-06-01', completedMileage: 4000, createdAt: '2026-06-03T00:00:00Z' }

  it('prefers the later completion date', () => {
    expect(selectScheduleLog([older, sameDayLowerMiles])).toEqual(sameDayLowerMiles)
  })

  it('breaks a date tie toward the higher mileage', () => {
    expect(selectScheduleLog([sameDayLowerMiles, sameDayHigherMilesEarlier])).toEqual(sameDayHigherMilesEarlier)
  })

  it('breaks a mileage tie toward the later createdAt', () => {
    expect(selectScheduleLog([sameDayHigherMilesEarlier, sameDayHigherMilesLater])).toEqual(sameDayHigherMilesLater)
  })

  it('returns null when there are no logs', () => {
    expect(selectScheduleLog([])).toBeNull()
  })
})

describe('dueSentences', () => {
  it('describes remaining miles', () => {
    expect(dueSentences({ currentMileage: 10000, today, nextDueMileage: 10500, nextDueDate: null })).toEqual([
      'Due in about 500 miles',
    ])
  })

  it('says due now at the mileage target', () => {
    expect(dueSentences({ currentMileage: 10000, today, nextDueMileage: 10000, nextDueDate: null })).toEqual([
      'Due now',
    ])
  })

  it('describes miles overdue', () => {
    expect(dueSentences({ currentMileage: 10000, today, nextDueMileage: 9800, nextDueDate: null })).toEqual([
      'About 200 miles overdue',
    ])
  })

  it('formats a future date', () => {
    expect(dueSentences({ currentMileage: 10000, today, nextDueMileage: null, nextDueDate: '2027-03-02' })).toEqual([
      'Due March 2, 2027',
    ])
  })

  it('says due today', () => {
    expect(dueSentences({ currentMileage: 10000, today, nextDueMileage: null, nextDueDate: today })).toEqual([
      'Due today',
    ])
  })

  it('formats a past date', () => {
    expect(dueSentences({ currentMileage: 10000, today, nextDueMileage: null, nextDueDate: '2026-03-02' })).toEqual([
      'Overdue since March 2, 2026',
    ])
  })

  it('includes both sentences when both targets share the winning urgency', () => {
    expect(dueSentences({ currentMileage: 10000, today, nextDueMileage: 9800, nextDueDate: '2026-03-02' })).toEqual([
      'About 200 miles overdue',
      'Overdue since March 2, 2026',
    ])
  })

  it('includes only the winning target when the other is less urgent', () => {
    expect(dueSentences({ currentMileage: 10000, today, nextDueMileage: 9990, nextDueDate: '2026-11-22' })).toEqual([
      'About 10 miles overdue',
    ])
  })
})

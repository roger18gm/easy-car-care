# F7: Maintenance Logging

| Metadata | Value |
| --- | --- |
| ID / name | F7 / Maintenance Logging |
| Severity | High |
| Status | Drafted and reviewed |
| Effort | 1 week |
| Dependencies | F4 Starter Maintenance Plan; F6 Mileage Updates and Due Status |
| Classification | Blocked by another feature |

## 1. Goal

Let a vehicle owner record completed service and maintain an accurate history while automatically scheduling the next occurrence of that task.

## 2. Scope

In scope: create, read, edit, and delete maintenance logs; date, mileage, optional cost/notes; vehicle history; recalculation after any log change. Out of scope: receipt upload, multi-currency support, and mechanic verification.

## 3. User Stories

- As a driver, I want to log completed maintenance quickly.
- As a driver, I want to correct a mistaken entry without leaving an inaccurate schedule.
- As a driver, I want to review my vehicle's service history.

## 4. Functional Requirements

- An owner MUST create a log for an owned maintenance task with completion date and non-negative completion mileage.
- Completion date MUST NOT be in the future; cost and notes MAY be blank.
- Creating or editing a log MUST recalculate the task's next due mileage/date and status from the most recent valid log.
- Deleting a log MUST also recalculate the related task.
- History MUST list only logs for the selected owned vehicle, newest completed date first.
- A user MUST NOT read or modify another user's logs.

## 5. Acceptance Criteria

| ID | Given / When / Then |
| --- | --- |
| AC1 | Given valid completion data, when an owner saves a log, then it appears in history and the related task receives a new next due value. |
| AC2 | Given a future date or invalid mileage, when a user submits a log, then it is rejected with field feedback. |
| AC3 | Given an existing log, when its owner edits completion mileage/date, then history and the task's next due values update. |
| AC4 | Given an existing log, when its owner confirms deletion, then it disappears and the related task recalculates. |
| AC5 | Given logs for two users, when either user opens history or a log detail, then only their own logs are returned. |

## 6. Data Requirements

MaintenanceLog: id, vehicle id, task id, completion date, completion mileage, optional cost in smallest currency unit, optional notes, timestamps. Log vehicle id MUST match the related task's vehicle. The newest remaining log for a task determines its next due targets.

## 7. API Requirements

| Operation | Access | Contract |
| --- | --- | --- |
| Create task log | Task owner | Validate data, create log, recalculate related task, return both. |
| List vehicle logs | Vehicle owner | Return chronological vehicle history; support optional task filter. |
| Get/update/delete log | Log owner | Read/change/delete one owned log and recalculate task after changes. |

## 8. UI and States

Task detail offers Log completion. The form has required date/mileage, optional cost/notes, loading/saving, inline validation, and generic retry states. History provides a chronological list, no-history empty message, loading placeholders, error/retry, and deletion confirmation. A successful save returns to task detail or history with updated next-due text.

## 9. Test Plan

| Test ID | Acceptance criteria | Test |
| --- | --- |
| T1 | AC1 | Integration test creates a log and verifies history plus next-due recalculation. |
| T2 | AC2 | Validation tests reject future dates and invalid mileage. |
| T3 | AC3 | Integration test updates a log and verifies recalculated task fields. |
| T4 | AC4 | Integration test deletes a log and verifies recalculation from remaining logs. |
| T5 | AC5 | Authorization test denies cross-user log list/detail/mutation access. |

## 10. Risks, Open Questions, and Handoff Notes

Risk: out-of-order log dates can make "most recent" ambiguous. Proposed rule: choose the log with latest completion date, breaking ties by creation timestamp. Open question: should log mileage be allowed below the vehicle's current mileage? Proposed answer: yes, for historical records, but show a warning if it is higher than current mileage. Handoff: F8 displays recent logs and F10 caches history read-only.

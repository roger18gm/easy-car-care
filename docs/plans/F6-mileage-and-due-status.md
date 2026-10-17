# F6: Mileage Updates and Due Status

| Metadata | Value |
| --- | --- |
| ID / name | F6 / Mileage Updates and Due Status |
| Severity | High |
| Status | Drafted and reviewed |
| Effort | 1 week |
| Dependencies | F3 Vehicle Management; F4 Starter Maintenance Plan |
| Classification | Blocked by another feature |

## 1. Goal

Keep vehicle mileage current and classify each maintenance task as upcoming, due, or overdue using its mileage and/or time interval.

## 2. Scope

In scope: mileage update, validation, due-status calculation, due-soon threshold, and readable task status. Out of scope: location-based seasonal rules, email delivery, and manufacturer-specific interval data.

## 3. User Stories

- As a driver, I want to update mileage so my recommendations stay relevant.
- As a driver, I want to understand whether a task is upcoming, due, or overdue.

## 4. Functional Requirements

- A vehicle owner MUST update mileage only to a non-negative value that is not lower than stored mileage.
- The system MUST recalculate every task's status after a mileage update.
- A task MUST be `overdue` when current mileage is at/past next due mileage or current date is at/past next due date.
- A task MUST be `due` when it is within the approved due-soon threshold but not overdue; otherwise it MUST be `upcoming`.
- A task with both due mileage and date MUST use whichever condition is more urgent.
- The UI MUST display status in text, not color alone.

## 5. Acceptance Criteria

| ID | Given / When / Then |
| --- | --- |
| AC1 | Given a valid higher mileage, when the owner saves it, then the vehicle stores the new mileage and all task statuses recalculate. |
| AC2 | Given a task whose due mileage or date has passed, when status is calculated, then it is shown as overdue. |
| AC3 | Given a task inside the approved reminder threshold but not past due, when status is calculated, then it is shown as due. |
| AC4 | Given a task with both mileage and date targets, when either target is more urgent, then the more urgent result determines its status. |
| AC5 | Given a lower mileage value, when the owner submits it, then the value is rejected and stored mileage remains unchanged. |

## 6. Data Requirements

Vehicle `current_mileage` is the calculation input. MaintenanceTask stores `interval_miles`, `interval_months`, `next_due_mileage`, `next_due_date`, and status. The approved due-soon threshold is configuration data, not a per-user setting in this MVP.

## 7. API Requirements

| Operation | Access | Contract |
| --- | --- | --- |
| Update vehicle mileage | Vehicle owner | Validate monotonic mileage, persist it, and return updated vehicle/task status summary. |
| List vehicle tasks | Vehicle owner | Return each task's next due fields and calculated status. |
| Vehicle dashboard summary | Vehicle owner | Return counts/lists grouped by status for later dashboard use. |

## 8. UI and States

Vehicle detail has an Update mileage action with current value, input validation, saving state, and success confirmation. Maintenance lists show clear textual statuses: Upcoming, Due soon, or Overdue. Loading uses placeholders; errors preserve the prior displayed mileage and offer retry. No-task empty state directs users to verify their vehicle plan.

## 9. Test Plan

| Test ID | Acceptance criteria | Test |
| --- | --- |
| T1 | AC1 | Integration test updates mileage and verifies every affected task is recalculated. |
| T2 | AC2 | Unit test date and mileage boundary cases produce overdue. |
| T3 | AC3 | Unit test values at threshold produce due, not overdue. |
| T4 | AC4 | Unit test mixed due-date/due-mileage tasks select more urgent status. |
| T5 | AC5 | Validation test rejects lower mileage and retains original value. |

## 10. Risks, Open Questions, and Handoff Notes

Risk: ambiguity at threshold boundaries can cause inconsistent UI and reminders. Open question: what exact mileage/month threshold defines due soon? The team must choose one shared value before implementation. Handoff: F7 recalculates next due targets after completion; F8 and F9 consume status results.

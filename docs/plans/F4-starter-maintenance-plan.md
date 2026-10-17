# F4: Starter Maintenance Plan

| Metadata | Value |
| --- | --- |
| ID / name | F4 / Starter Maintenance Plan |
| Severity | High |
| Status | Drafted and reviewed |
| Effort | 0.75 week |
| Dependencies | F3 Vehicle Management |
| Classification | Blocked by another feature |

## 1. Goal

Give every newly created vehicle a clear, general-maintenance plan without requiring the user to research or configure intervals.

## 2. Scope

In scope: creating a fixed starter set of generated tasks and showing each task on the vehicle detail view. Out of scope: manufacturer-specific schedules, VIN-based recommendations, task editing, and custom tasks.

## 3. User Stories

- As a new vehicle owner, I want to see a maintenance plan immediately after adding my car.
- As a driver, I want each recommendation explained in plain English.

## 4. Functional Requirements

- Creating a vehicle MUST generate one task each for oil change, tire rotation, tire-pressure check, air-filter replacement, brake inspection, battery check, and coolant inspection.
- Each generated task MUST include a name, plain-language description, at least one interval, initial next-due value, and `is_custom=false`.
- A task MUST belong to exactly one vehicle.
- Starter tasks MUST be created once per vehicle; retries or duplicate submissions MUST NOT create duplicates.
- The vehicle detail view MUST show generated tasks and an empty/error state if task retrieval fails.

## 5. Acceptance Criteria

| ID | Given / When / Then |
| --- | --- |
| AC1 | Given a new vehicle is successfully created, when its detail is loaded, then all seven starter tasks appear once. |
| AC2 | Given a starter task, when it is viewed, then it has a plain-language description and a mileage and/or month interval. |
| AC3 | Given vehicle creation is retried or submitted twice, when task generation runs, then the vehicle still has only one of each starter task. |
| AC4 | Given a user requests another user's vehicle tasks, when the request is evaluated, then task data is not returned. |

## 6. Data Requirements

MaintenanceTask: id, vehicle id, optional template id, name, description, interval miles/months, next due mileage/date, status, `is_custom`, timestamps. Seeded service definitions supply the seven standard task names, descriptions, and general intervals.

## 7. API Requirements

| Operation | Access | Contract |
| --- | --- | --- |
| Create vehicle with plan | Owner | Vehicle creation triggers one starter-plan creation transaction. |
| List vehicle tasks | Owner | Return tasks belonging to a selected owned vehicle. |
| Get task | Owner | Return one task only when its vehicle is owned by current user. |

## 8. UI and States

Vehicle detail shows a maintenance-plan list with task name, short explanation, and next due information. Loading uses stable placeholders; normal state groups tasks by status once F6 is available. The empty state explains that no plan could be found and offers retry. Error state preserves the vehicle view and gives a retry action.

## 9. Test Plan

| Test ID | Acceptance criteria | Test |
| --- | --- | --- |
| T1 | AC1 | Integration test vehicle creation seeds exactly seven expected tasks. |
| T2 | AC2 | Seed-data test asserts every task has description and a usable interval. |
| T3 | AC3 | Idempotency test repeats generation and asserts unique vehicle/task type pairs. |
| T4 | AC4 | Authorization test denies cross-user task access. |

## 10. Risks, Open Questions, and Handoff Notes

Risk: generic intervals could be interpreted as manufacturer advice. UI copy MUST identify them as general guidance. Open question: which exact interval values will the team approve? Record them in seed data and review with the instructor. Handoff: F6 reads tasks to calculate their due status; F5 may add separate custom tasks.

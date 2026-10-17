# F5: Custom Maintenance Tasks

| Metadata | Value |
| --- | --- |
| ID / name | F5 / Custom Maintenance Tasks |
| Severity | Medium |
| Status | Drafted and reviewed |
| Effort | 0.75 week |
| Dependencies | F3 Vehicle Management |
| Classification | Blocked by another feature |

## 1. Goal

Let a vehicle owner add and manage maintenance tasks not covered by the starter plan.

## 2. Scope

In scope: create, list, edit, and delete custom tasks with name, explanation, and at least one interval. Out of scope: editing or deleting standard starter-task definitions, task completion logs, and shared templates.

## 3. User Stories

- As a driver, I want to track a special maintenance item for my vehicle.
- As a driver, I want to correct or remove a custom reminder I created.

## 4. Functional Requirements

- An owner MUST create a custom task with a name and either a mileage interval, month interval, or both.
- A custom task MUST be marked `is_custom=true` and linked to one owned vehicle.
- The owner MUST read, edit, and delete only their own custom tasks.
- The UI MUST prevent deletion of generated starter tasks through this feature.
- A custom task's next-due value MUST be calculated from the vehicle's current mileage and/or current date.

## 5. Acceptance Criteria

| ID | Given / When / Then |
| --- | --- |
| AC1 | Given a vehicle owner supplies a name and valid interval, when they save a custom task, then it appears in that vehicle's plan with a next due value. |
| AC2 | Given a custom task, when its owner saves valid edits, then its displayed fields and next due value update. |
| AC3 | Given a task form without both interval types, when it is submitted, then no task is created and the interval error is shown. |
| AC4 | Given a generated starter task, when a user tries to delete it from the custom-task flow, then deletion is denied. |
| AC5 | Given another user's custom task, when a user tries to access it, then no task data is returned. |

## 6. Data Requirements

Uses MaintenanceTask with `is_custom=true`, vehicle id, required name, optional description, interval miles/months, and calculated next due values. A custom task has no required service-template reference.

## 7. API Requirements

| Operation | Access | Contract |
| --- | --- | --- |
| Create/list custom tasks | Vehicle owner | Create valid custom tasks and list all vehicle tasks with source flag. |
| Update custom task | Task owner | Update name, description, and intervals; recalculate next due fields. |
| Delete custom task | Task owner | Delete only when `is_custom=true`; otherwise reject. |

## 8. UI and States

Vehicle detail includes an Add custom task command. The form includes name, optional description, and separate mileage/month controls with clear validation. Show loading on task retrieval, an inline save error, a no-custom-tasks empty message, and a confirmation dialog before deletion.

## 9. Test Plan

| Test ID | Acceptance criteria | Test |
| --- | --- | --- |
| T1 | AC1 | Integration test creates a custom task and verifies calculated next due value. |
| T2 | AC2 | Integration test edits intervals and verifies recalculation. |
| T3 | AC3 | Validation test rejects a task without either interval. |
| T4 | AC4 | Authorization/business-rule test rejects starter-task deletion. |
| T5 | AC5 | Authorization test rejects cross-user task access. |

## 10. Risks, Open Questions, and Handoff Notes

Risk: users may create confusing duplicates of starter tasks. Open question: should name duplicates be allowed? Proposed answer: allow them but show existing task names while creating. Handoff: F6 applies the same due-status calculation to custom tasks.

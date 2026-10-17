# F8: Dashboard and Vehicle Switching

| Metadata | Value |
| --- | --- |
| ID / name | F8 / Dashboard and Vehicle Switching |
| Severity | High |
| Status | Drafted and reviewed |
| Effort | 1 week |
| Dependencies | F3 Vehicle Management; F4 Starter Maintenance Plan; F6 Mileage Updates and Due Status; F7 Maintenance Logging |
| Classification | Blocked by another feature |

## 1. Goal

Provide a calm, useful home view that tells a user what their selected vehicle needs next and lets multi-vehicle users switch context.

## 2. Scope

In scope: selected vehicle, vehicle switcher, mileage, health/status summary, due and overdue tasks, recent maintenance activity, and direct links to details. Out of scope: predictive diagnostics, cost charts, and configurable dashboard widgets.

## 3. User Stories

- As a driver, I want to see the next important maintenance action at a glance.
- As a household driver, I want to switch vehicles without losing context.
- As a driver with no urgent work, I want reassuring confirmation that I am caught up.

## 4. Functional Requirements

- The dashboard MUST show data only for the selected vehicle owned by the signed-in user.
- It MUST show vehicle name, current mileage, overdue tasks, due-soon tasks, and recent logs.
- Overdue tasks MUST be more visually prominent than due-soon and upcoming tasks.
- The user MUST switch to another owned vehicle; the dashboard MUST refresh all displayed data.
- The dashboard MUST show a helpful no-vehicle state with an action to add a vehicle.
- Task and log links MUST navigate to the matching owned resource.

## 5. Acceptance Criteria

| ID | Given / When / Then |
| --- | --- |
| AC1 | Given a user with a selected vehicle, when the dashboard loads, then it displays that vehicle's mileage, task status groups, and recent logs. |
| AC2 | Given an overdue task and a due-soon task, when both appear, then overdue is presented before due-soon with explicit text labels. |
| AC3 | Given a user owns two vehicles, when they select the other vehicle, then all dashboard content changes to that vehicle's data. |
| AC4 | Given a user owns no vehicles, when the dashboard loads, then it shows an empty state with an Add vehicle action. |
| AC5 | Given a user selects a displayed task or log, when navigation completes, then they reach its matching detail view. |

## 6. Data Requirements

Consumes Vehicle current mileage, MaintenanceTask status/next due fields, and most recent MaintenanceLogs. The selected vehicle id is user-interface state and may persist per user/device after the final stack is chosen; no new persisted model is required for MVP.

## 7. API Requirements

| Operation | Access | Contract |
| --- | --- | --- |
| Dashboard summary | Vehicle owner | Return selected vehicle summary, status-grouped tasks, and recent logs. |
| List vehicles | Authenticated | Return owned vehicles for switcher. |
| Task/log detail | Resource owner | Return only the resource linked from the selected dashboard. |

## 8. UI and States

Use a responsive dashboard with vehicle switcher, status summary, "Next up" task list, overdue list when applicable, and recent activity. Loading uses stable sections/skeletons. Empty state is shown when no vehicle exists; caught-up state replaces urgent lists when nothing is due. Error state offers retry without losing navigation. On mobile, vehicle switching and key actions remain reachable without horizontal scrolling.

## 9. Test Plan

| Test ID | Acceptance criteria | Test |
| --- | --- | --- |
| T1 | AC1 | Integration/UI test fixture verifies each dashboard section uses selected vehicle data. |
| T2 | AC2 | UI test verifies overdue ordering and textual status labels. |
| T3 | AC3 | Integration/UI test switches vehicle and verifies all summary identifiers change. |
| T4 | AC4 | UI test verifies no-vehicle empty state and Add vehicle action. |
| T5 | AC5 | Route test verifies task/log links use matching owned resource ids. |

## 10. Risks, Open Questions, and Handoff Notes

Risk: a health score could imply diagnostic accuracy. Proposed MVP: use a plain status summary, not a numeric score, unless scoring rules are explicitly approved. Open question: how many recent logs should display? Proposed answer: three. Handoff: F10 caches this view as the primary offline read experience.

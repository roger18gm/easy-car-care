# F3: Vehicle Management

| Metadata | Value |
| --- | --- |
| ID / name | F3 / Vehicle Management |
| Severity | Critical |
| Status | Drafted and reviewed |
| Effort | 1 week |
| Dependencies | F1 Authentication Basics |
| Classification | Blocked by another feature |

## 1. Goal

Let a signed-in user create, list, view, edit, update mileage for, and delete only their own vehicles.

## 2. Scope

In scope: manual year/make/model/mileage entry, optional VIN and purchase date, vehicle list/detail, edit, and confirmed deletion. Out of scope: VIN decoding and shared vehicle access.

## 3. User Stories

- As a driver, I want to add my car without needing technical details.
- As a driver, I want to correct vehicle information and mileage.
- As a driver, I want to remove a vehicle I no longer manage.

## 4. Functional Requirements

- A signed-in user MUST create a vehicle with year, make, model, and non-negative current mileage.
- VIN and purchase date MAY be omitted; a supplied VIN MUST have valid format.
- A user MUST list and view only vehicles they own.
- A user MUST update editable vehicle fields; current mileage MUST NOT decrease.
- Deleting a vehicle MUST require confirmation and remove its dependent maintenance data.
- The vehicle list MUST show a helpful empty state when no vehicles exist.

## 5. Acceptance Criteria

| ID | Given / When / Then |
| --- | --- |
| AC1 | Given valid required vehicle data, when a user saves it, then the vehicle appears in their list. |
| AC2 | Given a missing required field or decreasing mileage, when the user saves, then no update occurs and the relevant error is shown. |
| AC3 | Given vehicles owned by two users, when either user lists or requests a vehicle, then only their own vehicle data is available. |
| AC4 | Given a user edits a vehicle, when they save valid changes, then the detail and list show the persisted values. |
| AC5 | Given a user confirms deletion, when deletion succeeds, then the vehicle and its dependent records are unavailable. |

## 6. Data Requirements

Vehicle: id, owner/user id, year, make, model, optional trim, current mileage, optional VIN, optional purchase date, timestamps. VIN is unique when present. Vehicle owns maintenance tasks and maintenance logs; these are deleted with the vehicle.

## 7. API Requirements

| Operation | Access | Contract |
| --- | --- | --- |
| List vehicles | Authenticated | Return only current user's vehicles. |
| Create vehicle | Authenticated | Validate required vehicle fields; create vehicle. |
| Get/update/delete vehicle | Owner only | Read, change, or remove one owned vehicle; deny other users. |
| Update mileage | Owner only | Accept a value not less than stored mileage. |

## 8. UI and States

Provide vehicle-list, add/edit form, and vehicle-detail views. List normal state uses concise vehicle cards; empty state invites adding a first vehicle. Forms show validation and saving states. Detail has loading, not-found/forbidden, and deletion-confirmation states. All actions work on mobile and desktop.

## 9. Test Plan

| Test ID | Acceptance criteria | Test |
| --- | --- | --- |
| T1 | AC1 | Integration test creates a valid vehicle and lists it for its owner. |
| T2 | AC2 | Validation tests cover missing fields, invalid VIN, and decreasing mileage. |
| T3 | AC3 | Authorization test verifies cross-user list/detail access is denied. |
| T4 | AC4 | Integration test updates a vehicle and verifies persistence. |
| T5 | AC5 | Integration test confirms deletion cascades to dependent data. |

## 10. Risks, Open Questions, and Handoff Notes

Risk: making VIN required would add unnecessary onboarding friction; it remains optional. Open question: should year options have a defined range? Proposed answer: current year plus one, back to a reasonable historic limit chosen during implementation. Handoff: F4 creates starter tasks immediately after vehicle creation.

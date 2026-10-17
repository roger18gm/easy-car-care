# EasyCarCare: Product Specification

**Prepared for:** Full-Stack Web Application Proposal  
**Project status:** Proposed MVP  
**Team members:** TBD

## 1. Project Description

EasyCarCare is a responsive web application that helps everyday drivers stay on top of routine vehicle maintenance without needing automotive expertise. A user adds a vehicle, enters its current mileage, and receives a simple, personalized maintenance plan. They can see what needs attention, record completed service, update mileage, and receive reminders before work becomes overdue.

The problem EasyCarCare solves is maintenance uncertainty. Many drivers do not know which services matter, when they are due, or how to keep a usable record of prior work. Existing maintenance trackers often assume automotive knowledge or require too much manual setup. EasyCarCare presents only the next useful action in plain language, such as "An oil change is due in about 500 miles," rather than technical or alarming messaging.

### Product Goals

- Help non-technical drivers avoid missed routine maintenance.
- Make vehicle care feel manageable, calm, and understandable.
- Reduce manual scheduling through automatically generated maintenance tasks.
- Give users a clear, searchable history of work completed on each vehicle.

### Success Criteria

For the MVP, a user should be able to create an account, add a vehicle, see recommended maintenance, log a completed service, update mileage, and review their history from either a phone or desktop browser.

## 2. Target Users

### Primary Users

Everyday drivers who commute, run errands, or manage a household vehicle and who may not know common maintenance intervals. This includes first-time owners, busy parents, students, office workers, and older drivers.

### Secondary Users

- Families managing more than one vehicle.
- Parents keeping track of a teenager's vehicle.
- Budget-conscious drivers who want to prevent avoidable repairs.

### User Needs

- A quick answer to: "What does my car need next?"
- Reminders that are useful but not stressful.
- Minimal automotive terminology and minimal manual configuration.
- A reliable record of maintenance dates, mileage, notes, and optional cost.

## 3. MVP Scope

### Authentication and Profile Management

- Sign up, sign in, sign out, and password reset.
- Authenticated users can view and update their display name, email, and notification preference.
- Each user can access only their own vehicles, tasks, logs, and notifications.

### Vehicle Management (CRUD Model 1)

- Create a vehicle using year, make, model, current mileage, and optional VIN and purchase date.
- Read a list of the user's vehicles and each vehicle's details.
- Update vehicle details and current mileage.
- Delete a vehicle after a confirmation step; its dependent maintenance tasks and logs are removed with it.
- Validate VIN format when a VIN is supplied. VIN decoding is optional for the MVP and has a manual-entry fallback.

### Personalized Maintenance Plan (CRUD Model 2)

- Automatically generate starter maintenance tasks when a vehicle is created.
- Include oil change, tire rotation, tire-pressure check, air-filter replacement, brake inspection, battery check, and coolant inspection.
- Store mileage and/or time intervals for every task.
- Show each task's due date or due mileage, status, and plain-language explanation.
- Allow a user to create, edit, or delete a custom maintenance task for their vehicle.

### Maintenance Log (CRUD Model 3)

- Create a log by marking a task complete and entering completion date, mileage, optional cost, and notes.
- Read logs in a vehicle-specific timeline and on a task's detail view.
- Edit or delete an incorrectly entered maintenance log.
- When a log is created, recalculate the associated task's next due mileage and/or due date.

### Dashboard and Reminders

- Display the active vehicle, its current mileage, a simple health status, due-soon tasks, overdue tasks, and recent activity.
- Provide a vehicle switcher for users with multiple vehicles.
- Create in-app reminder notifications for tasks that are due soon or overdue.
- Let users mark in-app notifications as read.

### Responsive and Accessible UI

- Mobile-first layouts for screens from 320px wide through desktop.
- Keyboard-accessible forms, buttons, navigation, and modal dialogs.
- Clear labels, visible focus states, sufficient color contrast, and status text that is not conveyed by color alone.
- Plain English labels and reassuring status messages.

## 4. Additional Features

These features are planned after the MVP or implemented only if time allows.

- VIN decoding through the NHTSA vPIC API to prefill make, model, and year.
- Email reminders for due-soon tasks.
- Progressive Web App support, including installability and an offline read-only view of the most recently loaded dashboard and maintenance history.
- Recall lookup using NHTSA recall data.
- Receipt upload and service-data extraction.
- Cost summaries by vehicle and service type.
- Seasonal maintenance guidance.
- Nearby repair-shop search.

## 5. Advanced Feature Proposal

### Progressive Web App With Offline Support

EasyCarCare will support an installable, offline-ready experience. Users will be able to open their most recently synced dashboard and maintenance history without an internet connection. Actions that change data will clearly indicate when an internet connection is required.

This feature is valuable because users may need to check vehicle information in garages, parking areas, or locations with unreliable connectivity. It also gives the project a distinct technical challenge beyond standard CRUD behavior.

### Optional Advanced Feature: Role-Based Access Control

If instructor scope supports it, an administrator role will be added. Administrators can manage the shared maintenance-service templates used when new vehicles are created, while standard users can manage only their own vehicles and custom tasks. Authorization will be enforced in the API, not just hidden in the UI.

## 6. User Flows

### First-Time User

1. A visitor opens the landing page and selects **Create account**.
2. They register, verify required fields, and are signed in.
3. The onboarding flow asks for year, make, model, and current mileage; VIN and purchase date are optional.
4. The system creates the vehicle and starter maintenance tasks.
5. The user lands on the dashboard and sees the most relevant next action.

### Logging Maintenance

1. A signed-in user opens a due or upcoming task from the dashboard or vehicle page.
2. They select **Log completion**.
3. They enter completion date and mileage, with optional cost and notes.
4. The system creates the maintenance log and recalculates the task's next due point.
5. The dashboard updates to reflect the completed work.

### Updating Mileage

1. A signed-in user opens a vehicle.
2. They select **Update mileage** and enter a value that is equal to or greater than the prior value.
3. The system updates task due statuses and shows any newly due maintenance.

## 7. Application Views

| View | Purpose | Key content and actions |
| --- | --- | --- |
| Landing / authentication | Explain the product and let users register or sign in. | Sign up, sign in, password reset. |
| Dashboard | Present the single most important maintenance information. | Vehicle switcher, health status, due-soon list, overdue list, recent activity. |
| Vehicle list | Manage all vehicles owned by the signed-in user. | Add vehicle, select vehicle, delete vehicle. |
| Add / edit vehicle | Collect vehicle details with minimal friction. | Year, make, model, mileage, optional VIN and purchase date. |
| Vehicle detail | Show the selected vehicle and its maintenance plan. | Update mileage, edit vehicle, create custom task, open a task. |
| Maintenance task detail | Explain one task and its schedule. | Edit task, log completion, view related logs. |
| Maintenance history | Show completed work in chronological order. | Filter by vehicle or service type, edit or delete log. |
| Notifications | Show reminders and alerts. | Mark one or all notifications as read. |
| Profile and settings | Manage account information and preferences. | Update profile and reminder preference. |

## 8. Low-Fidelity Wireframes

### Desktop Dashboard

```text
+--------------------------------------------------------------------------------+
| EasyCarCare     My vehicles [Civic v]              Notifications (2)  Profile |
+----------------------+---------------------------------------------------------+
| 2018 Honda Civic     | Good shape                                      88 / 100 |
| 54,200 miles         | Your next steps                                         |
| [Update mileage]     | +---------------------------------------------------+ |
|                      | | Oil change                         Due in 500 mi | |
|                      | | [View task]                                        | |
|                      | +---------------------------------------------------+ |
|                      | +---------------------------------------------------+ |
|                      | | Tire rotation                    Due next month | |
|                      | | [View task]                                        | |
|                      | +---------------------------------------------------+ |
|                      | Recent activity                                         |
|                      | Oil change logged - Feb 10 - 53,700 miles              |
+----------------------+---------------------------------------------------------+
```

### Mobile Dashboard

```text
+--------------------------------+
| EasyCarCare            (bell)  |
| 2018 Honda Civic          [v]  |
| 54,200 miles                    |
| [ Update mileage ]              |
|                                |
| Good shape                 88   |
|                                |
| NEXT UP                        |
| Oil change                      |
| Due in about 500 miles          |
| [ View task ]                   |
|                                |
| Tire rotation                   |
| Due next month                  |
| [ View task ]                   |
|                                |
| Dashboard  Vehicles  History    |
+--------------------------------+
```

### Log Maintenance

```text
+--------------------------------+
| < Back     Log oil change       |
|                                |
| Completed date                  |
| [ 2026-09-24                 ]  |
| Mileage                         |
| [ 54,200                     ]  |
| Cost (optional)                 |
| [ 54.99                      ]  |
| Notes (optional)                |
| [___________________________]  |
|                                |
| [ Save maintenance record ]     |
+--------------------------------+
```

## 9. Maintenance-Scheduling Rules

Starter service templates define default mileage and month intervals. When a vehicle is created, the backend creates a maintenance task for each template. A task is considered:

- **Upcoming** when its due mileage/date is within the configured reminder threshold.
- **Due** when the current mileage is at or beyond its due mileage, or the current date is at or past its due date.
- **Completed / rescheduled** after a maintenance log is recorded; the next due mileage/date is calculated from the completed mileage/date and the task's intervals.

The initial intervals are general estimates and will be shown as guidance. Future VIN/manufacturer integrations can replace them with vehicle-specific recommendations.

## 10. Initial Data Models

### Entity Relationships

```text
User 1 ---- * Vehicle 1 ---- * MaintenanceTask 1 ---- * MaintenanceLog
  |               |
  |               +---- * MaintenanceLog
  |
  +---- * Notification

ServiceTemplate 1 ---- * MaintenanceTask
```

### Users

| Field | Type | Notes |
| --- | --- | --- |
| id | UUID / integer | Primary key. |
| name | string | Required display name. |
| email | string | Required, unique, normalized. |
| password_digest | string | Authentication-library managed; never returned by the API. |
| role | enum | `user` by default; optional `admin` for RBAC. |
| reminder_preference | enum | `in_app` initially; email can be added later. |
| created_at, updated_at | datetime | Audit timestamps. |

### Vehicles

| Field | Type | Notes |
| --- | --- | --- |
| id | UUID / integer | Primary key. |
| user_id | foreign key | Required owner reference. |
| vin | string | Optional, unique when present, 17-character validation. |
| year | integer | Required; valid production-year range. |
| make | string | Required. |
| model | string | Required. |
| trim | string | Optional. |
| current_mileage | integer | Required; non-negative and cannot decrease. |
| purchase_date | date | Optional. |
| created_at, updated_at | datetime | Audit timestamps. |

### ServiceTemplates

Shared, administrator-managed definitions used to seed new maintenance tasks.

| Field | Type | Notes |
| --- | --- | --- |
| id | UUID / integer | Primary key. |
| name | string | Example: `Oil change`. |
| description | text | Plain-language explanation. |
| default_interval_miles | integer | Optional mileage interval. |
| default_interval_months | integer | Optional time interval. |
| active | boolean | Determines whether the template is used for new vehicles. |

### MaintenanceTasks

| Field | Type | Notes |
| --- | --- | --- |
| id | UUID / integer | Primary key. |
| vehicle_id | foreign key | Required vehicle reference. |
| service_template_id | foreign key | Optional for user-created custom tasks. |
| name | string | Required task name. |
| description | text | Plain-language guidance. |
| interval_miles | integer | Optional, positive when present. |
| interval_months | integer | Optional, positive when present. |
| next_due_mileage | integer | Optional calculated target. |
| next_due_date | date | Optional calculated target. |
| status | enum | `upcoming`, `due`, or `overdue`. |
| is_custom | boolean | Distinguishes user-created tasks from generated tasks. |
| created_at, updated_at | datetime | Audit timestamps. |

### MaintenanceLogs

| Field | Type | Notes |
| --- | --- | --- |
| id | UUID / integer | Primary key. |
| vehicle_id | foreign key | Required vehicle reference. |
| maintenance_task_id | foreign key | Required task reference. |
| completed_date | date | Required; cannot be in the future. |
| completed_mileage | integer | Required; non-negative. |
| cost_cents | integer | Optional; stored in cents to avoid floating-point currency errors. |
| notes | text | Optional user notes. |
| created_at, updated_at | datetime | Audit timestamps. |

### Notifications

| Field | Type | Notes |
| --- | --- | --- |
| id | UUID / integer | Primary key. |
| user_id | foreign key | Required recipient reference. |
| vehicle_id | foreign key | Required related vehicle. |
| maintenance_task_id | foreign key | Optional related task. |
| kind | enum | `due_soon`, `overdue`, or `seasonal`. |
| message | string | Plain-language reminder text. |
| read_at | datetime | Null until read. |
| created_at | datetime | Creation timestamp. |

## 11. Required API Endpoints

The implementation stack and API style will be selected during the bakeoff unit. The endpoint list below defines the required application capabilities and resource boundaries; exact URL conventions, request formats, and error responses will be determined after the stack is selected. Endpoints handling personal data require an authenticated user, and users can access only their own vehicles, tasks, logs, and notifications.

### Authentication and Profile

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/auth/sign_up` | No | Register a user. |
| POST | `/auth/sign_in` | No | Start an authenticated session. |
| DELETE | `/auth/sign_out` | Yes | End the current session. |
| POST | `/auth/password_reset` | No | Request a password reset. |
| GET | `/me` | Yes | Return the current profile. |
| PATCH | `/me` | Yes | Update name, email, or reminder preference. |

### Vehicles

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/vehicles` | Yes | List the current user's vehicles. |
| POST | `/vehicles` | Yes | Create a vehicle and starter tasks. |
| GET | `/vehicles/:vehicle_id` | Yes | Return one vehicle and summary data. |
| PATCH | `/vehicles/:vehicle_id` | Yes | Update vehicle details. |
| DELETE | `/vehicles/:vehicle_id` | Yes | Delete a vehicle and dependent data. |
| PATCH | `/vehicles/:vehicle_id/mileage` | Yes | Update current mileage and task statuses. |
| GET | `/vehicles/:vehicle_id/dashboard` | Yes | Return dashboard data for one vehicle. |

### Maintenance Tasks and Logs

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/vehicles/:vehicle_id/maintenance_tasks` | Yes | List a vehicle's tasks; supports status filtering. |
| POST | `/vehicles/:vehicle_id/maintenance_tasks` | Yes | Create a custom task. |
| GET | `/maintenance_tasks/:task_id` | Yes | Return task details and related logs. |
| PATCH | `/maintenance_tasks/:task_id` | Yes | Update a task's details or intervals. |
| DELETE | `/maintenance_tasks/:task_id` | Yes | Delete a custom task. |
| POST | `/maintenance_tasks/:task_id/logs` | Yes | Create a completion log and recalculate next due values. |
| GET | `/vehicles/:vehicle_id/maintenance_logs` | Yes | List vehicle maintenance history. |
| GET | `/maintenance_logs/:log_id` | Yes | Return one log. |
| PATCH | `/maintenance_logs/:log_id` | Yes | Correct a log and recalculate its task. |
| DELETE | `/maintenance_logs/:log_id` | Yes | Delete a log and recalculate its task. |

### Notifications and Optional Admin Endpoints

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/notifications` | Yes | List current user's notifications. |
| PATCH | `/notifications/:notification_id/read` | Yes | Mark one notification as read. |
| PATCH | `/notifications/read_all` | Yes | Mark all notifications as read. |
| GET | `/admin/service_templates` | Admin | List service templates. |
| POST | `/admin/service_templates` | Admin | Create a service template. |
| PATCH | `/admin/service_templates/:template_id` | Admin | Update a service template. |
| DELETE | `/admin/service_templates/:template_id` | Admin | Deactivate or delete a service template. |

### External API Integration

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/vehicle_lookup?vin=:vin` | Yes | Validate a VIN and return decoded vehicle details from NHTSA, with clear handling when no match is found. |

## 12. README Plan

The project repository README will include:

- Project description and the user problem EasyCarCare solves.
- Team members and their roles.
- Setup and installation instructions after the project stack is selected.
- API documentation after endpoint conventions are finalized.
- Known issues and a prioritized future-improvements list.

## 13. Risks and Scope Controls

| Risk | Mitigation |
| --- | --- |
| Maintenance advice is not specific to every vehicle. | Label starter intervals as general guidance and defer manufacturer-specific schedules to a future integration. |
| Scope expands into diagnostics, repair marketplaces, and receipt AI. | Keep these out of the MVP; prioritize auth, vehicle/task/log CRUD, and a reliable dashboard. |
| Reminder volume becomes annoying. | Start with in-app reminders and one reminder threshold per task. |
| External VIN data is unavailable or incomplete. | Keep manual entry fully functional and treat decoding as an enhancement. |
| Offline writes cause inconsistent data. | Cache read-only data first and clearly block offline write actions in the PWA MVP. |

## 14. Future Improvements

- Vehicle-specific maintenance schedules based on VIN or manufacturer data.
- Email and push notifications with user-controlled frequency.
- Recall alerts and safety guidance.
- Receipt scanning and automatic maintenance-log creation.
- Household sharing with consent-based access controls.
- Spending trends and cost forecasts.
- Spanish-language interface and broader localization.

## Elevator Pitch

EasyCarCare is a calm, beginner-friendly vehicle maintenance assistant. It tells everyday drivers what their car needs next, keeps a clear record of completed service, and makes routine maintenance easier to remember without requiring car knowledge.

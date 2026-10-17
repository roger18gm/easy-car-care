# EasyCarCare MVP Feature Plans

This directory contains the implementation-planning set for EasyCarCare's approved MVP. These plans define behavior and contracts only.

## MVP Feature Inventory

1. **F1 Authentication Basics** - Register, sign in, sign out, password-reset request, and protected access. **Infrastructure/supporting.**
2. **F2 Profile and Notification Preferences** - View and update a signed-in user's name, email, and reminder preference. **Blocked by F1.**
3. **F3 Vehicle Management** - Create, view, edit, list, and delete a user's vehicles. **Blocked by F1.**
4. **F4 Starter Maintenance Plan** - Generate and show the standard maintenance tasks for a newly created vehicle. **Blocked by F3.**
5. **F5 Custom Maintenance Tasks** - Create, view, edit, and delete user-defined tasks for a vehicle. **Blocked by F3.**
6. **F6 Mileage Updates and Due Status** - Update mileage and calculate upcoming, due, and overdue task statuses. **Blocked by F3 and F4.**
7. **F7 Maintenance Logging** - Record, edit, view, and delete completed maintenance and reschedule the related task. **Blocked by F4 and F6.**
8. **F8 Dashboard and Vehicle Switching** - Present the current vehicle's maintenance summary, next actions, and recent activity. **Blocked by F3, F4, F6, and F7.**
9. **F9 In-App Maintenance Notifications** - Create and manage due-soon and overdue notifications. **Blocked by F4 and F6.**
10. **F10 Offline-Ready Read Experience** - Make the latest dashboard and history available without connectivity, while clearly preventing unavailable write actions. **Blocked by F8 and F7.**

## Recommended Implementation Sequence

| Order | Feature ID                         | Depends on     | Why this order                                                                             |
| ----- | ---------------------------------- | -------------- | ------------------------------------------------------------------------------------------ |
| 1     | F1-authentication-basics           | none           | Establishes identity and protected access for all personal data.                           |
| 2     | F3-vehicle-management              | F1             | Creates the first authenticated CRUD flow and the core resource every later feature needs. |
| 3     | F4-starter-maintenance-plan        | F3             | Gives each vehicle meaningful maintenance data.                                            |
| 4     | F6-mileage-and-due-status          | F3, F4         | Makes maintenance data useful by calculating priority.                                     |
| 5     | F7-maintenance-logging             | F4, F6         | Completes the routine service workflow and supplies history.                               |
| 6     | F8-dashboard-and-vehicle-switching | F3, F4, F6, F7 | Combines the established data into the primary user experience.                            |
| 7     | F9-in-app-notifications            | F4, F6         | Reuses stable due-status rules to create reminders.                                        |
| 8     | F2-profile-and-preferences         | F1             | Adds account management without blocking the core vehicle workflow.                        |
| 9     | F5-custom-maintenance-tasks        | F3             | Extends a stable vehicle workflow with optional personalization.                           |
| 10    | F10-offline-read-experience        | F7, F8         | Applies offline behavior only after dashboard and history contracts are stable.            |

## Dependency Map

```text
F1 --> F2
F1 --> F3 --> F4 --> F6 --> F7 --> F8 --> F10
             |       |       |
             |       |       +--> F9
             |       +--> F5
             +--> F5
```

## First Feature to Implement

Start with **F1 Authentication Basics**. It establishes the user identity and authorization boundaries needed to keep vehicles, service history, and reminders private. Completing it first lets the team verify protected-route behavior before adding personal data models.

## Cross-Feature Risks

- The maintenance interval rules may be too broad or unclear. Agree on a small seeded task list and general guidance language before building due-status logic.
- Ownership checks are required across vehicles, tasks, logs, and notifications. Missing one authorization boundary could expose another user's data.
- Mileage changes and maintenance-log edits both affect due dates and due mileage. Centralize the status rules during implementation to avoid conflicting calculations.
- Offline caching can show stale information. Limit its initial scope to read-only, last-synced data and visibly indicate when data is not current.

## Reflection

The hardest feature to make testable was the starter maintenance plan because a phrase like "personalized recommendations" is pretty vague to verify. The plan narrows it to a fixed set of seeded tasks with explicit intervals, due values, and plain-language guidance. AI repeatedly tried to add VIN decoding, email delivery, cost analytics, and mechanic search to the MVP, so those features were kept out of the plan set. The dependency that changed the order most was mileage status: the dashboard and notifications cannot be trusted until due-status rules are stable. Planning also exposed that editing or deleting a maintenance log must recalculate the associated task, not merely change the history display. Ownership checks became a cross-feature risk because every resource is personal to a user. Finally, offline support is deliberately last because it depends on stable dashboard and history data rather than defining their behavior.

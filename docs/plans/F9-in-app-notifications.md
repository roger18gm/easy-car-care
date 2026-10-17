# F9: In-App Maintenance Notifications

| Metadata | Value |
| --- | --- |
| ID / name | F9 / In-App Maintenance Notifications |
| Severity | Medium |
| Status | Drafted and reviewed |
| Effort | 0.75 week |
| Dependencies | F4 Starter Maintenance Plan; F6 Mileage Updates and Due Status |
| Classification | Blocked by another feature |

## 1. Goal

Give users a private in-app reminder list for maintenance tasks that are due soon or overdue.

## 2. Scope

In scope: creation of due-soon/overdue notifications, notification list, unread state, mark-one-read, mark-all-read, task link, and respect for preference. Out of scope: email, push, SMS, scheduled delivery, and seasonal alerts.

## 3. User Stories

- As a driver, I want to notice a task needing attention when I return to the app.
- As a driver, I want to dismiss reminders I have already seen.

## 4. Functional Requirements

- The system MUST create at most one unread notification per vehicle/task/status transition.
- A notification MUST identify its task, vehicle, kind (`due_soon` or `overdue`), readable message, created time, and optional read time.
- Notifications MUST be created only for users whose reminder preference is `in_app`.
- A user MUST list and mark read only their own notifications.
- Marking a notification read MUST preserve it in history.
- The notification view MUST show an empty state when no notifications exist.

## 5. Acceptance Criteria

| ID | Given / When / Then |
| --- | --- |
| AC1 | Given an owned task transitions to due soon, when notifications are evaluated, then one unread due-soon notification is created for the owner. |
| AC2 | Given the same task/status is evaluated again, when it has an unread notification, then no duplicate is created. |
| AC3 | Given a user preference is off, when their task becomes due soon or overdue, then no new notification is created. |
| AC4 | Given an unread notification, when its owner marks it read, then it remains listed with a read time. |
| AC5 | Given notifications belong to two users, when either user lists or updates a notification, then only their own records are available. |

## 6. Data Requirements

Notification: id, user id, vehicle id, optional task id, kind, message, created time, read time. A uniqueness rule covers task id + kind + unread/active notification to avoid duplicates. User reminder preference comes from F2 when available; default is `in_app` for users created before F2 UI exists.

## 7. API Requirements

| Operation | Access | Contract |
| --- | --- | --- |
| Evaluate/create notification | System on owned task status transition | Create deduplicated notification only if user preference permits. |
| List notifications | Authenticated | Return current user's notifications, unread first. |
| Mark one/all read | Notification owner | Set read time only for current user's notification(s). |
| Get linked task | Task owner | Follow task link only with ownership authorization. |

## 8. UI and States

Notifications view and header indicator show unread count. Each item includes plain-language message, time, vehicle name, unread/read state, and task link. Loading has placeholders; empty state says there are no current reminders; error state offers retry. Marking read uses an immediate pending state and restores the unread state if the request fails.

## 9. Test Plan

| Test ID | Acceptance criteria | Test |
| --- | --- | --- |
| T1 | AC1 | Integration test due-status transition creates expected notification. |
| T2 | AC2 | Idempotency test evaluates same transition twice and asserts one notification. |
| T3 | AC3 | Integration test with preference off asserts no notification. |
| T4 | AC4 | Integration/UI test marks notification read and retains it in list. |
| T5 | AC5 | Authorization test rejects cross-user listing and mutation. |

## 10. Risks, Open Questions, and Handoff Notes

Risk: repeated status calculations can spam users if deduplication is incomplete. Open question: should a task notify again after it is logged and later becomes due? Proposed answer: yes, a new lifecycle after completion may create a new notification. Handoff: F2 supplies preference UI; no email/push work is required here.

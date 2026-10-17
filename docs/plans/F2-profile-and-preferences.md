# F2: Profile and Notification Preferences

| Metadata | Value |
| --- | --- |
| ID / name | F2 / Profile and Notification Preferences |
| Severity | Medium |
| Status | Drafted and reviewed |
| Effort | 0.5 week |
| Dependencies | F1 Authentication Basics |
| Classification | Blocked by another feature |

## 1. Goal

Allow a signed-in user to view and safely update their profile and in-app reminder preference.

## 2. Scope

In scope: display name, email, and reminder preference (`in_app` or `off`). Out of scope: password changes, account deletion, notification delivery channels, and household sharing.

## 3. User Stories

- As a user, I want to change my displayed name or email.
- As a user, I want to turn in-app reminders on or off.

## 4. Functional Requirements

- The profile view MUST show only the authenticated user's data.
- The user MUST be able to update name, email, and reminder preference.
- Email updates MUST preserve uniqueness and format validation.
- The save action MUST show a success confirmation only after the update persists.
- A user MUST NOT be able to update another user's profile through the UI or API.

## 5. Acceptance Criteria

| ID | Given / When / Then |
| --- | --- |
| AC1 | Given a signed-in user, when they open Profile, then their current name, email, and preference are displayed. |
| AC2 | Given valid changed profile values, when the user saves, then the new values persist after refresh. |
| AC3 | Given an email used by another account, when the user saves it, then the update is rejected with an email error. |
| AC4 | Given a user selects `off`, when they save, then new in-app notifications are not created for that user. |

## 6. Data Requirements

Uses the User model from F1: `name`, unique `email`, and `reminder_preference`. Only the current user may update these fields. No new model is required.

## 7. API Requirements

| Operation | Access | Contract |
| --- | --- | --- |
| Get current profile | Authenticated | Return current user's safe profile fields. |
| Update current profile | Authenticated | Accept name, email, and reminder preference; return updated safe fields or validation errors. |

## 8. UI and States

Profile has one editable form with a toggle or segmented control for reminder preference. Show populated form fields as the normal state, a saving state that prevents duplicate submit, inline validation errors, and a general retry state for failed requests. No empty state is needed because an authenticated user always has a profile.

## 9. Test Plan

| Test ID | Acceptance criteria | Test |
| --- | --- | --- |
| T1 | AC1 | Route/API test returns only current user profile. |
| T2 | AC2 | Integration test updates profile and reads persisted result. |
| T3 | AC3 | Validation test rejects duplicate email without changing stored email. |
| T4 | AC4 | Notification-creation test confirms `off` suppresses new reminders. |

## 10. Risks, Open Questions, and Handoff Notes

Risk: email change may require re-verification under the selected auth solution. Open question: should disabling reminders retain existing unread notifications? Proposed answer: yes, preserve history but suppress new notifications. Handoff: F9 reads this preference before creating a notification.

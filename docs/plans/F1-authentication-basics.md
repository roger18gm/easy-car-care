# F1: Authentication Basics

| Metadata | Value |
| --- | --- |
| ID / name | F1 / Authentication Basics |
| Severity | Critical |
| Status | Drafted and reviewed |
| Effort | 1 week |
| Dependencies | None |
| Classification | Infrastructure/supporting |

## 1. Goal

Enable a visitor to create an account, sign in, sign out, request a password reset, and reach protected app views only as an authenticated user.

## 2. Scope

In scope: registration, sign-in/out, password-reset request, session persistence, protected-route behavior, and accessible form feedback. Out of scope: social login, multi-factor authentication, email-template design, and administrator accounts.

## 3. User Stories

- As a new driver, I want to create an account so my vehicle data is private.
- As a returning driver, I want to sign in and remain signed in during normal navigation.
- As a signed-in driver, I want to sign out on a shared device.

## 4. Functional Requirements

- The application MUST require name, email, and password for registration.
- The application MUST reject duplicate or malformed email addresses and weak/missing passwords with field-level feedback.
- The application MUST create an authenticated session only after valid registration or sign-in credentials.
- Protected views MUST redirect an unauthenticated visitor to sign in and preserve the intended destination when practical.
- Sign-out MUST end the current session and remove access to protected views.
- Password-reset requests MUST provide a neutral confirmation message whether or not an email exists.

## 5. Acceptance Criteria

| ID | Given / When / Then |
| --- | --- |
| AC1 | Given a visitor supplies valid registration fields, when they submit registration, then an account and authenticated session are created and they enter the app. |
| AC2 | Given a visitor supplies an email already in use, when they submit registration, then no account is created and the email field explains the problem. |
| AC3 | Given a registered user supplies valid credentials, when they sign in, then they reach the intended protected view. |
| AC4 | Given an unauthenticated visitor requests a protected view, when the route loads, then they are sent to sign in and cannot read protected data. |
| AC5 | Given a signed-in user, when they sign out, then protected views require sign-in again. |
| AC6 | Given any email address, when a visitor requests a password reset, then the application shows the same confirmation message without revealing account existence. |

## 6. Data Requirements

User fields: unique normalized email, display name, authentication credential representation, created timestamp, and updated timestamp. Credentials MUST never be returned to the client. A session is associated with one authenticated user and expires according to the final stack's security policy.

## 7. API Requirements

| Operation | Access | Contract |
| --- | --- | --- |
| Register | Public | Accept name, email, password; return authenticated user summary or validation errors. |
| Sign in | Public | Accept email and password; establish session or return a generic invalid-credentials error. |
| Sign out | Authenticated | End current session. |
| Current user | Authenticated | Return id, name, email, role, and reminder preference only. |
| Password reset request | Public | Accept email and return neutral success response. |

## 8. UI and States

Provide separate sign-up, sign-in, and password-reset views with labels, keyboard navigation, visible focus, and inline validation. Loading disables duplicate submission. Empty state is not applicable. Error states distinguish validation errors from a general retry message without exposing sensitive account details. Signed-in navigation shows a sign-out control.

## 9. Test Plan

| Test ID | Acceptance criteria | Test |
| --- | --- | --- |
| T1 | AC1 | Integration test valid registration creates user and authenticated session. |
| T2 | AC2 | Integration/UI test duplicate email produces field error and no duplicate record. |
| T3 | AC3 | Integration test valid sign-in redirects to saved protected route. |
| T4 | AC4 | Route/API authorization test rejects unauthenticated protected access. |
| T5 | AC5 | Integration test sign-out invalidates current session. |
| T6 | AC6 | Integration test compares reset responses for existing and unknown emails. |

## 10. Risks, Open Questions, and Handoff Notes

Risk: the final stack's authentication mechanism may change session details. Open question: what password policy and reset-delivery provider will the class approve? The plan remains valid because UI and API contracts do not expose those choices. Handoff: F2 and every vehicle-scoped feature depend on reliable current-user identity.

# Authentication QA Checklist

**User Story:** Authentication QA
**Sprint:** Authentication & Role-Based (Ade Dabed)
**Member:** Kunal Arya
**Period:** 01-Aug-2026 → 10-Aug-2026
**Status:** In Review

---

## Scope

Test all authentication flows: registration, login, email verification, password reset, role-based access, and session management.

---

## 1. Registration

| ID | Test Case | Steps | Expected Result | Status |
|----|-----------|-------|-----------------|--------|
| R-01 | Register as Student | Fill form with valid data, select STUDENT role, submit | Account created, redirected to verify-email-sent page | [x] |
| R-02 | Register as Teacher | Fill form with valid data, select TEACHER role, submit | Account created, redirected to verify-email-sent page | ☐ |
| R-03 | Duplicate email | Register with an already-used email | Error: "An account with this email already exists" | [x] |
| R-04 | Weak password | Enter password without uppercase/number/special char | Inline validation errors shown before submit | ☐ |
| R-05 | Password mismatch | Enter different values in password & confirm fields | Error: "Passwords do not match" | [x] |
| R-06 | Short first/last name | Enter 1-character names | Validation error: "must be at least 2 characters" | ☐ |
| R-07 | Invalid email format | Enter "notanemail" in email field | Validation error: "Please enter a valid email" | ☐ |

---

## 2. Email Verification

| ID | Test Case | Steps | Expected Result | Status |
|----|-----------|-------|-----------------|--------|
| V-01 | Valid token | Click link in verification email | "Email verified successfully", redirected to login | ☐ |
| V-02 | Expired token | Use a token older than 24 hours | Error shown; user prompted to request new link | ☐ |
| V-03 | Invalid token | Manually tamper with the token in URL | Error shown | ☐ |
| V-04 | Login before verification | Attempt login with unverified email | Error: account not verified or appropriate message | ☐ |

---

## 3. Login

| ID | Test Case | Steps | Expected Result | Status |
|----|-----------|-------|-----------------|--------|
| L-01 | Valid Student login | Enter valid student credentials | Redirected to `/student` dashboard | [x] |
| L-02 | Valid Admin login | Enter valid admin credentials | Redirected to `/admin` dashboard | ☐ |
| L-03 | Valid Teacher login | Enter valid teacher credentials | Redirected to `/teacher` dashboard | ☐ |
| L-04 | Wrong password | Enter correct email, wrong password | Error: invalid credentials | [x] |
| L-05 | Non-existent email | Enter email not in system | Error: invalid credentials (no enumeration) | ☐ |
| L-06 | Empty fields | Submit login with blank fields | Validation errors shown | ☐ |
| L-07 | Already logged in | Navigate to `/auth/login` while authenticated | Redirected to role dashboard (no re-login) | ☐ |

---

## 4. Forgot / Reset Password

| ID | Test Case | Steps | Expected Result | Status |
|----|-----------|-------|-----------------|--------|
| FP-01 | Valid email | Submit forgot-password with registered email | "If an account exists..." message shown (no enumeration) | ☐ |
| FP-02 | Unknown email | Submit forgot-password with unknown email | Same generic success message (security: no user enumeration) | ☐ |
| RP-01 | Valid reset token | Use link from email, enter new valid password | Password updated, redirected to login | ☐ |
| RP-02 | Expired reset token | Use token older than 30 minutes | Error shown | ☐ |
| RP-03 | Password same as old | Enter same password as current | Should either warn or accept per business rule — document result | ☐ |

---

## 5. Role-Based Access Control

| ID | Test Case | Steps | Expected Result | Status |
|----|-----------|-------|-----------------|--------|
| AC-01 | Student accessing `/admin` | Login as student, navigate to `/admin` | Redirected away (403 or redirect to `/student`) | ☐ |
| AC-02 | Teacher accessing `/admin` | Login as teacher, navigate to `/admin` | Redirected away | ☐ |
| AC-03 | Unauthenticated `/student` | Visit `/student/dashboard` while logged out | Redirected to `/auth/login` | ☐ |
| AC-04 | Unauthenticated `/admin` | Visit `/admin` while logged out | Redirected to `/auth/login` | ☐ |
| AC-05 | `/dashboard` redirect | Visit `/dashboard` as student | Redirected to `/student` | ☐ |
| AC-06 | `/dashboard` redirect | Visit `/dashboard` as admin | Redirected to `/admin` | ☐ |

---

## 6. Session / Token Management

| ID | Test Case | Steps | Expected Result | Status |
|----|-----------|-------|-----------------|--------|
| S-01 | Logout | Click logout | Tokens cleared, redirected to `/auth/login` | ☐ |
| S-02 | Token refresh | Let access token expire; perform an action | App transparently refreshes token and continues | ☐ |
| S-03 | Invalid refresh token | Use a revoked/tampered refresh token | Session ends, redirected to login | ☐ |

---

## Notes / Issues Found

| Issue # | Description | File / Area | Severity | Resolution |
|---------|-------------|-------------|----------|------------|
| | | | | |

---

*Checklist prepared by: Kunal Arya — 2026-08-01*

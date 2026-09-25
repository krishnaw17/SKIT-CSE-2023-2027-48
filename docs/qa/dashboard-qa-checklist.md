# Dashboard QA Checklist

**User Story:** Dashboard QA
**Sprint:** Authentication & Role-Based (Ade Dabed)
**Member:** Kunal Arya
**Period:** 11-Aug-2026 → 22-Aug-2026
**Status:** In Review

---

## Scope

Test Admin dashboard (KPI cards, system health, charts, recent activity) and Student dashboard (XP progress bar, badges, performance chart, recent courses, quick actions).

---

## 1. Admin Dashboard (`/admin`)

### 1.1 KPI Cards

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| AD-01 | Total Students card renders | Shows numeric count from API; number formatted with locale separator | ☐ |
| AD-02 | Total Teachers card renders | Shows numeric count | ☐ |
| AD-03 | Active Courses card renders | Shows numeric count | ☐ |
| AD-04 | System health badge | "Systems Operational" badge visible with green pulsing dot | ☐ |
| AD-05 | Cards with zero data | If API returns 0, cards show "0" not blank | ☐ |
| AD-06 | Loading state | `PageLoader` shown while API call is in flight | ☐ |

### 1.2 Performance Chart

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| AD-07 | Chart renders with data | `PerformanceChart` component visible with axes and data points | ☐ |
| AD-08 | Chart with empty data | No crash; graceful empty state shown | ☐ |

### 1.3 Navigation & Header

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| AD-09 | `DashboardHeader` present | Header renders with user name and logout option | ☐ |
| AD-10 | Welcome message | Shows "Welcome back, {firstName}" with correct name | ☐ |
| AD-11 | Sidebar/nav links | All admin nav links (`/admin/users`, `/admin/classes`, etc.) navigate correctly | ☐ |

### 1.4 Stub Pages (Admin)

| ID | Page | Expected Result | Status |
|----|------|-----------------|--------|
| AD-12 | `/admin/users` | Renders without crash (stub page) | ☐ |
| AD-13 | `/admin/classes` | Renders without crash | ☐ |
| AD-14 | `/admin/subjects` | Renders without crash | ☐ |
| AD-15 | `/admin/badges` | Renders without crash | ☐ |
| AD-16 | `/admin/settings` | Renders without crash | ☐ |
| AD-17 | `/admin/audit-logs` | Renders without crash | ☐ |
| AD-18 | `/admin/reports` | Renders without crash | ☐ |

---

## 2. Student Dashboard (`/student`)

### 2.1 XP Progress Bar

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| SD-01 | XP bar renders | `XPProgressBar` visible with current XP, level, and progress fill | ☐ |
| SD-02 | XP at level boundary | At exactly level-up threshold — no crash, bar shows full/reset correctly | ☐ |
| SD-03 | Zero XP state | New student with 0 XP — bar shows 0% with level 1 | ☐ |

### 2.2 Badge Display

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| SD-04 | Badges render | `BadgeDisplay` shows earned badges with icons and names | ☐ |
| SD-05 | No badges state | Empty badge array — shows "no badges yet" or graceful empty state | ☐ |

### 2.3 Performance Chart

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| SD-06 | Chart renders | "XP Earned (Last 5 Days)" chart visible with data | ☐ |
| SD-07 | Empty chart data | No crash; blank/empty chart shown | ☐ |

### 2.4 Recent Courses

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| SD-08 | Enrolled courses shown | Up to 3 most recent enrolled courses listed | ☐ |
| SD-09 | No enrolled courses | Empty state — no crash, appropriate message | ☐ |
| SD-10 | Course card click | Navigates to correct course viewer URL | ☐ |

### 2.5 Quick Actions

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| SD-11 | "Courses" quick link | Navigates to `/student/courses` | ☐ |
| SD-12 | "Quizzes" quick link | Navigates to `/student/quizzes` | ☐ |
| SD-13 | "Assignments" quick link | Navigates to `/student/assignments` | ☐ |
| SD-14 | "Leaderboard" quick link | Navigates to `/student/leaderboard` | ☐ |

### 2.6 Loading & Error States

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| SD-15 | Loading state | `PageLoader` shown while both progress and course queries load | ☐ |
| SD-16 | API error | If progress API fails — no white screen; error handled gracefully | ☐ |

---

## Notes / Issues Found

| Issue # | Description | File / Area | Severity | Resolution |
|---------|-------------|-------------|----------|------------|
| | | | | |

---

*Checklist prepared by: Kunal Arya — 2026-08-11*

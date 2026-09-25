# Content QA Checklist & Testing Strategy

**User Story:** Content QA
**Sprint:** Authentication & Role-Based (Ade Dabed)
**Member:** Kunal Arya
**Period:** 23-Aug-2026 → 12-Sep-2026
**Status:** In Review

---

## Testing Strategy

### Objectives
1. Verify course browsing, enrollment, and unenrollment flows work end-to-end.
2. Verify lesson content renders correctly (video, text, attachments).
3. Confirm role-specific access — students see enrolled content only; teachers see authoring views.
4. Identify and document any rendering issues, broken API calls, or UX defects.

### Approach
- **Manual testing** of each flow via browser (Chrome).
- Test with: 1 student account (enrolled in ≥1 course), 1 student account (no enrollments), 1 teacher account.
- Record all bugs in `content-review-log.md`.

### Test Environment
- Frontend: `http://localhost:5173` (`pnpm dev` in `apps/web`)
- Backend: `http://localhost:3000` (`pnpm dev` in `apps/server`)
- DB: local Prisma / PostgreSQL instance

---

## 1. Course Browser (`/courses`)

| ID | Test Case | Steps | Expected Result | Status |
|----|-----------|-------|-----------------|--------|
| CB-01 | Page loads | Navigate to `/courses` as a student | Course list renders; no loader stuck | ☐ |
| CB-02 | Enrolled badge | Courses already enrolled in show "Enrolled" indicator | Correct badge/label visible | ☐ |
| CB-03 | Search / filter | Use search input or category filter (if present) | Course list filtered appropriately | ☐ |
| CB-04 | Empty state | Log in as student with no available courses | Graceful empty state, no crash | ☐ |
| CB-05 | Click course card | Click any course card | Navigates to `/courses/:id` (CourseDetails) | ☐ |

---

## 2. Course Details (`/courses/:id`)

| ID | Test Case | Steps | Expected Result | Status |
|----|-----------|-------|-----------------|--------|
| CD-01 | Details page loads | Navigate to a valid course ID | Title, description, lessons list render | ☐ |
| CD-02 | Enroll button — not enrolled | Click "Enroll" on a non-enrolled course | Enrollment confirmed; button changes to "Continue" or similar | ☐ |
| CD-03 | Enroll already enrolled | Course already enrolled | "Enroll" button not shown or disabled | ☐ |
| CD-04 | Invalid course ID | Navigate to `/courses/nonexistent-id` | Error or 404 shown; no white screen | ☐ |
| CD-05 | Lesson list | Expand or view lessons | All lessons visible with titles and order | ☐ |

---

## 3. Lesson Viewer (`/courses/:courseId/lessons/:lessonId`)

| ID | Test Case | Steps | Expected Result | Status |
|----|-----------|-------|-----------------|--------|
| LV-01 | Lesson loads | Navigate to a valid lesson URL | Lesson title and content render | ☐ |
| LV-02 | Video lesson | Open a video-type lesson | Video player visible and playable | ☐ |
| LV-03 | Text/markdown lesson | Open a text-type lesson | Content renders as formatted text | ☐ |
| LV-04 | Next / Previous navigation | Click "Next Lesson" or "Prev Lesson" | Navigates to correct adjacent lesson | ☐ |
| LV-05 | Mark as complete | Complete a lesson (button/auto) | Lesson marked complete; progress updates | ☐ |
| LV-06 | Access non-enrolled lesson | Attempt to access a lesson in a non-enrolled course | Redirected or access denied | ☐ |
| LV-07 | Last lesson in course | Navigate to last lesson and click "Next" | No crash; "Course Complete" or loop handled | ☐ |

---

## 4. Student Courses Page (`/student/courses`)

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| SC-01 | "My Courses" tab | Shows only enrolled courses | ☐ |
| SC-02 | "Catalog" tab | Shows all available courses | ☐ |
| SC-03 | Enroll from catalog | Click enroll on catalog course | Enrolled, navigated to course viewer | ☐ |
| SC-04 | Unenroll from my courses | Click remove/unenroll on enrolled course | Course removed from "My Courses" tab | ☐ |
| SC-05 | Toast messages | Enroll/unenroll actions | Success toast shown for both actions | ☐ |
| SC-06 | Empty "My Courses" | Student with no enrollments | Empty state visible, no crash | ☐ |

---

## 5. Student Course Viewer (`/student/courses/:id`)

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| SV-01 | Course viewer loads | Sidebar with lessons + main content area visible | ☐ |
| SV-02 | Lesson selection | Click lesson in sidebar | Lesson content loads in main area | ☐ |
| SV-03 | Progress tracking | Complete lessons sequentially | Progress percentage updates | ☐ |

---

## Notes / Issues Found

| Issue # | Description | File / Area | Severity | Resolution |
|---------|-------------|-------------|----------|------------|
| | | | | |

---

*Checklist prepared by: Kunal Arya — 2026-08-23*

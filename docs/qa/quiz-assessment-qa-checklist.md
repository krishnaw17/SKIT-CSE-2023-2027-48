# Quiz & Assessment QA Checklist

**User Story:** Quiz & Assessment QA  
**Sprint:** Authentication & Role-Based (Ade Dabed) — Module Integration, Bug fixes, Optimization  
**Member:** Kunal Arya  
**Role:** QA Engineer · Testing · Documentation  
**Period:** 21-Sep-2026 → 10-Oct-2026  
**Status:** Verified & Executed (07-Oct-2026)  

---

## Scope

Test the complete quiz and assessment flow:
- Quiz listing and availability
- Quiz attempt and answer selection
- Quiz submission
- Evaluation (score calculation, correct/wrong marking)
- Result display

**Test Accounts Required:**
- 1 Student account (enrolled in at least 1 course with quizzes)
- 1 Student account (not enrolled in any course)
- 1 Admin / Teacher account (to verify quiz creation side)

**Test Environment:**
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`

---

## 1. Quiz Listing

| ID | Test Case | Steps | Expected Result | Status |
|----|-----------|-------|-----------------|--------|
| QL-01 | Quiz list loads | Navigate to `/student/quizzes` as student | All available quizzes listed with title, subject, duration | ☑ Pass |
| QL-02 | Pending quizzes | Check quizzes not yet attempted | Status shows "Pending" or "Not Attempted" | ☑ Pass |
| QL-03 | Attempted quizzes | Check quizzes already submitted | Status shows "Attempted" with score visible | ☑ Pass |
| QL-04 | No quizzes available | Login as student with no quizzes assigned | Graceful empty state — no crash | ☑ Pass |
| QL-05 | Quiz metadata visible | Each quiz card shows title, total marks, time limit | All metadata correctly displayed | ☑ Pass |
| QL-06 | Loading state | Navigate to quiz list while API loads | Loader/spinner shown — no blank screen | ☑ Pass |

---

## 2. Quiz Attempt

| ID | Test Case | Steps | Expected Result | Status |
|----|-----------|-------|-----------------|--------|
| QA-01 | Start quiz | Click "Start" / "Attempt" on a pending quiz | Quiz opens with first question displayed | ☑ Pass |
| QA-02 | Questions render | All questions visible with correct options | Questions and all options display correctly | ☑ Pass |
| QA-03 | Single correct answer | Select one option for MCQ | Selected option highlighted; others deselected | ☑ Pass |
| QA-04 | Change answer | Select option A, then change to option B | Only option B highlighted | ☑ Pass |
| QA-05 | Navigate questions | Click Next / Previous between questions | Correct question shown; previously selected answers retained | ☑ Pass |
| QA-06 | Question counter | Check question number indicator | Shows "Question X of Y" correctly | ☑ Pass |
| QA-07 | Unanswered warning | Try to submit with some questions unanswered | Warning shown — "X questions unanswered" | ☒ Defect (BUG-QA-01) |
| QA-08 | Re-attempt blocked | Try to re-open an already submitted quiz | Quiz locked — result shown instead of attempt form | ☑ Pass |

---

## 3. Quiz Submission

| ID | Test Case | Steps | Expected Result | Status |
|----|-----------|-------|-----------------|--------|
| QS-01 | Submit all answered | Answer all questions, click Submit | Submission accepted — moves to result screen | ☑ Pass |
| QS-02 | Submit confirmation | Click Submit button | Confirmation dialog appears before final submit | ☑ Pass |
| QS-03 | Partial submit | Submit with some questions unanswered (if allowed) | Unanswered counted as wrong; submission accepted | ☑ Pass |
| QS-04 | Submit response time | Submit button clicked | Result loads within 3 seconds | ☑ Pass |
| QS-05 | Duplicate submission | Try submitting same quiz twice | Second submission blocked — "Already submitted" message | ☑ Pass |
| QS-06 | API failure on submit | Submit when server is down / slow | Error message shown — no silent failure | ☑ Pass |
| QS-07 | Submit button state | After clicking Submit | Button shows loader / disabled state — no double click | ☑ Pass |

---

## 4. Evaluation (Score Calculation)

| ID | Test Case | Steps | Expected Result | Status |
|----|-----------|-------|-----------------|--------|
| QE-01 | All correct | Submit quiz with all correct answers | Score = 100% / full marks | ☑ Pass |
| QE-02 | All wrong | Submit quiz with all wrong answers | Score = 0 | ☑ Pass |
| QE-03 | Mixed answers | Submit quiz with some correct, some wrong | Score = (correct answers / total) × total marks | ☑ Pass |
| QE-04 | No negative marking | Wrong answer chosen | Score does not go below 0 (unless negative marking explicitly set) | ☑ Pass |
| QE-05 | Score consistency | Submit same answers twice (2 accounts) | Both get identical scores | ☑ Pass |
| QE-06 | Pass/Fail threshold | Score above and below passing marks | Correct pass/fail status shown | ☑ Pass |

---

## 5. Result Display

| ID | Test Case | Steps | Expected Result | Status |
|----|-----------|-------|-----------------|--------|
| QR-01 | Result screen loads | After submission | Result page loads with score immediately | ☑ Pass |
| QR-02 | Score displayed | Check result screen | Total score, marks obtained, percentage shown | ☑ Pass |
| QR-03 | Pass/Fail status | Check result screen | "Pass" or "Fail" clearly indicated | ☑ Pass |
| QR-04 | Answer breakdown | Check answer review | Correct answers highlighted green; wrong answers red | ☑ Pass |
| QR-05 | Navigate back | Click "Back to Quizzes" from result | Returns to quiz list; quiz shows "Attempted" status | ☑ Pass |
| QR-06 | Result persistence | Log out and log back in; check quiz | Same result still visible — data not lost | ☑ Pass |
| QR-07 | Result for others | Teacher/Admin views student result | Score and submission visible in reports | ☑ Pass |

---

## 6. Edge Cases

| ID | Test Case | Steps | Expected Result | Status |
|----|-----------|-------|-----------------|--------|
| EC-01 | Empty quiz | Quiz with 0 questions | Error shown or quiz marked unavailable | ☑ Pass |
| EC-02 | Direct URL access | Navigate directly to `/student/quizzes/:id` without enrollment | Access denied or redirected | ☑ Pass |
| EC-03 | Invalid quiz ID | Navigate to `/student/quizzes/nonexistent-id` | 404 or error page — no crash | ☑ Pass |
| EC-04 | Network drop mid-attempt | Disconnect internet during quiz, reconnect and submit | Submission handled gracefully — no data loss | ☐ Blocked (BUG-QA-02) |
| EC-05 | Browser refresh mid-attempt | Refresh page during quiz attempt | Progress retained or clear warning shown | ☒ Defect (BUG-QA-03) |

---

## Notes / Issues Found

| Issue # | Date | Description | Severity | File / Area | Status |
|---------|------|-------------|----------|-------------|--------|
| BUG-QA-01 | 04-Oct-2026 | Direct submit proceeds without unanswered warning confirmation modal. | Low | Web Student Quiz Attempt | Open |
| BUG-QA-02 | 05-Oct-2026 | Network drop during active quiz attempt drops draft state; offline sync not implemented. | Medium | Offline Client Handler | Deferred |
| BUG-QA-03 | 06-Oct-2026 | In-browser refresh resets uncommitted question choice to default question 1. | Low | Quiz State Cache | Open |

---

*Checklist executed and documented by: Kunal Arya — QA Engineer*  
*Date: 2026-10-07*

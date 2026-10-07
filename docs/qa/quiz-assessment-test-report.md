# Quiz & Assessment Test Report

**User Story:** Quiz & Assessment QA  
**Sprint:** Authentication & Role-Based (Ade Dabed) — Module Integration, Bug fixes, Optimization  
**Member:** Kunal Arya  
**Role:** QA Engineer · Testing · Documentation  
**Period:** 01-Oct-2026 → 07-Oct-2026 (Execution & Verification Phase)  
**Status:** Completed  

---

## Test Execution Summary

| Category | Total Cases | Passed | Failed | Blocked | Not Run | Pass Rate |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| Quiz Listing | 6 | 6 | 0 | 0 | 0 | 100% |
| Quiz Attempt | 8 | 7 | 1 | 0 | 0 | 87.5% |
| Quiz Submission | 7 | 7 | 0 | 0 | 0 | 100% |
| Evaluation & Scoring | 6 | 6 | 0 | 0 | 0 | 100% |
| Result Display | 7 | 7 | 0 | 0 | 0 | 100% |
| Edge Cases | 5 | 2 | 1 | 2 | 0 | 40% |
| **Total** | **39** | **35** | **2** | **2** | **0** | **89.7%** |

---

## Environment Details

| Item | Details |
| :--- | :--- |
| **Frontend URL** | `http://localhost:5173` |
| **Backend URL** | `http://localhost:3000` |
| **Testing Scope** | Student Quiz Attempt, Submission Flow, Evaluation Engine, Results & Scorecard |
| **Browser** | Google Chrome 129.0 / Chromium headless |
| **Tester** | Kunal Arya (QA Engineer) |
| **Execution Period** | 01-Oct-2026 to 07-Oct-2026 |
| **Target Branch** | `kunalarya` |

---

## Test Results — Section Wise

### 1. Quiz Listing

| ID | Test Case | Result | Bug Ref | Notes |
| :--- | :--- | :---: | :---: | :--- |
| QL-01 | Quiz list loads | ✅ Pass | — | Quizzes render correctly with titles and metadata |
| QL-02 | Pending quizzes | ✅ Pass | — | "Pending" badge visible on unattempted quizzes |
| QL-03 | Attempted quizzes | ✅ Pass | — | Shows "Attempted" with previous score summary |
| QL-04 | No quizzes available | ✅ Pass | — | Clean empty state graphic and notice rendered |
| QL-05 | Quiz metadata visible | ✅ Pass | — | Marks, question count, and estimated time displayed |
| QL-06 | Loading state | ✅ Pass | — | Skeleton loader displayed during query fetch |

---

### 2. Quiz Attempt

| ID | Test Case | Result | Bug Ref | Notes |
| :--- | :--- | :---: | :---: | :--- |
| QA-01 | Start quiz | ✅ Pass | — | Attempt view mounts cleanly; question 1 displayed |
| QA-02 | Questions render | ✅ Pass | — | Question text and all option choices display clearly |
| QA-03 | Single correct answer | ✅ Pass | — | Radio state toggles cleanly; active choice highlighted |
| QA-04 | Change answer | ✅ Pass | — | Selecting alternate option updates radio state without lag |
| QA-05 | Navigate questions | ✅ Pass | — | Next/Previous maintains previously selected state |
| QA-06 | Question counter | ✅ Pass | — | "Question X of Y" matches total questions accurately |
| QA-07 | Unanswered warning | ❌ Fail | BUG-QA-01 | Direct submit without warning modal on unanswered items |
| QA-08 | Re-attempt blocked | ✅ Pass | — | Re-attempting completed quiz routes to result summary |

---

### 3. Quiz Submission

| ID | Test Case | Result | Bug Ref | Notes |
| :--- | :--- | :---: | :---: | :--- |
| QS-01 | Submit all answered | ✅ Pass | — | Submission payload received and acknowledged |
| QS-02 | Submit confirmation | ✅ Pass | — | Confirmation dialog prompts user before submission |
| QS-03 | Partial submit | ✅ Pass | — | Unanswered questions treated as unattempted (0 pts) |
| QS-04 | Submit response time | ✅ Pass | — | Evaluated and redirected within ~1.2s |
| QS-05 | Duplicate submission | ✅ Pass | — | Second submission returns conflict / already submitted |
| QS-06 | API failure on submit | ✅ Pass | — | Error banner displayed on network failure |
| QS-07 | Submit button state | ✅ Pass | — | Button disabled and spinner shown during in-flight request |

---

### 4. Evaluation & Scoring

| ID | Test Case | Result | Bug Ref | Notes |
| :--- | :--- | :---: | :---: | :--- |
| QE-01 | All correct | ✅ Pass | — | 100% total score evaluated accurately |
| QE-02 | All wrong | ✅ Pass | — | 0 marks awarded; score evaluates correctly |
| QE-03 | Mixed answers | ✅ Pass | — | Accurate proportional marks calculated per question |
| QE-04 | No negative marking | ✅ Pass | — | Score bounded at 0 floor; no negative drift |
| QE-05 | Score consistency | ✅ Pass | — | Identical submissions yield matching score breakdowns |
| QE-06 | Pass/Fail threshold | ✅ Pass | — | Pass threshold badge (>=60%) calculates correctly |

---

### 5. Result Display

| ID | Test Case | Result | Bug Ref | Notes |
| :--- | :--- | :---: | :---: | :--- |
| QR-01 | Result screen loads | ✅ Pass | — | Results view mounts immediately upon submission |
| QR-02 | Score displayed | ✅ Pass | — | Marks obtained / total marks formatted clearly |
| QR-03 | Pass/Fail status | ✅ Pass | — | Visual status badge displays Pass/Fail clearly |
| QR-04 | Answer breakdown | ✅ Pass | — | Correct options highlighted green; wrong choices red |
| QR-05 | Navigate back | ✅ Pass | — | "Back to Quizzes" returns cleanly to quiz dashboard |
| QR-06 | Result persistence | ✅ Pass | — | Result remains persistent after relogin |
| QR-07 | Result for others | ✅ Pass | — | Admin/Teacher dashboard reflects student scores |

---

### 6. Edge Cases

| ID | Test Case | Result | Bug Ref | Notes |
| :--- | :--- | :---: | :---: | :--- |
| EC-01 | Empty quiz | ✅ Pass | — | 0 questions quiz displays "No questions found" notice |
| EC-02 | Direct URL access | ✅ Pass | — | Unenrolled quiz access redirects to enrollment prompt |
| EC-03 | Invalid quiz ID | ✅ Pass | — | 404 Not Found screen shown; app does not crash |
| EC-04 | Network drop mid-attempt | ⚠️ Blocked | BUG-QA-02 | Offline service worker draft sync not yet implemented |
| EC-05 | Browser refresh mid-attempt | ❌ Fail | BUG-QA-03 | Hard browser refresh resets unsaved active question state |

---

## Defect & Observation Log

| Bug # | ID Ref | Description | Severity | Target Module | Status |
| :--- | :--- | :--- | :---: | :--- | :---: |
| **BUG-QA-01** | QA-07 | Direct submission does not show confirmation modal when questions are left unanswered. | Low | Web Student Quiz | Open |
| **BUG-QA-02** | EC-04 | Network disconnection during attempt causes state drop; offline sync worker pending. | Medium | Client Network Handler | Open (Deferred) |
| **BUG-QA-03** | EC-05 | Hard refresh resets in-memory quiz state back to question 1. | Low | Client State Store | Open |

> **Severity Scale:** Critical (Blocker), High (Major feature defect), Medium (Functional workaround exists), Low (Minor UX/Cosmetic).

---

## Final Sign-Off

| Item | Details |
| :--- | :--- |
| **Total Test Cases** | 39 |
| **Passed** | 35 (89.7%) |
| **Failed (Minor)** | 2 (Low severity) |
| **Blocked / Deferred** | 2 (Offline caching infrastructure) |
| **Overall Recommendation** | **ACCEPTED FOR SPRINT REVIEW** — Core quiz submission, scoring evaluation, and scorecard display flows are functional, stable, and verified. |
| **QA Engineer** | Kunal Arya |
| **Sign-Off Date** | 07-Oct-2026 |

---

*Report prepared by: Kunal Arya — QA Engineer*  
*Sprint: Quiz & Assessment QA (21-Sep-2026 → 10-Oct-2026)*

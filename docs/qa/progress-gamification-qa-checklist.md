# Progress & Gamification QA Checklist

**User Story:** Progress & gamification QA  
**Sprint:** Role Based Authentication & dashboard, Module Integration, Bug fixes, Optimization  
**Member:** Kunal Arya  
**Role:** QA Engineer · Testing · Documentation  
**Period:** 07-Oct-2026 → 15-Oct-2026  
**Status:** In Testing & Verification  

---

## Scope

Test all Progress, Gamification, XP engine, Badge achievements, and Leaderboard ranking features:
- Lesson & Course progress tracking
- XP (Experience Points) earning, calculation, and level milestones
- Badge unlocking criteria and visual showcase
- Real-time and scheduled Leaderboard rankings
- Integration with Student and Admin dashboards

**Test Accounts Required:**
- 1 New Student account (0 XP, Level 1, no badges)
- 1 Active Student account (Mid-tier XP, Level 3+, multiple badges earned)
- 1 Top Student account (High XP, Rank #1 on leaderboard)
- 1 Teacher / Admin account (To inspect badge creation and progress analytics)

**Test Environment:**
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`

---

## 1. Progress Tracking QA

| ID | Test Case | Steps | Expected Result | Status |
| :--- | :--- | :--- | :--- | :---: |
| **PRG-01** | Lesson completion toggle | Complete a lesson and click "Mark Complete" | Lesson marked complete; next lesson unlocked | ☑ Pass |
| **PRG-02** | Course percentage calculation | Complete 2 out of 4 lessons in a module | Course progress reflects exactly 50% | ☑ Pass |
| **PRG-03** | Progress persistence | Complete lessons, log out, and log back in | Completed lessons and progress % remain unchanged | ☑ Pass |
| **PRG-04** | Overall dashboard progress | Open Student Dashboard | Overall course completion widget matches course details | ☑ Pass |
| **PRG-05** | Completed course badge | Finish 100% of course lessons | Course displays "Completed" state with review option | ☑ Pass |
| **PRG-06** | Unenrollment progress handling | Unenroll from course with partial progress | Progress safely archived; no orphan database rows | ☑ Pass |

---

## 2. XP (Experience Points) Engine QA

| ID | Test Case | Steps | Expected Result | Status |
| :--- | :--- | :--- | :--- | :---: |
| **XP-01** | Lesson completion XP | Complete standard text/video lesson | +50 XP awarded and success toast notification shown | ☑ Pass |
| **XP-02** | Quiz submission XP | Pass a quiz with 100% score | Full quiz bonus XP (+100 XP) credited to student total | ☑ Pass |
| **XP-03** | Level-up threshold | Reach exact XP needed for Level 2 (e.g. 500 XP) | Level increments to Level 2; level-up modal triggers | ☑ Pass |
| **XP-04** | XP Progress bar rendering | Inspect XP bar on Student Dashboard | Fill bar proportional to (Current XP / Next Level XP) | ☑ Pass |
| **XP-05** | Daily XP history chart | Inspect 5-day XP activity chart | Correct daily XP points plotted on timeline graph | ☑ Pass |
| **XP-06** | Re-attempt quiz XP | Retake an already completed quiz | No duplicate XP awarded (prevent XP farming) | ☑ Pass |
| **XP-07** | Zero XP boundary | Create a new student account | Starting XP is exactly 0, Level 1, bar at 0% | ☑ Pass |

---

## 3. Badges & Achievements QA

| ID | Test Case | Steps | Expected Result | Status |
| :--- | :--- | :--- | :--- | :---: |
| **BDG-01** | First lesson badge | Complete first ever lesson | "First Step" badge awarded and unlocked | ☑ Pass |
| **BDG-02** | Quiz master badge | Score 100% on 3 consecutive quizzes | "Quiz Master" badge unlocks in profile showcase | ☑ Pass |
| **BDG-03** | Badge visual states | View Badge Gallery in Profile | Unlocked badges colorful; locked badges greyed out | ☑ Pass |
| **BDG-04** | Badge metadata inspection | Click or hover over any badge icon | Badge name, criteria, and unlocked date displayed | ☑ Pass |
| **BDG-05** | Admin badge assignment | Admin creates/assigns custom badge to student | Badge immediately renders in student badge list | ☑ Pass |
| **BDG-06** | Badge count badge synchronization | Count total unlocked badges in profile | Badge counter on dashboard matches profile total | ☒ Defect (BUG-GAM-01) |

---

## 4. Leaderboard Rankings QA

| ID | Test Case | Steps | Expected Result | Status |
| :--- | :--- | :--- | :--- | :---: |
| **LDB-01** | Leaderboard listing | Navigate to `/student/leaderboard` | Top students listed in descending order by total XP | ☑ Pass |
| **LDB-02** | Top 3 podium styling | Inspect top 3 student cards | Gold, Silver, Bronze badges/styling applied | ☑ Pass |
| **LDB-03** | Current user highlight | Log in as mid-ranked student | User's own card highlighted or pinned to bottom | ☑ Pass |
| **LDB-04** | Tie-breaking rule | Two students with identical total XP | Tie broken by account seniority or earlier timestamp | ☑ Pass |
| **LDB-05** | Filter by scope / timeframe | Switch between "All Time" and "This Week" | Leaderboard table recalculates points accurately | ☑ Pass |
| **LDB-06** | Real-time rank update | Student earns 200 XP to overtake rank above | Leaderboard reflects new position upon refresh | ☑ Pass |
| **LDB-07** | Empty leaderboard handling | Test on fresh cohort with 0 XP | Graceful empty table message; no calculation error | ☑ Pass |

---

## 5. Edge Cases & Resilience QA

| ID | Test Case | Steps | Expected Result | Status |
| :--- | :--- | :--- | :--- | :---: |
| **EC-01** | Rapid concurrent XP events | Trigger multiple lesson completes in rapid succession | Mutex / atomic XP increments prevent race condition | ☑ Pass |
| **EC-02** | Max level boundary | Simulate account with > 10,000 XP (Max level) | Max level badge shown; bar pinned at 100% | ☑ Pass |
| **EC-03** | Negative XP guard | Trigger edge-case quiz failure | Total XP floor bounded at 0; cannot become negative | ☑ Pass |
| **EC-04** | Offline XP sync attempt | Mark lesson complete while offline | Local queue alerts user; syncs once reconnected | ☐ Blocked (BUG-GAM-02) |
| **EC-05** | Leaderboard pagination | Load leaderboard with 100+ students | Paginated cleanly; no infinite scroll crash | ☑ Pass |

---

## Notes & Observations

| Issue # | Date | Description | Severity | Area | Status |
| :--- | :--- | :--- | :---: | :--- | :---: |
| **BUG-GAM-01** | 12-Oct-2026 | Badge count on Student Dashboard header lags by 1 until hard refresh after earning badge. | Low | Dashboard UI Store | Open |
| **BUG-GAM-02** | 14-Oct-2026 | Offline XP queueing worker not active; requires active network connection to award points. | Medium | Client Sync Handler | Deferred |

---

*Checklist prepared by: Kunal Arya — QA Engineer*  
*Sprint: Progress & gamification QA (11-Oct-2026 → 24-Oct-2026)*

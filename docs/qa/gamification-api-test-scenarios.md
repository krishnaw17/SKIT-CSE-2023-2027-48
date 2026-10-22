# Gamification & Progress API Test Scenarios & Evidence

**User Story:** Progress & gamification QA  
**Sprint:** Role Based Authentication & dashboard, Module Integration, Bug fixes, Optimization  
**Member:** Kunal Arya  
**Role:** QA Engineer · Testing · Documentation  
**Period:** 16-Oct-2026 → 22-Oct-2026 (Deep Verification & API Testing Phase)  
**Status:** Executed & Documented  

---

## 1. Overview & Objective

To ensure high data reliability, state consistency, and calculation accuracy across the gamification layer, this document specifies the **API-level verification scenarios** for Progress, Experience Points (XP), Badges, and Leaderboard ranking endpoints. Testing focused on payload validation, level calculation algorithms, idempotency against duplicate XP farming, and response latency SLAs.

---

## 2. Test Environment & Base Endpoints

- **Base URL:** `http://localhost:3000/api/v1`
- **Auth Header:** `Authorization: Bearer <STUDENT_JWT_TOKEN>`
- **Content-Type:** `application/json`

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/gamification/xp` | Fetch student current XP, level status, and next level threshold |
| `POST` | `/gamification/award-xp` | Award XP for completed activities (lessons, quizzes) |
| `GET` | `/gamification/badges` | Retrieve earned badges and locked achievement catalog |
| `GET` | `/gamification/leaderboard` | Retrieve ranked student standings with timeframe filter |

---

## 3. API Test Scenarios & Validation Matrix

| Scenario ID | Test Scope | HTTP Method & Path | Expected Status | Actual Status | Result |
| :--- | :--- | :--- | :---: | :---: | :---: |
| **API-GAM-01** | Fetch Student XP & Level Status | `GET /gamification/xp` | `200 OK` | `200 OK` | ✅ Pass |
| **API-GAM-02** | Valid XP Award on Lesson Complete | `POST /gamification/award-xp` | `200 OK` | `200 OK` | ✅ Pass |
| **API-GAM-03** | Level-Up Milestone Trigger (Level 1 → 2) | `POST /gamification/award-xp` | `200 OK` | `200 OK` | ✅ Pass |
| **API-GAM-04** | Duplicate XP Event Guard (Idempotency) | `POST /gamification/award-xp` | `409 Conflict` | `409 Conflict` | ✅ Pass |
| **API-GAM-05** | Badges Showcase Retrieval | `GET /gamification/badges` | `200 OK` | `200 OK` | ✅ Pass |
| **API-GAM-06** | Leaderboard Query & Sort Order | `GET /gamification/leaderboard?limit=10` | `200 OK` | `200 OK` | ✅ Pass |
| **API-GAM-07** | Unauthorized Request Validation | `GET /gamification/xp` (No Token) | `401 Unauthorized` | `401 Unauthorized` | ✅ Pass |
| **API-GAM-08** | Gamification Latency SLA Benchmark | `GET /gamification/leaderboard` | `< 400ms` | `~185ms` | ✅ Pass |

---

## 4. Payload Samples & Response Verification

### Scenario API-GAM-02: Awarding Lesson Completion XP

**Request:**
```http
POST /api/v1/gamification/award-xp HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsIn...
Content-Type: application/json

{
  "sourceType": "LESSON_COMPLETION",
  "sourceId": "les_4021",
  "xpAmount": 50
}
```

**Response Validation:**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "data": {
    "transactionId": "tx_9012",
    "previousXp": 450,
    "xpAwarded": 50,
    "newTotalXp": 500,
    "currentLevel": 2,
    "leveledUp": true,
    "awardedAt": "2026-10-18T11:14:22.180Z"
  }
}
```
*Verification Check:* XP correctly increments (`450 + 50 = 500`), level threshold increments to Level 2, and `leveledUp: true` flag is returned for UI celebration modal.

---

### Scenario API-GAM-04: Duplicate XP Event Blocking

**Request:**
```http
POST /api/v1/gamification/award-xp HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsIn...
Content-Type: application/json

{
  "sourceType": "LESSON_COMPLETION",
  "sourceId": "les_4021",
  "xpAmount": 50
}
```

**Response Validation:**
```http
HTTP/1.1 409 Conflict
Content-Type: application/json

{
  "success": false,
  "error": {
    "code": "DUPLICATE_TRANSACTION",
    "message": "XP has already been credited for this activity."
  }
}
```
*Verification Check:* Duplicate XP submission is rejected with HTTP 409 Conflict, preventing artificial score inflation.

---

### Scenario API-GAM-06: Leaderboard Ranking Query

**Request:**
```http
GET /api/v1/gamification/leaderboard?timeframe=this_week&limit=5 HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsIn...
```

**Response Validation:**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "data": {
    "timeframe": "this_week",
    "totalParticipants": 42,
    "rankings": [
      { "rank": 1, "studentId": "std_101", "name": "Aarav Sharma", "weeklyXp": 850, "level": 4 },
      { "rank": 2, "studentId": "std_109", "name": "Kunal Arya", "weeklyXp": 720, "level": 3 },
      { "rank": 3, "studentId": "std_104", "name": "Rohan Verma", "weeklyXp": 690, "level": 3 }
    ],
    "currentUserRank": {
      "rank": 2,
      "studentId": "std_109",
      "weeklyXp": 720
    }
  }
}
```
*Verification Check:* Ranks sorted descending by weekly XP; logged-in user position cleanly pinned in `currentUserRank`.

---

## 5. Performance & Latency Benchmark

| Test Scenario | Payload Size | Server Query Time | Network Latency | Total Turnaround | Status |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Fetch Student XP (`/xp`) | 0.8 KB | 62ms | 38ms | 100ms | ✅ Pass |
| Award XP (`/award-xp`) | 1.2 KB | 115ms | 45ms | 160ms | ✅ Pass |
| Leaderboard Top 50 (`/leaderboard`) | 6.4 KB | 140ms | 55ms | 195ms | ✅ Pass |

- **SLA Benchmark Target:** ≤ 400ms
- **Actual Average Latency:** **152ms** (Well within performance threshold)

---

## 6. QA Summary

- **Total API Scenarios:** 8
- **Passed:** 8 (100%)
- **Data Integrity:** High. Atomic increments guarantee accurate total XP and level thresholds.
- **Security:** Verified endpoints require valid JWT tokens and reject unauthorized queries with HTTP 401.

---

*Report prepared by: Kunal Arya — QA Engineer*  
*Sprint: Progress & gamification QA (11-Oct-2026 → 24-Oct-2026)*

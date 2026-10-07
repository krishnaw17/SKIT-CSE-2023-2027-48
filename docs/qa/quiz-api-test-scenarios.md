# Quiz & Assessment API Test Scenarios & Evidence

**User Story:** Quiz & Assessment QA  
**Sprint:** Authentication & Role-Based (Ade Dabed) — Module Integration, Bug fixes, Optimization  
**Member:** Kunal Arya  
**Role:** QA Engineer · Testing · Documentation  
**Period:** 01-Oct-2026 → 07-Oct-2026  
**Status:** Executed & Documented  

---

## 1. Overview & Objective

To ensure high reliability and data integrity beyond UI click-testing, this document outlines the **API-level verification scenarios** for the Quiz & Assessment module. Testing focused on payload validation, evaluation accuracy, idempotent submissions, response times, and HTTP error boundary handling.

---

## 2. Test Environment & Base Endpoints

- **Base URL:** `http://localhost:3000/api/v1`
- **Auth Header:** `Authorization: Bearer <STUDENT_JWT_TOKEN>`
- **Content-Type:** `application/json`

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/quizzes` | Fetch assigned quizzes for enrolled courses |
| `GET` | `/quizzes/:id` | Fetch quiz metadata, questions, and option choices |
| `POST` | `/quizzes/:id/submit` | Submit answers and trigger automated evaluation engine |
| `GET` | `/quizzes/:id/result` | Retrieve evaluated scorecard and answer breakdown |

---

## 3. API Test Scenarios & Validation Matrix

| Scenario ID | Test Scope | HTTP Method & Path | Expected Status | Actual Status | Result |
| :--- | :--- | :--- | :---: | :---: | :---: |
| **API-QZ-01** | Full Valid Submission (100% Correct) | `POST /quizzes/qz_101/submit` | `200 OK` | `200 OK` | ✅ Pass |
| **API-QZ-02** | Partial Answers Submission (Unanswered items) | `POST /quizzes/qz_101/submit` | `200 OK` | `200 OK` | ✅ Pass |
| **API-QZ-03** | Empty Payload Validation (`answers: []`) | `POST /quizzes/qz_101/submit` | `400 Bad Request` | `400 Bad Request` | ✅ Pass |
| **API-QZ-04** | Duplicate Re-submission (Idempotency) | `POST /quizzes/qz_101/submit` | `409 Conflict` | `409 Conflict` | ✅ Pass |
| **API-QZ-05** | Unauthorized Student Access (Missing Token) | `GET /quizzes/qz_101` | `401 Unauthorized` | `401 Unauthorized` | ✅ Pass |
| **API-QZ-06** | Invalid / Non-existent Quiz ID | `GET /quizzes/invalid_id` | `404 Not Found` | `404 Not Found` | ✅ Pass |
| **API-QZ-07** | Evaluation Engine Response Time SLA | `POST /quizzes/qz_101/submit` | `< 1500ms` | `~340ms` | ✅ Pass |

---

## 4. Payload Samples & Response Verification

### Scenario API-QZ-01: Valid Quiz Submission & Grading Verification

**Request:**
```http
POST /api/v1/quizzes/qz_101/submit HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsIn...
Content-Type: application/json

{
  "answers": [
    { "questionId": "q_01", "selectedOptionId": "opt_a" },
    { "questionId": "q_02", "selectedOptionId": "opt_c" },
    { "questionId": "q_03", "selectedOptionId": "opt_b" }
  ]
}
```

**Response Validation:**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "data": {
    "submissionId": "sub_9841",
    "quizId": "qz_101",
    "totalQuestions": 3,
    "correctAnswers": 3,
    "scoreObtained": 30,
    "totalMarks": 30,
    "percentage": 100.0,
    "passed": true,
    "submittedAt": "2026-10-06T14:22:18.412Z"
  }
}
```
*Verification Check:* Score calculated correctly (`30/30`), `passed: true`, and `submittedAt` timestamp recorded.

---

### Scenario API-QZ-03: Empty / Malformed Payload

**Request:**
```http
POST /api/v1/quizzes/qz_101/submit HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsIn...
Content-Type: application/json

{
  "answers": []
}
```

**Response Validation:**
```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Answers array cannot be empty."
  }
}
```
*Verification Check:* Guard validation blocks invalid payloads and returns clean HTTP 400 without unhandled server exception.

---

### Scenario API-QZ-04: Duplicate Submission Blocking

**Request:**
```http
POST /api/v1/quizzes/qz_101/submit HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsIn...
Content-Type: application/json

{
  "answers": [
    { "questionId": "q_01", "selectedOptionId": "opt_a" }
  ]
}
```

**Response Validation:**
```http
HTTP/1.1 409 Conflict
Content-Type: application/json

{
  "success": false,
  "error": {
    "code": "ALREADY_SUBMITTED",
    "message": "You have already completed this quiz. Re-submission is not permitted."
  }
}
```
*Verification Check:* Subsequent attempts are rejected with HTTP 409 Conflict, preserving initial evaluation data integrity.

---

## 5. Performance & Latency Benchmark

| Test Sample | Payload Size | Network Latency | Server Evaluation Time | Total Turnaround | Status |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Sample Run 1 | 1.4 KB | 45ms | 280ms | 325ms | ✅ Pass |
| Sample Run 2 | 2.8 KB | 52ms | 310ms | 362ms | ✅ Pass |
| Sample Run 3 | 5.1 KB | 60ms | 385ms | 445ms | ✅ Pass |

- **SLA Benchmark Target:** ≤ 1,500ms
- **Actual Average Latency:** **377ms** (Well within performance threshold)

---

## 6. QA Summary

- **Total API Scenarios:** 7
- **Passed:** 7 (100%)
- **Data Integrity:** High. Evaluation logic calculations match expected score totals exactly.
- **Security:** Verified endpoints enforce JWT Bearer tokens and return HTTP 401 when unauthenticated.

---

*Report prepared by: Kunal Arya — QA Engineer*  
*Sprint: Quiz & Assessment QA (21-Sep-2026 → 10-Oct-2026)*

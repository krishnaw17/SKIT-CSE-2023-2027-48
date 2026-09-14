# Entity Relationship Diagram

This document contains the core Entity-Relationship diagram for the GLMS system.

```mermaid
erDiagram
    User ||--o{ StudentProfile : "has"
    User ||--o{ TeacherProfile : "has"
    User ||--o{ RefreshToken : "owns"
    User ||--o{ AuditLog : "creates"
    
    StudentProfile ||--o{ Enrollment : "enrolls"
    StudentProfile ||--o{ Attendance : "logs"
    StudentProfile ||--o{ AssignmentSubmission : "submits"
    StudentProfile ||--o{ QuizAttempt : "attempts"
    StudentProfile ||--o{ XPTransaction : "earns"
    StudentProfile ||--o{ StudentBadge : "collects"
    StudentProfile ||--o| Streak : "maintains"
    StudentProfile ||--o{ LeaderboardEntry : "ranked_in"

    TeacherProfile ||--o{ Course : "teaches"
    TeacherProfile ||--o{ ClassSubject : "assigned_to"
    TeacherProfile ||--o{ Quiz : "authors"

    Class ||--o{ StudentProfile : "contains"
    Class ||--o{ ClassSubject : "offers"
    Class ||--o{ Course : "groups_for"

    Subject ||--o{ ClassSubject : "mapped_in"

    Course ||--o{ Lesson : "contains"
    Course ||--o{ Assignment : "contains"
    Course ||--o{ Quiz : "contains"
    Course ||--o{ Enrollment : "has_students"

    Quiz ||--o{ Question : "contains"
    Question ||--o{ Option : "has"
    QuizAttempt ||--o{ QuizAnswer : "records"

    Badge ||--o{ StudentBadge : "awarded_to"
    Level ||--o{ StudentProfile : "reached_by"
```

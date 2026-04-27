# LaTeX Exerciser API Contract v0

## 0. Purpose

This document defines the frontend-backend API contract for the LaTeX Exerciser Mock Up.

The contract is intentionally small and implementation-oriented.

## 1. Base URL

Local backend:

```txt
http://localhost:8000/api
```

Frontend environment variable:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

## **2. Common Rules**

### **2.1 Content Type**

All request and response bodies use JSON.

```
Content-Type: application/json
```

### **2.2 Authentication Header**

Protected endpoints require:

```
Authorization: Bearer <token>
```

Mock token format:

```
mock-token-<userId>
```

Example:

```
Authorization: Bearer mock-token-user_1
```

### **2.3 ID Format**

Mock IDs use readable string IDs.

```
user_1
quiz_1_1
session_1
```

### **2.4 Date Format**

Datetime values use ISO 8601 strings.

```
2026-04-28T12:00:00Z
```

### **2.5 Error Response**

All non-2xx responses should return this shape when possible.

```json
{
  "detail": "Human-readable error message."
}
```

Common status codes:

```
400 - Bad request / validation error
401 - Missing or invalid token
404 - Resource not found
409 - Conflict
500 - Internal server error
```

---

# **3. Auth API**

## **3.1 POST /api/auth/signup**

Create a mock user and return a token.

### **Auth**

```
Public
```

### **Request**

```json
{
  "email": "user@example.com",
  "displayName": "Justin",
  "password": "password123"
}
```

### **Request Fields**

| **Field** | **Type** | **Required** | **Rule** |
| --- | --- | --- | --- |
| email | string | yes | valid email |
| displayName | string | yes | min length 1 |
| password | string | yes | min length 8 |

### **Response 200**

```json
{
  "token": "mock-token-user_1",
  "user": {
    "id": "user_1",
    "email": "user@example.com",
    "displayName": "Justin"
  }
}
```

### **Error Examples**

```json
{
  "detail": "Email already exists."
}
```

---

## **3.2 POST /api/auth/login**

Login with email and password.

### **Auth**

```
Public
```

### **Request**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### **Response 200**

```json
{
  "token": "mock-token-user_1",
  "user": {
    "id": "user_1",
    "email": "user@example.com",
    "displayName": "Justin"
  }
}
```

### **Error Examples**

```json
{
  "detail": "Invalid email or password."
}
```

---

## **3.3 POST /api/auth/logout**

Logout current user.

For Mock Up, the backend does not need to invalidate server-side token state. Frontend removes the token from local storage.

### **Auth**

```
Protected
```

### **Request**

```json
{}
```

### **Response 200**

```json
{
  "ok": true
}
```

---

## **3.4 GET /api/auth/me**

Return current authenticated user.

### **Auth**

```
Protected
```

### **Response 200**

```json
{
  "id": "user_1",
  "email": "user@example.com",
  "displayName": "Justin"
}
```

---

# **4. User Settings API**

## **4.1 Settings Model**

```json
{
  "defaultLevelMin": 1,
  "defaultLevelMax": 3,
  "defaultTimeLimit": 60,
  "strictMode": false,
  "autoAdvanceAfterAnswer": false
}
```

### **Fields**

| **Field** | **Type** | **Rule** |
| --- | --- | --- |
| defaultLevelMin | number | integer, 1~10 |
| defaultLevelMax | number | integer, 1~10, must be >= defaultLevelMin |
| defaultTimeLimit | number | seconds, integer, 5~300 |
| strictMode | boolean | exact string comparison if true |
| autoAdvanceAfterAnswer | boolean | frontend auto-next behavior |

---

## **4.2 GET /api/settings**

Get current user settings.

### **Auth**

```
Protected
```

### **Response 200**

```json
{
  "defaultLevelMin": 1,
  "defaultLevelMax": 3,
  "defaultTimeLimit": 60,
  "strictMode": false,
  "autoAdvanceAfterAnswer": false
}
```

---

## **4.3 PATCH /api/settings**

Partially update user settings.

### **Auth**

```
Protected
```

### **Request**

```json
{
  "defaultLevelMin": 2,
  "defaultLevelMax": 5,
  "defaultTimeLimit": 45,
  "strictMode": true,
  "autoAdvanceAfterAnswer": false
}
```

All fields are optional, but at least one field should be provided.

### **Response 200**

```json
{
  "defaultLevelMin": 2,
  "defaultLevelMax": 5,
  "defaultTimeLimit": 45,
  "strictMode": true,
  "autoAdvanceAfterAnswer": false
}
```

### **Error Examples**

```json
{
  "detail": "defaultLevelMin must be less than or equal to defaultLevelMax."
}
```

---

# **5. Quiz Data API**

## **5.1 Quiz Model**

```json
{
  "id": "quiz_1_1",
  "difficultyLevel": 1,
  "promptText": "x squared",
  "targetLatex": "x^2",
  "acceptedVariants": ["x^{2}"],
  "timeLimitSec": 30
}
```

### **Fields**

| **Field** | **Type** | **Rule** |
| --- | --- | --- |
| id | string | unique quiz ID |
| difficultyLevel | number | integer, 1~10 |
| promptText | string | human-readable prompt |
| targetLatex | string | canonical correct LaTeX |
| acceptedVariants | string[] | alternate accepted LaTeX strings |
| timeLimitSec | number | seconds |

---

## **5.2 GET /api/quizzes**

Return quiz list.

### **Auth**

```
Public in v0
```

### **Query Params**

| **Param** | **Type** | **Required** | **Rule** |
| --- | --- | --- | --- |
| difficultyLevel | number | no | 1~10 |

### **Response 200**

```json
[
  {
    "id": "quiz_1_1",
    "difficultyLevel": 1,
    "promptText": "x squared",
    "targetLatex": "x^2",
    "acceptedVariants": ["x^{2}"],
    "timeLimitSec": 30
  },
  {
    "id": "quiz_1_2",
    "difficultyLevel": 1,
    "promptText": "fraction a over b",
    "targetLatex": "\\frac{a}{b}",
    "acceptedVariants": [],
    "timeLimitSec": 30
  }
]
```

---

## **5.3 POST /api/quizzes**

Create quiz data.

### **Auth**

```
Protected
```

### **Request**

```json
{
  "difficultyLevel": 1,
  "promptText": "x squared",
  "targetLatex": "x^2",
  "acceptedVariants": ["x^{2}"],
  "timeLimitSec": 30
}
```

### **Response 200**

```json
{
  "id": "quiz_1_1",
  "difficultyLevel": 1,
  "promptText": "x squared",
  "targetLatex": "x^2",
  "acceptedVariants": ["x^{2}"],
  "timeLimitSec": 30
}
```

---

## **5.4 PATCH /api/quizzes/{quizId}**

Update quiz data.

### **Auth**

```
Protected
```

### **Request**

```json
{
  "promptText": "x to the power of 2",
  "acceptedVariants": ["x^{2}", "{x}^{2}"]
}
```

All fields are optional.

### **Response 200**

```json
{
  "id": "quiz_1_1",
  "difficultyLevel": 1,
  "promptText": "x to the power of 2",
  "targetLatex": "x^2",
  "acceptedVariants": ["x^{2}", "{x}^{2}"],
  "timeLimitSec": 30
}
```

---

## **5.5 DELETE /api/quizzes/{quizId}**

Delete quiz data.

### **Auth**

```
Protected
```

### **Response 200**

```json
{
  "ok": true
}
```

---

# **6. Quiz Session API**

## **6.1 Session Creation Rule**

The user selects a difficulty range.

```
selectedLevelCount = levelMax - levelMin + 1
totalQuizCount = selectedLevelCount * 10
```

Manual quiz count override is not supported in v0.

---

## **6.2 POST /api/quiz/sessions**

Create a quiz session.

### **Auth**

```
Protected
```

### **Request**

```json
{
  "levelMin": 1,
  "levelMax": 3
}
```

### **Request Fields**

| **Field** | **Type** | **Rule** |
| --- | --- | --- |
| levelMin | number | integer, 1~10 |
| levelMax | number | integer, 1~10, must be >= levelMin |

### **Response 200**

```json
{
  "sessionId": "session_1"
}
```

### **Error Examples**

```json
{
  "detail": "Not enough quizzes for selected level range."
}
```

---

## **6.3 GET /api/quiz/sessions/{sessionId}**

Get current quiz session.

### **Auth**

```
Protected
```

### **Response 200**

```json
{
  "id": "session_1",
  "userId": "user_1",
  "levelMin": 1,
  "levelMax": 3,
  "quizzes": [
    {
      "id": "quiz_1_1",
      "difficultyLevel": 1,
      "promptText": "x squared",
      "targetLatex": "x^2",
      "acceptedVariants": ["x^{2}"],
      "timeLimitSec": 30
    }
  ],
  "currentIndex": 0,
  "answers": [],
  "status": "playing",
  "startedAt": "2026-04-28T12:00:00Z",
  "completedAt": null
}
```

### **Session Status**

```
playing
completed
```

---

## **6.4 POST /api/quiz/sessions/{sessionId}/submit**

Submit answer for current question.

### **Auth**

```
Protected
```

### **Request**

```json
{
  "quizId": "quiz_1_1",
  "submittedLatex": "x^2",
  "responseTimeSec": 12.5,
  "timedOut": false
}
```

### **Response 200**

```json
{
  "isCorrect": true,
  "score": 110.0,
  "correctLatex": "x^2",
  "acceptedVariants": ["x^{2}"]
}
```

### **Grading Rule**

When `strictMode=true`:

```
submittedLatex == targetLatex
```

When `strictMode=false`:

```
normalize(submittedLatex) == normalize(targetLatex)
OR normalize(submittedLatex) matches normalized acceptedVariants
```

### **Normalization v0**

```
trim
remove spaces
remove \,
remove \;
```

---

## **6.5 POST /api/quiz/sessions/{sessionId}/reveal**

Reveal answer for current question.

### **Auth**

```
Protected
```

### **Request**

```json
{
  "quizId": "quiz_1_1"
}
```

### **Response 200**

```json
{
  "correctLatex": "x^2",
  "acceptedVariants": ["x^{2}"]
}
```

### **Behavior**

```
The current question is marked as usedReveal=true.
If the user submits later, hintPenalty=0.5 applies.
```

---

## **6.6 POST /api/quiz/sessions/{sessionId}/next**

Move to next question.

### **Auth**

```
Protected
```

### **Request**

```json
{}
```

### **Response 200 — Next Question Exists**

```json
{
  "sessionId": "session_1",
  "currentIndex": 1,
  "status": "playing"
}
```

### **Response 200 — Session Completed**

```json
{
  "sessionId": "session_1",
  "currentIndex": 29,
  "status": "completed"
}
```

---

## **6.7 GET /api/quiz/sessions/{sessionId}/result**

Get quiz result.

### **Auth**

```
Protected
```

### **Response 200**

```json
{
  "sessionId": "session_1",
  "totalScore": 2450.0,
  "accuracy": 0.82,
  "averageResponseTime": 21.4,
  "correctCount": 24,
  "wrongCount": 5,
  "timeoutCount": 1,
  "answerRevealCount": 3,
  "bestDifficultyCleared": 3
}
```

---

# **7. Score Calculation Contract**

## **7.1 Formula**

```
questionScore = baseScore × difficultyWeight × speedMultiplier × hintPenalty
```

## **7.2 Base Score**

```
baseScore = 100
```

## **7.3 Difficulty Weight**

```json
{
  "1": 1.0,
  "2": 1.1,
  "3": 1.2,
  "4": 1.3,
  "5": 1.4,
  "6": 1.6,
  "7": 1.8,
  "8": 2.0,
  "9": 2.3,
  "10": 2.6
}
```

## **7.4 Speed Multiplier**

```
responseTimeSec <= timeLimitSec * 0.5 -> 1.1
responseTimeSec <= timeLimitSec       -> 1.0
responseTimeSec > timeLimitSec        -> 0.6
```

## **7.5 Hint Penalty**

```
usedReveal=false -> 1.0
usedReveal=true  -> 0.5
```

## **7.6 Incorrect Answer**

```
score = 0
```

---

# **8. Frontend Type Reference**

These are reference types for frontend implementation. They are not source code yet.

```tsx
export type User = {
  id: string;
  email: string;
  displayName: string;
};

export type UserSettings = {
  defaultLevelMin: number;
  defaultLevelMax: number;
  defaultTimeLimit: number;
  strictMode: boolean;
  autoAdvanceAfterAnswer: boolean;
};

export type Quiz = {
  id: string;
  difficultyLevel: number;
  promptText: string;
  targetLatex: string;
  acceptedVariants: string[];
  timeLimitSec: number;
};

export type QuizAnswer = {
  quizId: string;
  submittedLatex: string;
  isCorrect: boolean;
  usedReveal: boolean;
  timedOut: boolean;
  responseTimeSec: number;
  score: number;
};

export type QuizSession = {
  id: string;
  userId: string;
  levelMin: number;
  levelMax: number;
  quizzes: Quiz[];
  currentIndex: number;
  answers: QuizAnswer[];
  status: "playing" | "completed";
  startedAt: string;
  completedAt: string | null;
};

export type QuizResult = {
  sessionId: string;
  totalScore: number;
  accuracy: number;
  averageResponseTime: number;
  correctCount: number;
  wrongCount: number;
  timeoutCount: number;
  answerRevealCount: number;
  bestDifficultyCleared: number;
};
```

---

# **9. Backend Schema Reference**

These are reference schema names for later FastAPI implementation.

```
SignupRequest
LoginRequest
AuthResponse
UserResponse

UserSettingsResponse
UserSettingsPatch

QuizResponse
CreateQuizRequest
PatchQuizRequest

CreateQuizSessionRequest
CreateQuizSessionResponse
QuizSessionResponse
SubmitAnswerRequest
SubmitAnswerResponse
RevealAnswerRequest
RevealAnswerResponse
NextQuestionResponse
QuizResultResponse
```

---

# **10. Contract Change Rule**

After implementation starts, this document should not be changed casually.

If API shape changes:

```
1. Update docs/api-contract.md
2. Update backend schema
3. Update frontend API types
4. Run backend compile
5. Run frontend build
6. Commit with docs + code together
```

```
---

# 5. Local Verification & git

## 5.1 Confirm file changed

```bash
git diff -- docs/api-contract.md
```

Expected:

```
docs/api-contract.md contains API Contract v0
```
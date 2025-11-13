# Backend API Design - Metacognitive Learning Engine

**Comprehensive CRUD Design for All Routes**

---

## Overview

This document outlines the complete API design for the 6 main route files:

1. [userRoute.js](#1-userroute) - User authentication and profile management
2. [materialRoute.js](#2-materialroute) - Material upload and management
3. [chunkRoute.js](#3-chunkroute) - Chunk retrieval and statistics
4. [sessionRoute.js](#4-sessionroute) - Session management and resume functionality
5. [userResponseRoute.js](#5-userresponseroute) - Learning responses and progress
6. [userStatRoute.js](#6-userstatroute) - Analytics and insights

---

## Design Principles

**CRUD Operations Rationale:**
- **CREATE**: Needed when users generate new data (signup, upload, start session)
- **READ**: Needed for retrieving data to display (profile, materials, progress)
- **UPDATE**: Needed for modifying existing data (preferences, session progress)
- **DELETE**: Needed for removing data (account, materials)
- **OMIT**: Some operations are intentionally excluded (e.g., can't delete individual userResponses - data integrity)

---

## 1. userRoute

**Base Path:** `/api/users`

### Operations

#### CREATE - Register New User
```javascript
POST /api/users/register
```

**Why Needed:** Allow new users to create accounts

**Request Body:**
```json
{
  "email": "sarah.chen@example.com",
  "password": "demo1234",
  "name": "Sarah Chen"
}
```

**Logic:**
1. Validate email format and password strength
2. Check if email already exists (unique constraint)
3. Hash password with bcrypt
4. Create user document with default preferences
5. Initialize streak counters
6. Return JWT token for immediate login

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "sarah.chen@example.com",
    "name": "Sarah Chen",
    "preferences": {
      "defaultGoal": "explain",
      "defaultStrategy": "self-explain",
      "notificationsEnabled": true,
      "theme": "light"
    }
  }
}
```

---

#### CREATE - Login User
```javascript
POST /api/users/login
```

**Why Needed:** Authenticate existing users

**Request Body:**
```json
{
  "email": "sarah.chen@example.com",
  "password": "demo1234"
}
```

**Logic:**
1. Find user by email
2. Compare password hash
3. Update `lastLoginAt` timestamp
4. Update streak if applicable (check `lastActivityDate`)
5. Return JWT token

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { /* user object */ }
}
```

---

#### READ - Get User Profile
```javascript
GET /api/users/profile
```
**Auth Required:** Yes (JWT)

**Why Needed:** Display user profile, preferences, and streak info

**Logic:**
1. Extract userId from JWT token
2. Find user by _id
3. Exclude passwordHash from response
4. Return user profile

**Response:**
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "sarah.chen@example.com",
    "name": "Sarah Chen",
    "createdAt": "2024-10-01T08:00:00Z",
    "currentStreak": 5,
    "longestStreak": 12,
    "preferences": { /* ... */ }
  }
}
```

---

#### UPDATE - Update User Preferences
```javascript
PATCH /api/users/preferences
```
**Auth Required:** Yes

**Why Needed:** Allow users to customize their experience (default goal, strategy, theme)

**Request Body:**
```json
{
  "preferences": {
    "defaultGoal": "apply",
    "defaultStrategy": "connect",
    "theme": "dark",
    "notificationsEnabled": false
  }
}
```

**Logic:**
1. Validate preference values
2. Update only provided fields (partial update)
3. Return updated user object

---

#### UPDATE - Update Streak
```javascript
PATCH /api/users/streak
```
**Auth Required:** Yes

**Why Needed:** Maintain daily streak when user completes a chunk

**Request Body:**
```json
{
  "date": "2025-01-08T00:00:00Z"
}
```

**Logic:**
1. Get user's `lastActivityDate`
2. If date is consecutive day: increment `currentStreak`
3. If date is today (already updated): no change
4. If date is non-consecutive: reset `currentStreak` to 1
5. Update `longestStreak` if `currentStreak` exceeds it
6. Update `lastActivityDate`

**Response:**
```json
{
  "success": true,
  "currentStreak": 6,
  "longestStreak": 12
}
```

---

#### DELETE - Delete User Account
```javascript
DELETE /api/users/account
```
**Auth Required:** Yes

**Why Needed:** GDPR compliance - users have right to delete their data

**Request Body:**
```json
{
  "password": "demo1234",
  "confirmEmail": "sarah.chen@example.com"
}
```

**Logic:**
1. Verify password
2. Verify email matches
3. Delete user document
4. Delete all associated data:
   - materials (where userId matches)
   - sessions (where userId matches)
   - userResponses (where userId matches)
   - userStats (where userId matches)
   - chunks are NOT deleted (they belong to materials, which are deleted)
5. Return success

**Response:**
```json
{
  "success": true,
  "message": "Account successfully deleted"
}
```

---

## 2. materialRoute

**Base Path:** `/api/materials`

### Operations

#### CREATE - Upload New Material
```javascript
POST /api/materials
```
**Auth Required:** Yes

**Why Needed:** Allow users to upload learning content

**Request Body:**
```json
{
  "title": "Java Primitives vs Boxed Types",
  "rawContent": "In Java, primitives (int, double, boolean) are different from their boxed counterparts...",
  "subject": "programming",
  "difficulty": "intermediate"
}
```

**Logic:**
1. Extract userId from JWT
2. Validate title and rawContent (not empty)
3. Create material document with status: 'processing'
4. **Async:** Call LLM (Gemini) to generate chunks
5. When chunks generated:
   - Insert chunks into chunks collection
   - Update material status to 'ready'
   - Set totalChunks count
6. Return materialId immediately (chunks generation happens in background)

**Response:**
```json
{
  "success": true,
  "materialId": "507f1f77bcf86cd799439012",
  "status": "processing",
  "message": "Material uploaded. Generating chunks..."
}
```

---

#### READ - Get All User Materials
```javascript
GET /api/materials
```
**Auth Required:** Yes

**Why Needed:** Display user's library of uploaded materials

**Query Parameters:**
- `status` (optional): 'processing', 'ready', 'failed'
- `sort` (optional): 'newest', 'oldest', 'title'

**Logic:**
1. Find all materials where userId matches
2. Sort by createdAt descending (default)
3. Return array of materials

**Response:**
```json
{
  "success": true,
  "materials": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "title": "Java Primitives vs Boxed Types",
      "subject": "programming",
      "difficulty": "intermediate",
      "status": "ready",
      "totalChunks": 8,
      "estimatedTime": 12,
      "createdAt": "2025-01-05T10:00:00Z",
      "averageAccuracy": 78
    }
  ]
}
```

---

#### READ - Get Single Material Details
```javascript
GET /api/materials/:materialId
```
**Auth Required:** Yes

**Why Needed:** Display material details before starting a session

**Logic:**
1. Find material by _id
2. Verify userId matches (authorization)
3. Include chunk count and statistics
4. Return material details

**Response:**
```json
{
  "success": true,
  "material": {
    "_id": "507f1f77bcf86cd799439012",
    "title": "Java Primitives vs Boxed Types",
    "subject": "programming",
    "difficulty": "intermediate",
    "totalChunks": 8,
    "estimatedTime": 12,
    "status": "ready",
    "createdAt": "2025-01-05T10:00:00Z"
  }
}
```

---

#### READ - Check Material Processing Status
```javascript
GET /api/materials/:materialId/status
```
**Auth Required:** Yes

**Why Needed:** Poll for chunk generation completion (frontend can show progress)

**Response:**
```json
{
  "success": true,
  "status": "ready",
  "totalChunks": 8,
  "processedAt": "2025-01-05T10:02:30Z"
}
```

---

#### UPDATE - Update Material Metadata
```javascript
PATCH /api/materials/:materialId
```
**Auth Required:** Yes

**Why Needed:** Allow users to edit title, subject, or difficulty after upload

**Request Body:**
```json
{
  "title": "Java Primitives and Wrapper Classes",
  "subject": "programming",
  "difficulty": "basic"
}
```

**Logic:**
1. Find material by _id
2. Verify userId matches
3. Update only provided fields
4. Update `updatedAt` timestamp
5. Return updated material

---

#### DELETE - Delete Material
```javascript
DELETE /api/materials/:materialId
```
**Auth Required:** Yes

**Why Needed:** Allow users to remove materials they no longer need

**Logic:**
1. Find material by _id
2. Verify userId matches
3. Delete material document
4. **CASCADE DELETE:**
   - Delete all chunks where materialId matches
   - Delete all sessions where materialId matches
   - Delete all userResponses where materialId matches
   - Update userStats (decrement totals.materialsCompleted)
5. Return success

**Response:**
```json
{
  "success": true,
  "message": "Material and all associated data deleted"
}
```

**Question for you:** Should we allow material deletion if there are completed sessions? Or should we archive instead of delete?

---

## 3. chunkRoute

**Base Path:** `/api/chunks`

### Operations

#### READ - Get Chunks for Material
```javascript
GET /api/materials/:materialId/chunks
```
**Auth Required:** Yes

**Why Needed:** Load all chunks when starting a new session

**Logic:**
1. Find material by _id and verify userId matches
2. Find all chunks where materialId matches
3. Sort by chunkIndex ascending
4. Return array of chunks with all metacognitive fields

**Response:**
```json
{
  "success": true,
  "chunks": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "chunkIndex": 0,
      "topic": "Java == vs .equals()",
      "planPrompt": "Think for a moment: If you create two separate Integer objects...",
      "miniTeach": "In Java, == compares object identity...",
      "question": "Explain why two Integer objects...",
      "expectedPoints": ["...", "..."],
      "evaluationPrompt": "How confident are you...",
      "hints": ["...", "...", "..."],
      "example": "Integer a = new Integer(42);...",
      "difficulty": "intermediate",
      "prerequisites": ["Java Objects"],
      "tags": ["java", "comparison"]
    },
    { /* chunk 2 */ },
    { /* chunk 3 */ }
  ]
}
```

---

#### READ - Get Single Chunk
```javascript
GET /api/chunks/:chunkId
```
**Auth Required:** Yes

**Why Needed:** Load current chunk during learning session

**Logic:**
1. Find chunk by _id
2. Verify user has access (check materialId ownership)
3. Return chunk with all fields

**Response:**
```json
{
  "success": true,
  "chunk": { /* full chunk object */ }
}
```

---

#### READ - Get Chunk Statistics
```javascript
GET /api/chunks/:chunkId/stats
```
**Auth Required:** Yes (optional - for public materials)

**Why Needed:** Display how other learners performed on this chunk

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalAttempts": 127,
    "averageAccuracy": 76,
    "averageConfidence": 72,
    "averageCalibrationError": -4,
    "averageHintsUsed": 0.8,
    "commonMuddyPoints": [
      "Not sure when autoboxing happens",
      "Confused about object identity"
    ]
  }
}
```

---

#### UPDATE - Update Chunk Stats (Internal)
```javascript
PATCH /api/chunks/:chunkId/stats
```
**Auth Required:** Internal only (called by server after userResponse created)

**Why Needed:** Aggregate statistics from userResponses

**Logic:**
1. Calculate new averages from latest userResponse
2. Update chunk.stats object
3. Add to commonMuddyPoints if mentioned frequently

**Note:** This is an internal endpoint, not exposed to frontend directly.

---

#### No DELETE Operation
**Why:** Chunks belong to materials. Deleting a material cascades to delete its chunks. Individual chunk deletion doesn't make sense - it would break the learning sequence.

---

## 4. sessionRoute

**Base Path:** `/api/sessions`

### Operations

#### CREATE - Start New Session
```javascript
POST /api/sessions
```
**Auth Required:** Yes

**Why Needed:** Track when user starts learning a material

**Request Body:**
```json
{
  "materialId": "507f1f77bcf86cd799439012",
  "deviceType": "desktop"
}
```

**Logic:**
1. Get userId from JWT
2. Find material and get totalChunks count
3. Create session document:
   - status: 'in_progress'
   - chunksCompleted: 0
   - currentChunkIndex: 0
   - startedAt: now
4. Return sessionId

**Response:**
```json
{
  "success": true,
  "sessionId": "507f1f77bcf86cd799439015",
  "totalChunks": 8,
  "currentChunkIndex": 0
}
```

---

#### READ - Get Active Session
```javascript
GET /api/sessions/active
```
**Auth Required:** Yes

**Why Needed:** Resume functionality - find if user has an in-progress session

**Query Parameters:**
- `materialId` (optional): Filter by specific material

**Logic:**
1. Find sessions where userId matches AND status: 'in_progress'
2. Sort by startedAt descending (most recent first)
3. Return session with material info

**Response:**
```json
{
  "success": true,
  "session": {
    "_id": "507f1f77bcf86cd799439015",
    "materialId": "507f1f77bcf86cd799439012",
    "materialTitle": "Java Primitives vs Boxed Types",
    "status": "in_progress",
    "currentChunkIndex": 2,
    "chunksCompleted": 2,
    "totalChunks": 8,
    "startedAt": "2025-01-07T14:00:00Z",
    "sessionStats": {
      "averageAccuracy": 78.5,
      "totalTimeSeconds": 180
    }
  }
}
```

---

#### READ - Get Session History
```javascript
GET /api/sessions/history
```
**Auth Required:** Yes

**Why Needed:** Show user's past learning sessions

**Query Parameters:**
- `limit` (default: 10)
- `offset` (default: 0)
- `status` (optional): 'completed', 'paused'

**Logic:**
1. Find all sessions where userId matches
2. Sort by startedAt descending
3. Populate material titles
4. Apply pagination

**Response:**
```json
{
  "success": true,
  "sessions": [
    {
      "_id": "507f1f77bcf86cd799439015",
      "materialTitle": "Java Primitives vs Boxed Types",
      "status": "completed",
      "chunksCompleted": 8,
      "totalChunks": 8,
      "startedAt": "2025-01-07T14:00:00Z",
      "completedAt": "2025-01-07T14:30:00Z",
      "sessionStats": {
        "averageAccuracy": 82,
        "totalTimeSeconds": 720
      }
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 10,
    "offset": 0
  }
}
```

---

#### UPDATE - Update Session Progress
```javascript
PATCH /api/sessions/:sessionId/progress
```
**Auth Required:** Yes

**Why Needed:** Update session after each chunk completion

**Request Body:**
```json
{
  "currentChunkIndex": 3,
  "chunksCompleted": 3,
  "chunkStats": {
    "accuracy": 85,
    "confidence": 80,
    "calibrationError": -5,
    "strategy": "self-explain",
    "timeSeconds": 90,
    "hintsUsed": 0
  }
}
```

**Logic:**
1. Verify session belongs to user
2. Update currentChunkIndex and chunksCompleted
3. Update sessionStats (rolling averages):
   - Recalculate averageAccuracy
   - Recalculate averageConfidence
   - Increment strategiesUsed[strategy]
   - Add to totalTimeSeconds
4. If chunksCompleted === totalChunks:
   - Set status to 'completed'
   - Set completedAt timestamp
   - Update user streak
5. Return updated session

**Response:**
```json
{
  "success": true,
  "session": { /* updated session */ },
  "completed": false
}
```

---

#### UPDATE - Pause Session
```javascript
PATCH /api/sessions/:sessionId/pause
```
**Auth Required:** Yes

**Why Needed:** User explicitly pauses (closes browser without finishing)

**Logic:**
1. Update status to 'paused'
2. Keep currentChunkIndex for resume
3. Return success

---

#### UPDATE - Resume Session
```javascript
PATCH /api/sessions/:sessionId/resume
```
**Auth Required:** Yes

**Why Needed:** User clicks "Resume" button

**Logic:**
1. Update status to 'in_progress'
2. Return session with currentChunkIndex

---

#### DELETE - Cancel Session
```javascript
DELETE /api/sessions/:sessionId
```
**Auth Required:** Yes

**Why Needed:** User abandons a session and wants to start fresh

**Logic:**
1. Verify session belongs to user
2. Delete session document
3. **Keep userResponses** - they're still valuable data even if session was cancelled
4. Return success

**Response:**
```json
{
  "success": true,
  "message": "Session cancelled"
}
```

---

## 5. userResponseRoute

**Base Path:** `/api/responses`

### Operations

#### CREATE - Submit Chunk Response
```javascript
POST /api/responses
```
**Auth Required:** Yes

**Why Needed:** Save user's Plan-Monitor-Evaluate data after completing a chunk

**Request Body:**
```json
{
  "sessionId": "507f1f77bcf86cd799439015",
  "chunkId": "507f1f77bcf86cd799439013",
  "planPhase": {
    "priorKnowledge": "I think == compares the values?",
    "hasPriorKnowledge": true,
    "goal": "explain",
    "strategy": "self-explain",
    "customStrategyDescription": null,
    "timeSpentSeconds": 15
  },
  "monitorPhase": {
    "explanation": "Two Integer objects with the same value...",
    "confidence": 75,
    "muddiestPoint": "Not sure when autoboxing happens",
    "monitoringChecks": ["I can explain clearly", "This matches expectations"],
    "hintsRequested": [],
    "contentReviewed": false,
    "reviewCount": 0,
    "timeSpentSeconds": 85
  },
  "evaluatePhase": {
    "strategyEffectiveness": "helped-a-lot",
    "strategyReflection": "Explaining in my own words helped...",
    "effortLevel": "medium",
    "customEvalResponse": {
      "confidenceRating": 4,
      "memoryAid": "== asks 'same house?', .equals() asks 'same contents?'",
      "additionalThoughts": "Need to learn more about autoboxing"
    },
    "metGoal": "mostly",
    "nextChunkAdjustments": ["keep-same-strategy"],
    "timeSpentSeconds": 80
  }
}
```

**Logic:**
1. Get userId from JWT
2. Get chunkId from request and fetch chunk to get expectedPoints
3. **Calculate accuracy** by comparing monitorPhase.explanation to expectedPoints:
   - Use simple keyword matching or LLM for semantic comparison
   - Score 0-100 based on how many expectedPoints were covered
4. Calculate calibrationError: confidence - accuracy
5. Determine calibrationDirection: 'overconfident', 'underconfident', 'accurate'
6. Denormalize chunkTopic, chunkDifficulty, materialId for easier querying
7. Calculate totalTimeSeconds
8. Set completed: true, startedAt, completedAt
9. Create userResponse document
10. **Trigger updates:**
    - Update session progress (via sessionRoute PATCH)
    - Update chunk stats (increment totalAttempts, update averages)
    - Update userStats (incremental update)
11. Return response with calculated accuracy

**Response:**
```json
{
  "success": true,
  "responseId": "507f1f77bcf86cd799439016",
  "accuracy": 75,
  "calibrationError": 0,
  "calibrationDirection": "accurate",
  "correctPoints": [
    "== checks object identity (same memory location), not value equality",
    ".equals() compares the actual numeric values stored in the objects",
    "Bug occurs when expecting value comparison but == does identity comparison"
  ],
  "missingPoints": [
    "Autoboxing can hide this—Integer variables look like primitives but behave as objects"
  ],
  "feedback": {
    "message": "Great job! You captured 3 out of 4 key concepts.",
    "suggestion": "Consider exploring how autoboxing affects this behavior."
  }
}
```

---

#### READ - Get User's Responses for Material
```javascript
GET /api/responses/material/:materialId
```
**Auth Required:** Yes

**Why Needed:** Show user's learning history for a specific material

**Logic:**
1. Find all userResponses where userId and materialId match
2. Sort by completedAt descending
3. Return array with chunk topics and scores

**Response:**
```json
{
  "success": true,
  "responses": [
    {
      "_id": "507f1f77bcf86cd799439016",
      "chunkTopic": "Java == vs .equals()",
      "accuracy": 75,
      "confidence": 75,
      "calibrationError": 0,
      "strategy": "self-explain",
      "completedAt": "2025-01-07T14:03:00Z"
    },
    {
      "_id": "507f1f77bcf86cd799439017",
      "chunkTopic": "Autoboxing in Java",
      "accuracy": 82,
      "confidence": 70,
      "calibrationError": -12,
      "strategy": "self-explain",
      "completedAt": "2025-01-07T14:06:00Z"
    }
  ]
}
```

---

#### READ - Get Single Response Details
```javascript
GET /api/responses/:responseId
```
**Auth Required:** Yes

**Why Needed:** View full details of a past response (review what you wrote)

**Logic:**
1. Find userResponse by _id
2. Verify userId matches
3. Return full response object with all phases

**Response:**
```json
{
  "success": true,
  "response": {
    "_id": "507f1f77bcf86cd799439016",
    "chunkTopic": "Java == vs .equals()",
    "planPhase": { /* full plan data */ },
    "monitorPhase": { /* full monitor data */ },
    "evaluatePhase": { /* full evaluate data */ },
    "accuracy": 75,
    "completedAt": "2025-01-07T14:03:00Z"
  }
}
```

---

#### READ - Get Responses by Strategy
```javascript
GET /api/responses/strategy/:strategyName
```
**Auth Required:** Yes

**Why Needed:** Analyze how a specific strategy performed across all materials

**Logic:**
1. Find all userResponses where userId matches AND planPhase.strategy === strategyName
2. Calculate aggregates (avg accuracy, confidence, calibration)
3. Return responses + summary stats

**Response:**
```json
{
  "success": true,
  "strategy": "self-explain",
  "responses": [ /* array of responses */ ],
  "summary": {
    "timesUsed": 15,
    "avgAccuracy": 85,
    "avgConfidence": 82,
    "avgCalibration": -3
  }
}
```

---

#### No UPDATE Operation
**Why:** UserResponses are immutable records - they represent a specific learning attempt at a specific time. Editing them would corrupt the data integrity.

---

#### No DELETE Operation
**Why:** UserResponses are the foundation of all analytics. Deleting individual responses would:
- Break calibration trends
- Corrupt strategy statistics
- Violate data integrity

If user deletes their account, all userResponses are deleted. If user deletes a material, associated userResponses are deleted. But individual deletion doesn't make sense.

**Question for you:** Should we allow users to "flag" a response as "practice/test" that doesn't count toward stats?

---

## 6. userStatRoute

**Base Path:** `/api/stats`

### Operations

#### READ - Get User's Overall Stats
```javascript
GET /api/stats
```
**Auth Required:** Yes

**Why Needed:** Display insights dashboard

**Logic:**
1. Find userStats document where userId matches
2. If not exists, calculate fresh from userResponses (first time)
3. Return full stats object

**Response:**
```json
{
  "success": true,
  "stats": {
    "strategyStats": { /* all strategy performance */ },
    "calibration": { /* calibration trends */ },
    "goals": { /* goal achievement */ },
    "patterns": { /* learning patterns */ },
    "metacognitiveMaturity": { /* maturity scores */ },
    "totals": {
      "chunksCompleted": 40,
      "sessionsCompleted": 5,
      "materialsCompleted": 2,
      "totalLearningTimeSeconds": 3600
    },
    "updatedAt": "2025-01-07T15:00:00Z"
  }
}
```

---

#### READ - Get Strategy Comparison
```javascript
GET /api/stats/strategies
```
**Auth Required:** Yes

**Why Needed:** Show which strategies work best for this user

**Query Parameters:**
- `subject` (optional): Filter by subject
- `difficulty` (optional): Filter by difficulty
- `goal` (optional): Filter by goal

**Logic:**
1. Get userStats.strategyStats
2. If filters provided, return filtered subsection (e.g., bySubject.programming)
3. Sort strategies by avgAccuracy descending
4. Return ranked list

**Response:**
```json
{
  "success": true,
  "strategies": [
    {
      "strategy": "connect",
      "avgAccuracy": 90,
      "avgConfidence": 85,
      "timesUsed": 7,
      "recommendation": "Your best strategy overall!"
    },
    {
      "strategy": "teach",
      "avgAccuracy": 88,
      "avgConfidence": 80,
      "timesUsed": 3,
      "recommendation": "Strong performance"
    },
    {
      "strategy": "self-explain",
      "avgAccuracy": 85,
      "avgConfidence": 82,
      "timesUsed": 15,
      "recommendation": "Your most-used strategy"
    }
  ]
}
```

---

#### READ - Get Calibration Trend
```javascript
GET /api/stats/calibration
```
**Auth Required:** Yes

**Why Needed:** Show user's calibration improvement over time

**Query Parameters:**
- `limit` (default: 30): Number of recent chunks to include

**Logic:**
1. Get userStats.calibration.history
2. Slice last N entries
3. Return trend data for charting

**Response:**
```json
{
  "success": true,
  "calibration": {
    "overallAvgError": -6,
    "trend": "improving",
    "percentile": 65,
    "history": [
      { "timestamp": "2025-01-07T14:03:00Z", "predicted": 75, "actual": 75, "error": 0 },
      { "timestamp": "2025-01-07T14:06:00Z", "predicted": 70, "actual": 82, "error": -12 }
    ]
  }
}
```

---

#### READ - Get Weak Topics
```javascript
GET /api/stats/weak-topics
```
**Auth Required:** Yes

**Why Needed:** Recommend what to review or practice

**Logic:**
1. Query userStats.patterns.weakTopics
2. For each weak topic, get associated chunks
3. Calculate how many times attempted and avg accuracy
4. Return topics sorted by lowest accuracy

**Response:**
```json
{
  "success": true,
  "weakTopics": [
    {
      "topic": "Java Generics",
      "avgAccuracy": 58,
      "attempts": 4,
      "recommendation": "Consider revisiting this topic with 'visualize' strategy"
    },
    {
      "topic": "Concurrency",
      "avgAccuracy": 62,
      "attempts": 3,
      "recommendation": "Try 'example' strategy - it worked well for similar topics"
    }
  ]
}
```

---

#### READ - Get Metacognitive Maturity
```javascript
GET /api/stats/maturity
```
**Auth Required:** Yes

**Why Needed:** Show user's metacognitive development progress

**Response:**
```json
{
  "success": true,
  "maturity": {
    "level": "intermediate",
    "overallScore": 75,
    "scores": {
      "calibrationAccuracy": 65,
      "strategyDiversity": 75,
      "selfMonitoring": 80,
      "helpSeeking": 70,
      "goalAlignment": 85
    },
    "nextMilestone": {
      "level": "advanced",
      "requiredScore": 80,
      "suggestions": [
        "Improve calibration accuracy by 10 points",
        "Try using 'teach' strategy more often (only 3 attempts so far)"
      ]
    },
    "lastCalculated": "2025-01-07T15:00:00Z"
  }
}
```

---

#### UPDATE - Recalculate Stats (Internal)
```javascript
POST /api/stats/recalculate
```
**Auth Required:** Internal only (scheduled job or manual trigger)

**Why Needed:** Refresh userStats from userResponses (weekly job or after major changes)

**Logic:**
1. Get userId from request
2. Fetch all userResponses for user
3. Aggregate all statistics:
   - Strategy performance by context
   - Calibration history
   - Goal achievements
   - Custom strategies
   - Metacognitive maturity scores
4. Upsert userStats document
5. Return success

**Note:** This is typically run by a scheduled job, not called by frontend.

---

#### No DELETE Operation
**Why:** UserStats is derived from userResponses. If you delete userStats, it can be recalculated. Deletion happens automatically when user deletes account.

---

## Additional Endpoints (Bonus)

### Analytics Endpoints

#### GET /api/stats/recommendations
**Why Needed:** Provide personalized strategy recommendations

**Logic:**
1. Analyze userStats.strategyStats
2. Consider current context (goal, subject, difficulty)
3. Apply rule-based logic:
   - If goal is 'explain' and programming: recommend 'self-explain' or 'teach'
   - If goal is 'apply': recommend 'example' or 'connect'
   - If user has high calibration error: recommend 'self-explain' (promotes awareness)
   - If user has used same strategy >10 times: suggest trying a different one
4. Return top 2-3 recommendations with reasoning

**Response:**
```json
{
  "success": true,
  "recommendations": [
    {
      "strategy": "connect",
      "reason": "You achieve 90% accuracy when connecting concepts to prior knowledge",
      "confidence": "high"
    },
    {
      "strategy": "teach",
      "reason": "Works great for 'explain' goals, but you've only tried it 3 times - worth exploring!",
      "confidence": "medium"
    }
  ]
}
```

---

#### GET /api/stats/insights
**Why Needed:** Surface interesting patterns and achievements

**Logic:**
1. Analyze userStats for notable patterns:
   - Streak achievements ("5 days in a row!")
   - Calibration improvements ("Your calibration improved 15% this week!")
   - Strategy discoveries ("'connect' works 12% better than your usual strategy")
   - Weak topic conquests ("You improved from 60% to 85% on Generics!")
2. Return as friendly notifications

**Response:**
```json
{
  "success": true,
  "insights": [
    {
      "type": "achievement",
      "icon": "🔥",
      "message": "5-day streak! Keep it up!",
      "importance": "high"
    },
    {
      "type": "discovery",
      "icon": "💡",
      "message": "Your 'connect' strategy has 90% accuracy—your best performer!",
      "importance": "medium"
    },
    {
      "type": "improvement",
      "icon": "📈",
      "message": "Calibration improved by 8% this week. You're getting better at knowing what you know!",
      "importance": "medium"
    }
  ]
}
```

---

## Error Handling

### Standard Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "MATERIAL_NOT_FOUND",
    "message": "Material with ID 507f1f77bcf86cd799439012 not found",
    "statusCode": 404
  }
}
```

### Error Codes
- **Authentication Errors:**
  - `AUTH_REQUIRED` (401): Missing or invalid JWT token
  - `INVALID_CREDENTIALS` (401): Wrong email/password
  - `EMAIL_EXISTS` (409): Email already registered

- **Authorization Errors:**
  - `FORBIDDEN` (403): User doesn't own this resource

- **Validation Errors:**
  - `VALIDATION_ERROR` (400): Invalid input data
  - `MISSING_FIELD` (400): Required field not provided

- **Not Found Errors:**
  - `USER_NOT_FOUND` (404)
  - `MATERIAL_NOT_FOUND` (404)
  - `CHUNK_NOT_FOUND` (404)
  - `SESSION_NOT_FOUND` (404)

- **Server Errors:**
  - `CHUNK_GENERATION_FAILED` (500): LLM failed to generate chunks
  - `DATABASE_ERROR` (500): MongoDB operation failed

---

## Middleware

### 1. Authentication Middleware
```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');

async function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]; // "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({
      success: false,
      error: { code: 'AUTH_REQUIRED', message: 'Authentication required' }
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId; // Attach userId to request
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' }
    });
  }
}
```

### 2. Validation Middleware
```javascript
// middleware/validate.js
const { body, validationResult } = require('express-validator');

const validateRegistration = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('name').trim().isLength({ min: 1 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', errors: errors.array() }
      });
    }
    next();
  }
];
```

### 3. Rate Limiting
```javascript
// middleware/rateLimit.js
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: { success: false, error: { code: 'RATE_LIMIT', message: 'Too many requests' } }
});
```

---

## Questions for You

Before implementing, I need clarification on:

1. **Material Deletion:** Should we allow deleting materials with completed sessions? Or require archiving instead?

2. **Response Flagging:** Should users be able to mark certain responses as "practice" that don't count toward stats?

3. **Accuracy Calculation:** Should we use:
   - Simple keyword matching (fast, less accurate)
   - LLM semantic comparison (slow, more accurate)
   - Hybrid (keywords + LLM for ambiguous cases)

4. **Session Resumption:** Should users be able to resume sessions after a certain time period (e.g., 24 hours), or indefinitely?

5. **Multiple Active Sessions:** Should users be allowed to have multiple in-progress sessions (different materials), or only one at a time?

6. **Stats Recalculation:** Should we:
   - Update incrementally after each chunk (faster, but potential drift)
   - Recalculate fully from userResponses weekly (slower, but accurate)
   - Hybrid (incremental + weekly full refresh)

7. **Public Materials:** In the future, should users be able to share materials publicly? This would affect authorization logic.

8. **Chunk Regeneration:** Should users be able to trigger re-generation of chunks from existing materials (if they're unhappy with LLM output)?

---

## Next Steps

Once you answer these questions, I can:

1. Implement the actual route files with MongoDB queries
2. Set up authentication middleware
3. Create validation schemas
4. Build the chunk generation service (LLM integration)
5. Create the stats calculation service
6. Write integration tests

---

## Summary

This design provides:

✅ **Complete CRUD coverage** - All necessary operations for 6 route files
✅ **Clear rationale** - Every operation justified with "Why Needed"
✅ **Detailed logic** - Step-by-step flow for complex operations
✅ **Sample data integration** - Using sampleData.json structure
✅ **Error handling** - Comprehensive error codes and responses
✅ **Authorization** - Proper ownership checks throughout
✅ **Cascading operations** - Material deletion cascades properly
✅ **Intentional omissions** - No DELETE for userResponses (explained why)
✅ **Bonus features** - Recommendations and insights endpoints

**Ready to implement once you clarify the 8 questions above!**

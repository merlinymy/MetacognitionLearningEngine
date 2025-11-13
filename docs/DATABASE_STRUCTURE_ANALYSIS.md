# Metacognition Learning Engine - Complete Data Structure Analysis

## Executive Summary

The database currently has a **DESIGN-REALITY GAP**:
- **Designed Schema** (DATABASE_SCHEMA.md): Comprehensive multi-phase model (Plan-Monitor-Evaluate) with detailed analytics
- **Actual Implementation** (routes): Simplified flat structure capturing only core metrics

This analysis covers both what is DESIGNED and what is CURRENTLY IMPLEMENTED.

---

## Current Database Collections

### 1. SESSIONS Collection

**Purpose**: Track learning sessions (set of chunks completed in one sitting)

**Currently Stored** (userResponseRoute.js & sessionRoute.js):

```javascript
{
  _id: ObjectId,
  userId: String or ObjectId,
  rawContent: String,
  contentPreview: String,
  createdAt: Date,
  completedAt: Date | null,
  status: String,  // 'in_progress', 'completed'
  chunks: [{
    chunkId: String,
    topic: String,
    miniTeach: String,
    question: String,
    expectedPoints: [String],
    completed: Boolean
  }],
  sessionStats: {
    totalChunks: Number,
    chunksCompleted: Number,
    averageAccuracy: Number,      // Calculated & stored
    averageConfidence: Number,    // Calculated & stored
    calibrationError: Number,     // Calculated & stored
    totalTimeSeconds: Number      // Initialized but not updated
  }
}
```

**Designed but NOT Implemented**:
- `materialId` (reference to materials collection)
- `currentChunkIndex` (for resuming sessions)
- `deviceType` (mobile/tablet/desktop)
- `sessionStats.strategiesUsed` (count per strategy) - CRITICAL MISSING
- `sessionStats.totalHintsUsed`
- `sessionStats.contentReviewCount`

**Analysis**:
- Basic structure is in place
- Stats are CALCULATED on-demand from responses collection, not aggregated
- No tracking of individual strategies per session
- Time tracking initialized but never updated

---

### 2. RESPONSES Collection

**Purpose**: Store detailed response data for each chunk attempt (the "goldmine" of data)

**Currently Stored** (userResponseRoute.js lines 94-117):

```javascript
{
  _id: ObjectId,
  sessionId: ObjectId,
  userId: String or ObjectId,
  chunkId: String,
  chunkTopic: String,
  
  // PLAN PHASE
  goal: String,           // 'gist', 'explain', 'apply'
  strategy: String,       // User's metacognitive strategy
  planTimestamp: Date,
  
  // MONITOR PHASE
  question: String,
  userAnswer: String,     // The user's response
  confidence: Number,     // 0-100 confidence rating
  monitorTimestamp: Date,
  
  // EVALUATE PHASE
  expectedPoints: [String],
  correctPoints: [String],
  missingPoints: [String],
  accuracy: Number,       // 0-100, calculated by LLM
  calibrationError: Number,
  calibrationDirection: String,  // 'overconfident', 'underconfident', 'accurate'
  feedback: String,       // LLM-generated feedback
  evaluateTimestamp: Date,
  
  // METADATA
  strategyHelpful: Boolean | null,  // User's reflection on strategy
  createdAt: Date,
  timeSpentSeconds: Number          // Initialized but not used
}
```

**Designed but NOT Implemented** (from DATABASE_SCHEMA.md):
- Complete `planPhase` object with:
  - `priorKnowledge` (user's initial thoughts)
  - `hasPriorKnowledge` (boolean)
  - `customStrategyDescription` (for 'other' strategies)
  - `timeSpentSeconds` (tracked per phase)
  
- Complete `monitorPhase` object with:
  - `explanation` (more detailed than userAnswer)
  - `wordCount`
  - `muddiestPoint` (what's unclear)
  - `monitoringChecks` (checklist items)
  - `hintsRequested` (which hints used)
  - `hintsUsedCount`
  - `contentReviewed` (bool)
  - `reviewCount` (how many times re-read)
  
- Complete `evaluatePhase` object with:
  - `metGoal` ('completely', 'mostly', 'partially', 'not-really')
  - `goalAchievementScore` (0-100)
  - `strategyEffectiveness` ('helped-a-lot', 'somewhat-helped', 'didnt-help')
  - `strategyReflection` (WHY it helped/didn't) - CRITICAL FOR LEARNING
  - `effortLevel` ('low', 'medium', 'high')
  - `customEvalResponse` (confidence rating, memory aid, thoughts)
  - `nextChunkAdjustments` (planning for next)
  - `timeSpentSeconds` (tracked per phase)
  
- `totalTimeSeconds` (sum of all phases)
- `completed` (true if all phases done)
- `startedAt`, `completedAt` timestamps

**Analysis**:
- Current: Flat, single-level structure
- Designed: Hierarchical phase-based structure (Plan-Monitor-Evaluate)
- Missing: Roughly 70% of the designed response metadata
- Impact: Cannot track user's reasoning process, hints sought, content review, goal achievement nuance

---

### 3. NOT IMPLEMENTED: userStats Collection

**Designed For**: Aggregated analytics (pre-calculated for performance)

**Status**: NOT IMPLEMENTED in current codebase

**Would Include**:
- Strategy effectiveness broken down by:
  - Overall performance
  - By subject
  - By difficulty level
  - By goal type
- Calibration tracking:
  - Overall error trend
  - Historical trend (last 30 chunks)
  - By difficulty
  - Percentile vs. all users
- Goal achievement rates
- Learning patterns:
  - Preferred strategy
  - Preferred goal
  - Hints requested rate
  - Content review rate
  - Strong/weak subjects
  - Strong/weak topics
- Custom strategies user has created
- Metacognitive maturity level with subscores

**Current Workaround**: Stats calculated ad-hoc in `sessionRoute.js` lines 223-250

---

### 4. NOT IMPLEMENTED: materials, chunks, users Collections

These are designed but not actively created/used in current implementation.

**materials** would track:
- Uploaded learning materials metadata
- Subject, difficulty, estimated time
- Completion statistics

**chunks** would store:
- Individual chunks with all support content (hints, examples)
- Chunk-level statistics (aggregated from responses)

**users** would store:
- User profiles, preferences, streaks

---

## Data Fields Currently Being Captured

### Response-Level Data (What IS Collected)

1. **Identifiers**
   - sessionId, userId, chunkId, chunkTopic

2. **Planning Data**
   - goal (3 levels)
   - strategy (6 main + 'other')

3. **Monitoring Data**
   - userAnswer (the response text)
   - confidence (0-100)
   - planTimestamp, monitorTimestamp, evaluateTimestamp

4. **Evaluation Data**
   - accuracy (0-100, LLM-calculated)
   - correctPoints, missingPoints
   - calibrationError (confidence - accuracy)
   - calibrationDirection
   - feedback (LLM-generated)
   - strategyHelpful (nullable boolean for later reflection)

5. **Context**
   - timestamps (createdAt + phase timestamps)
   - timeSpentSeconds (field exists but not populated)

### Session-Level Data (What IS Collected)

1. **Session Metadata**
   - userId, createdAt, completedAt, status
   - contentPreview, rawContent

2. **Progress Tracking**
   - chunks array with completion status
   - chunksCompleted count
   - totalChunks count

3. **Aggregated Stats**
   - averageAccuracy (calculated from responses)
   - averageConfidence (calculated from responses)
   - calibrationError (calculated from responses)

---

## Data Fields Designed but NOT Captured

### Critical Missing Response Data

1. **Prior Knowledge Activation**
   - User's initial thoughts on the topic
   - Boolean: "do you have prior knowledge?"

2. **Help-Seeking Behavior**
   - Which hints were requested (0, 1, 2)
   - How many times hints were viewed
   - Whether content was re-read
   - How many times content was reviewed

3. **Self-Monitoring Data**
   - "What's your muddiest point?" (confusions)
   - Checklist items user marked as understood
   - Explicit metacognitive self-checks

4. **Goal Achievement Nuance**
   - Did user feel they "completely", "mostly", "partially" or "not really" achieved goal
   - Numerical achievement score (0-100)

5. **Strategy Reflection** (MOST CRITICAL)
   - User's explanation of WHY strategy helped/didn't
   - Effort level estimate (low/medium/high)
   - Custom evaluative response (confidence rating, memory aids)
   - Next chunk adjustments user plans

6. **Time Tracking**
   - Time spent in PLAN phase
   - Time spent in MONITOR phase
   - Time spent in EVALUATE phase
   - (Currently only total is initialized but never updated)

### Critical Missing Session Data

1. **Strategy Usage Breakdown**
   - Count of each strategy used per session
   - e.g., { 'self-explain': 5, 'visualize': 3, 'example': 2 }

2. **Help Seeking Patterns**
   - Total hints used in session
   - Content review events in session

3. **Device/Context**
   - Device type (mobile/tablet/desktop)
   - Session context

---

## Data Currently Being Used vs. Unused

### ACTIVELY USED

**In Responses**:
- `sessionId` - for querying session's responses
- `userId` - for user analytics
- `chunkId` - for chunk-level stats
- `strategy` - for strategy performance analysis
- `goal` - for goal-specific analytics
- `accuracy` - for performance metrics
- `confidence` - for calibration analysis
- `calibrationError` & `calibrationDirection` - for calibration tracking
- `feedback` - displayed to user after submission
- `strategyHelpful` - for strategy effectiveness reflection

**In Sessions**:
- `userId` - for querying user's sessions
- `status` - for filtering active/completed sessions
- `chunks.completed` - for session progress
- `sessionStats.chunksCompleted` - for progress UI
- `sessionStats.averageAccuracy` - for summary stats
- `sessionStats.averageConfidence` - for summary stats
- `sessionStats.calibrationError` - for summary stats
- `createdAt`, `completedAt` - for sorting/filtering

### STORED BUT NOT USED

- `timeSpentSeconds` (responses) - field exists but never updated or queried
- `totalTimeSeconds` (sessions planned) - not calculated
- `planTimestamp`, `monitorTimestamp`, `evaluateTimestamp` - stored but not analyzed
- `expectedPoints`, `correctPoints`, `missingPoints` - stored but only feedback returned to user
- `userAnswer` - stored but not indexed/searched
- `question` - stored but not analyzed
- `chunkTopic` - stored but not aggregated

### NOT IMPLEMENTED (Designed but Missing)

All the detailed response structure fields mentioned above are not collected.

---

## Current Data Model Structure

### Actual Schema (Flattened)

```
responses collection (FLAT structure)
├── Metadata
│   ├── _id (ObjectId)
│   ├── sessionId (ObjectId)
│   ├── userId (String|ObjectId)
│   ├── chunkId (String)
│   └── chunkTopic (String)
├── Planning
│   ├── goal
│   ├── strategy
│   └── planTimestamp
├── Monitoring
│   ├── question
│   ├── userAnswer
│   ├── confidence
│   ├── monitorTimestamp
│   ├── expectedPoints []
│   ├── correctPoints []
│   └── missingPoints []
├── Evaluation
│   ├── accuracy
│   ├── calibrationError
│   ├── calibrationDirection
│   ├── feedback
│   ├── evaluateTimestamp
│   └── strategyHelpful (nullable)
└── Timestamps
    ├── createdAt
    ├── timeSpentSeconds (unused)
    └── (phase-level timing missing)

sessions collection
├── Metadata
│   ├── _id (ObjectId)
│   ├── userId
│   ├── status
│   ├── createdAt
│   └── completedAt
├── Content
│   ├── rawContent
│   ├── contentPreview
│   └── chunks []
└── Stats
    └── sessionStats
        ├── totalChunks
        ├── chunksCompleted
        ├── averageAccuracy
        ├── averageConfidence
        ├── calibrationError
        └── totalTimeSeconds (unused)
```

### Designed Schema (Hierarchical)

```
responses collection (PHASE-BASED structure)
├── Metadata
├── planPhase (object)
│   ├── priorKnowledge
│   ├── hasPriorKnowledge
│   ├── goal
│   ├── strategy
│   ├── customStrategyDescription
│   ├── timeSpentSeconds
│   └── timestamp
├── monitorPhase (object)
│   ├── explanation
│   ├── wordCount
│   ├── confidence
│   ├── muddiestPoint
│   ├── monitoringChecks []
│   ├── hintsRequested []
│   ├── hintsUsedCount
│   ├── contentReviewed
│   ├── reviewCount
│   ├── timeSpentSeconds
│   └── timestamp
├── evaluatePhase (object)
│   ├── accuracy
│   ├── correctPoints []
│   ├── missingPoints []
│   ├── calibrationError
│   ├── calibrationDirection
│   ├── metGoal
│   ├── goalAchievementScore
│   ├── strategyEffectiveness
│   ├── strategyReflection ⭐ (MOST IMPORTANT)
│   ├── effortLevel
│   ├── customEvalResponse
│   ├── nextChunkAdjustments []
│   ├── timeSpentSeconds
│   └── timestamp
└── Overall
    ├── totalTimeSeconds
    ├── completed
    ├── startedAt
    └── completedAt
```

---

## Aggregation Queries Currently Used

### In sessionRoute.js (lines 217-250)

1. **Calculate Session Stats** (from responses):
   ```javascript
   responses.reduce((sum, r) => sum + r.accuracy, 0) / totalResponses
   responses.reduce((sum, r) => sum + r.confidence, 0) / totalResponses
   ```

2. **Strategy Performance per Session**:
   ```javascript
   // Groups by strategy, calculates average accuracy per strategy
   const strategyMap = {};
   responses.forEach((r) => {
     if (!strategyMap[r.strategy]) {
       strategyMap[r.strategy] = { totalAccuracy: 0, count: 0 };
     }
     strategyMap[r.strategy].totalAccuracy += r.accuracy;
     strategyMap[r.strategy].count += 1;
   });
   ```

### Aggregation Queries NOT Implemented

From DATABASE_SCHEMA.md, these queries are designed but not built:

1. **User's Best Strategy for a Goal** - Would need strategyStats in userStats
2. **Calibration Trend** - Would need historical calibration data
3. **Find Weak Topics** - Would group by chunkTopic, calculate avg accuracy
4. **Strategy Effectiveness by Subject** - Would need $lookup to materials collection

---

## Summary Table: Captured vs. Designed

| Data Category | Current Implementation | Designed | Gap |
|---|---|---|---|
| **Response Metadata** | Flat structure | Hierarchical Plan-Monitor-Evaluate | High |
| **Prior Knowledge** | Not captured | Text + boolean | Critical |
| **Help-Seeking** | Not captured | Hints array, review count | Critical |
| **Self-Monitoring** | Not captured | Muddy points, checklist | High |
| **Goal Reflection** | Not captured | Achievement level + score | High |
| **Strategy Reflection** | Not captured | User explanation + effectiveness | **Most Critical** |
| **Time Tracking** | Initialized but unused | Per-phase tracking | High |
| **Session Strategy Stats** | Calculated ad-hoc | Stored in sessionStats | Medium |
| **User Stats Collection** | None (calculated per query) | userStats collection | High |
| **Chunk Stats** | Not calculated | In chunks collection | Medium |

---

## Key Insights

1. **MVP vs. Full Design**: Current implementation is an MVP version capturing essential metrics but missing the rich reflective data that makes metacognitive learning powerful.

2. **Strategy Effectiveness**: The most critical missing piece is `strategyReflection` - the user's explanation of why a strategy worked or didn't. This is essential for genuine metacognitive growth.

3. **Aggregation Strategy**: Currently doing ad-hoc calculations. The designed `userStats` collection would make dashboards/analytics much faster.

4. **Time Tracking Not Used**: Infrastructure for time tracking exists but no logic populates it.

5. **Help-Seeking Invisible**: No tracking of hints used, content reviewed, or attempts to self-correct before submitting.

6. **Goal Achievement Nuanced**: Binary success (accuracy) vs. designed approach (goal alignment + achievement level + reflection).

---

## Recommendations

### Short Term (MVP Fixes)
1. Actually populate `timeSpentSeconds` fields
2. Start collecting `strategyHelpful` reflection text, not just boolean
3. Track basic hint usage

### Medium Term (Richer Data)
1. Implement hierarchical response structure (planPhase/monitorPhase/evaluatePhase objects)
2. Add strategy reflection prompt and storage
3. Implement basic userStats aggregation

### Long Term (Full Design)
1. Implement all designed fields
2. Build userStats pipeline for analytics
3. Add chunks and materials collection support
4. Implement user preferences and streak tracking


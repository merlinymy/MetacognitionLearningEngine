# Data Structure Quick Reference Guide

## At a Glance: What's Currently Stored

### RESPONSES Collection (Per User Answer)

**Currently Captured** (25 fields):
```
_id, sessionId, userId, chunkId, chunkTopic
goal, strategy, planTimestamp
question, userAnswer, confidence, monitorTimestamp
expectedPoints[], correctPoints[], missingPoints[]
accuracy, calibrationError, calibrationDirection, feedback, evaluateTimestamp
strategyHelpful, createdAt, timeSpentSeconds
```

**NOT Captured** (but designed - 40+ fields):
- priorKnowledge, hasPriorKnowledge (prior activation)
- explanation, wordCount, muddiestPoint, monitoringChecks[], hintsRequested[], hintsUsedCount, contentReviewed, reviewCount (monitoring details)
- metGoal, goalAchievementScore, strategyEffectiveness, strategyReflection, effortLevel, customEvalResponse, nextChunkAdjustments[] (evaluation reflection)
- totalTimeSeconds, completed, startedAt, completedAt (overall tracking)

### SESSIONS Collection (Per Learning Session)

**Currently Captured** (15 fields):
```
_id, userId, rawContent, contentPreview
createdAt, completedAt, status
chunks[] (with chunkId, topic, miniTeach, question, expectedPoints[], completed)
sessionStats: {totalChunks, chunksCompleted, averageAccuracy, averageConfidence, calibrationError, totalTimeSeconds}
```

**NOT Captured** (but designed - 10+ fields):
- materialId, currentChunkIndex (resuming)
- deviceType (context)
- strategiesUsed {}, totalHintsUsed, contentReviewCount (session-level aggregations)

---

## The 3 Big Gaps

### 1. Strategy Reflection (MOST CRITICAL)
**What's Missing**: User explanation of WHY strategy worked/didn't
**Where Needed**: evaluatePhase.strategyReflection
**Impact**: Can't understand learning growth or strategy effectiveness

### 2. Help-Seeking Behavior (CRITICAL)
**What's Missing**: Hints used, content reviews, self-corrections
**Where Needed**: monitorPhase.{hintsRequested, hintsUsedCount, contentReviewed, reviewCount}
**Impact**: Can't see learning process, only final answer

### 3. Phase-Level Time Tracking (IMPORTANT)
**What's Missing**: Time breakdown: Plan vs Monitor vs Evaluate
**Where Needed**: Each phase has timeSpentSeconds
**Impact**: Can't optimize which phases need support

---

## Data Being Used vs Unused

### HEAVILY USED (Building Features Around These)
- accuracy (final performance)
- confidence + calibrationError (metacognitive awareness)
- strategy (strategy effectiveness analysis)
- goal (goal-specific analytics)
- feedback (shown to user)

### STORED BUT UNUSED
- timeSpentSeconds, totalTimeSeconds (fields exist, no logic)
- planTimestamp, monitorTimestamp, evaluateTimestamp (stored, not analyzed)
- expectedPoints, correctPoints, missingPoints (only feedback extracted)
- userAnswer (not indexed/searched)
- chunkTopic (not aggregated for weak topics)

### NOT IMPLEMENTED
- All 70% of designed reflection fields
- userStats collection (would speed up analytics 10x)
- materials, chunks, users collections
- Aggregation pipelines (doing ad-hoc JS calculations instead)

---

## Collections Not Yet Implemented

### userStats (Pre-calculated Analytics)
**Status**: Designed but NOT built
**Purpose**: Fast queries for dashboards
**Would Include**:
- Strategy effectiveness by goal/subject/difficulty
- Calibration trending
- Goal achievement rates
- Learning patterns
- Metacognitive maturity score

**Current Workaround**: Calculate on-demand from responses (slow)

### materials
**Status**: Designed but NOT built
**Includes**: Learning material metadata, subject, difficulty, completion stats

### chunks
**Status**: Designed but NOT built
**Includes**: Individual chunks with hints, examples, stats

### users
**Status**: Designed but NOT built
**Includes**: User profiles, preferences, streaks

---

## Actual vs Designed Response Structure

### Current (FLAT):
```javascript
{
  _id, sessionId, userId, chunkId, chunkTopic,
  goal, strategy, planTimestamp,
  question, userAnswer, confidence, monitorTimestamp,
  expectedPoints[], correctPoints[], missingPoints[],
  accuracy, calibrationError, calibrationDirection, feedback, evaluateTimestamp,
  strategyHelpful, createdAt, timeSpentSeconds
}
```

### Designed (HIERARCHICAL):
```javascript
{
  _id, sessionId, userId, chunkId, chunkTopic,
  planPhase: { priorKnowledge, hasPriorKnowledge, goal, strategy, timeSpentSeconds, timestamp },
  monitorPhase: { explanation, wordCount, confidence, muddiestPoint, monitoringChecks[], hintsRequested[], contentReviewed, reviewCount, timeSpentSeconds, timestamp },
  evaluatePhase: { accuracy, correctPoints[], missingPoints[], calibrationError, calibrationDirection, metGoal, goalAchievementScore, strategyEffectiveness, strategyReflection, effortLevel, customEvalResponse, nextChunkAdjustments[], timeSpentSeconds, timestamp },
  totalTimeSeconds, completed, startedAt, completedAt
}
```

---

## Currently Used Aggregation Queries

### 1. Session Average Accuracy
```javascript
responses.reduce((sum, r) => sum + r.accuracy, 0) / totalResponses
```
Location: sessionRoute.js line 226

### 2. Session Average Confidence
```javascript
responses.reduce((sum, r) => sum + r.confidence, 0) / totalResponses
```
Location: sessionRoute.js line 230

### 3. Strategy Performance (in-memory grouping)
```javascript
// Groups responses by strategy, calculates avg accuracy per strategy
strategyMap[strategy].totalAccuracy += accuracy
strategyMap[strategy].count += 1
```
Location: sessionRoute.js lines 236-242

### Queries NOT Built (But Designed)
- User's best strategy for each goal type
- Calibration trend over time
- Weak topics analysis
- Strategy effectiveness by subject
- Metacognitive maturity calculation

---

## Field Mapping: Current to Designed

| Current Field | Designed Location | Usage |
|---|---|---|
| goal | planPhase.goal | Strategy selection analysis |
| strategy | planPhase.strategy | Core for analytics |
| userAnswer | monitorPhase.explanation | User's response text |
| confidence | monitorPhase.confidence | Calibration calculation |
| accuracy | evaluatePhase.accuracy | Performance metric |
| correctPoints[] | evaluatePhase.correctPoints | Accuracy breakdown |
| missingPoints[] | evaluatePhase.missingPoints | Gap analysis |
| calibrationError | evaluatePhase.calibrationError | Awareness metric |
| feedback | evaluatePhase (implied) | Shown to user |
| strategyHelpful | evaluatePhase.strategyEffectiveness | Strategy reflection (incomplete) |
| timeSpentSeconds | All phases + overall | Engagement (unused) |

---

## What You Can Analyze TODAY

1. Which strategies work best (overall)
2. Calibration error trends (confidence vs actual)
3. Session progress (chunks completed)
4. Goal vs strategy combinations
5. Feedback and accuracy

## What You CAN'T Analyze Yet

1. Why strategies work (no reflection text)
2. Learning process (no hints/reviews tracked)
3. Help-seeking patterns
4. Time spent on each phase
5. Goal achievement alignment
6. Weak topics/subjects (no aggregation)
7. Individual user learning patterns (no userStats)
8. Metacognitive growth trajectory

---

## Recommendations

### To Enable More Analysis (Priority Order)

1. **Add strategy reflection** (5 min to implement)
   - Store user's explanation of why strategy worked
   - One free-text field in evaluatePhase

2. **Track hint usage** (10 min)
   - Store which hints user viewed
   - Count times content was re-read

3. **Implement phase time tracking** (15 min)
   - Actually populate timeSpentSeconds in each phase
   - Calculate totals

4. **Build userStats collection** (1-2 hours)
   - Pre-aggregate stats for fast queries
   - Include strategy effectiveness, calibration trend, patterns

5. **Restructure response storage** (2-3 hours)
   - Move to planPhase/monitorPhase/evaluatePhase objects
   - Maintains backward compatibility via flat view

---

## Files to Review

- **Current Implementation**: 
  - /Users/merlin/Dev/metacognitionLearningEngine/routes/userResponseRoute.js
  - /Users/merlin/Dev/metacognitionLearningEngine/routes/sessionRoute.js

- **Designed Schema**: 
  - /Users/merlin/Dev/metacognitionLearningEngine/docs/DATABASE_SCHEMA.md

- **Full Analysis**: 
  - /Users/merlin/Dev/metacognitionLearningEngine/docs/DATABASE_STRUCTURE_ANALYSIS.md


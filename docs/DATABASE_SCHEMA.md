# Database Schema - Metacognitive Learning Engine

**MongoDB Collections Design**

---

## Overview

This database schema supports the redesigned metacognitive learning loop with comprehensive tracking for:
- Plan-Monitor-Evaluate phases
- Strategy effectiveness over time
- Calibration improvement
- User analytics and personalization

---

## Collections

1. [users](#1-users-collection) - User accounts and profiles
2. [materials](#2-materials-collection) - Uploaded learning materials
3. [chunks](#3-chunks-collection) - Individual learning chunks
4. [sessions](#4-sessions-collection) - Learning sessions
5. [userResponses](#5-userresponses-collection) - Detailed chunk responses
6. [userStats](#6-userstats-collection) - Aggregated analytics

---

## 1. `users` Collection

Stores user account information.

```javascript
{
  _id: ObjectId,

  // Authentication
  email: String,                    // unique, required
  passwordHash: String,             // hashed password

  // Profile
  name: String,
  createdAt: Date,
  lastLoginAt: Date,

  // Preferences
  preferences: {
    defaultGoal: String,            // 'gist', 'explain', 'apply'
    defaultStrategy: String,        // user's preferred default
    notificationsEnabled: Boolean,
    theme: String,                  // 'light', 'dark'
  },

  // Streak tracking
  currentStreak: Number,            // days in a row
  longestStreak: Number,
  lastActivityDate: Date,

  // Indices for this collection
  // - email: unique
  // - lastActivityDate: for streak calculations
}
```

**Indexes:**
```javascript
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ lastActivityDate: 1 });
```

---

## 2. `materials` Collection

Stores uploaded learning materials and their metadata.

```javascript
{
  _id: ObjectId,

  // Ownership
  userId: ObjectId,                 // ref: users

  // Material info
  title: String,
  source: String,                   // original filename or "text paste"
  rawContent: String,               // original uploaded text

  // Processing
  status: String,                   // 'processing', 'ready', 'failed'
  processedAt: Date,

  // Metadata
  subject: String,                  // 'programming', 'science', 'math', etc.
  difficulty: String,               // 'basic', 'intermediate', 'advanced', 'auto'
  estimatedTime: Number,            // total minutes for all chunks
  totalChunks: Number,

  // Statistics
  totalCompletions: Number,         // how many times fully completed
  averageAccuracy: Number,          // across all users

  // Timestamps
  createdAt: Date,
  updatedAt: Date,

  // Indices for this collection
  // - userId: for user's library
  // - status: for filtering
  // - createdAt: for sorting
}
```

**Indexes:**
```javascript
db.materials.createIndex({ userId: 1, createdAt: -1 });
db.materials.createIndex({ status: 1 });
```

---

## 3. `chunks` Collection

Stores individual learning chunks with all metacognitive fields.

```javascript
{
  _id: ObjectId,

  // Relationship
  materialId: ObjectId,             // ref: materials
  chunkIndex: Number,               // 0-based position in material

  // Core content
  topic: String,                    // 3-6 words

  // PLAN phase content
  planPrompt: String,               // activates prior knowledge

  // MONITOR phase content
  miniTeach: String,                // 100-150 words, teaches the concept
  question: String,                 // reflection question
  expectedPoints: [String],         // 3-4 key concepts

  // EVALUATE phase content
  evaluationPrompt: String,         // custom metacognitive reflection

  // Support content
  hints: [String],                  // 0-3 progressive hints
  example: String,                  // optional concrete example

  // Metadata
  difficulty: String,               // 'basic', 'intermediate', 'advanced'
  prerequisites: [String],          // topics this builds upon
  tags: [String],                   // for search/categorization

  // Statistics (aggregated from userResponses)
  stats: {
    totalAttempts: Number,
    averageAccuracy: Number,
    averageConfidence: Number,
    averageCalibrationError: Number,
    averageHintsUsed: Number,
    commonMuddyPoints: [String],    // most common confusions
  },

  // Timestamps
  createdAt: Date,

  // Indices for this collection
  // - materialId + chunkIndex: for retrieval
  // - difficulty: for filtering
}
```

**Indexes:**
```javascript
db.chunks.createIndex({ materialId: 1, chunkIndex: 1 });
db.chunks.createIndex({ difficulty: 1 });
db.chunks.createIndex({ tags: 1 });
```

---

## 4. `sessions` Collection

Tracks learning sessions (a set of chunks completed in one sitting).

```javascript
{
  _id: ObjectId,

  // Relationship
  userId: ObjectId,                 // ref: users
  materialId: ObjectId,             // ref: materials

  // Session info
  startedAt: Date,
  completedAt: Date,                // null if in progress
  status: String,                   // 'in_progress', 'completed', 'paused'

  // Progress
  chunksCompleted: Number,
  totalChunks: Number,
  currentChunkIndex: Number,        // for resuming

  // Session statistics
  sessionStats: {
    totalTimeSeconds: Number,
    averageAccuracy: Number,
    averageConfidence: Number,
    averageCalibrationError: Number,

    strategiesUsed: {                // count per strategy
      'self-explain': Number,
      'visualize': Number,
      'example': Number,
      'connect': Number,
      'teach': Number,
      'other': Number,
    },

    totalHintsUsed: Number,
    contentReviewCount: Number,      // times user re-read content
  },

  // Device/context
  deviceType: String,               // 'mobile', 'tablet', 'desktop'

  // Indices for this collection
  // - userId + startedAt: for user history
  // - status: for active sessions
}
```

**Indexes:**
```javascript
db.sessions.createIndex({ userId: 1, startedAt: -1 });
db.sessions.createIndex({ status: 1 });
db.sessions.createIndex({ userId: 1, materialId: 1 });
```

---

## 5. `userResponses` Collection

**MOST IMPORTANT** - Stores detailed responses for each chunk attempt.

This is where all the metacognitive magic happens!

```javascript
{
  _id: ObjectId,

  // Relationships
  userId: ObjectId,                 // ref: users
  sessionId: ObjectId,              // ref: sessions
  chunkId: ObjectId,                // ref: chunks
  materialId: ObjectId,             // ref: materials (for easier querying)

  // Chunk context (denormalized for performance)
  chunkTopic: String,
  chunkDifficulty: String,
  chunkIndex: Number,

  // ===================================================================
  // PLAN PHASE DATA
  // ===================================================================
  planPhase: {
    // Prior knowledge activation
    priorKnowledge: String,         // user's initial thoughts (optional)
    hasPriorKnowledge: Boolean,     // false if checked "no prior knowledge"

    // Goal setting
    goal: String,                   // 'gist', 'explain', 'apply'

    // Strategy selection
    strategy: String,               // 'self-explain', 'visualize', 'example', 'connect', 'teach', 'other'
    customStrategyDescription: String,  // only if strategy === 'other'

    // Timing
    timeSpentSeconds: Number,       // time in PLAN phase
    timestamp: Date,                // when PLAN started
  },

  // ===================================================================
  // MONITOR PHASE DATA
  // ===================================================================
  monitorPhase: {
    // User's explanation
    explanation: String,            // the answer they typed
    wordCount: Number,              // length of explanation

    // Confidence prediction
    confidence: Number,             // 0-100

    // Self-monitoring
    muddiestPoint: String,          // what's still unclear (optional)
    monitoringChecks: [String],     // which checklist items they checked

    // Help-seeking behavior
    hintsRequested: [Number],       // which hints (0, 1, 2) were used
    hintsUsedCount: Number,         // total hints
    contentReviewed: Boolean,       // did they re-read miniTeach?
    reviewCount: Number,            // how many times reviewed

    // Timing
    timeSpentSeconds: Number,
    timestamp: Date,
  },

  // ===================================================================
  // EVALUATE PHASE DATA
  // ===================================================================
  evaluatePhase: {
    // Performance metrics
    accuracy: Number,               // 0-100 (calculated by comparing to expectedPoints)
    correctPoints: [String],        // which expectedPoints they captured
    missingPoints: [String],        // which expectedPoints they missed

    // Calibration
    calibrationError: Number,       // confidence - accuracy
    calibrationDirection: String,   // 'overconfident', 'underconfident', 'accurate'

    // Goal evaluation
    metGoal: String,                // 'completely', 'mostly', 'partially', 'not-really'
    goalAchievementScore: Number,   // 0-100

    // Strategy reflection
    strategyEffectiveness: String,  // 'helped-a-lot', 'somewhat-helped', 'didnt-help'
    strategyReflection: String,     // WHY it helped/didn't (critical!)
    effortLevel: String,            // 'low', 'medium', 'high'

    // Custom evaluation (from evaluationPrompt)
    customEvalResponse: {
      confidenceRating: Number,     // 1-5 or similar
      memoryAid: String,            // user's custom mnemonic/example
      additionalThoughts: String,   // any other reflections
    },

    // Planning next chunk
    nextChunkAdjustments: [String], // e.g., ['keep-same-strategy', 'spend-more-time']

    // Timing
    timeSpentSeconds: Number,
    timestamp: Date,
  },

  // ===================================================================
  // OVERALL METRICS
  // ===================================================================
  totalTimeSeconds: Number,         // sum of all phases
  completed: Boolean,               // true if all phases done

  // Timestamps
  startedAt: Date,
  completedAt: Date,

  // Indices for this collection
  // - userId: for user analytics
  // - sessionId: for session summary
  // - chunkId: for chunk statistics
  // - userId + timestamp: for user history
  // - strategy: for strategy analysis
}
```

**Indexes:**
```javascript
db.userResponses.createIndex({ userId: 1, completedAt: -1 });
db.userResponses.createIndex({ sessionId: 1 });
db.userResponses.createIndex({ chunkId: 1 });
db.userResponses.createIndex({ userId: 1, 'planPhase.strategy': 1 });
db.userResponses.createIndex({ materialId: 1 });
```

**This is the goldmine!** All personalization comes from analyzing this collection.

---

## 6. `userStats` Collection

**Aggregated analytics** - Updated periodically from userResponses.

This makes queries fast by pre-computing common analytics.

```javascript
{
  _id: ObjectId,
  userId: ObjectId,                 // ref: users (unique)

  // ===================================================================
  // STRATEGY EFFECTIVENESS
  // ===================================================================
  strategyStats: {
    'self-explain': {
      timesUsed: Number,
      avgAccuracy: Number,
      avgConfidence: Number,
      avgCalibration: Number,

      // Context-specific performance
      bySubject: {
        'programming': { timesUsed: Number, avgAccuracy: Number },
        'science': { timesUsed: Number, avgAccuracy: Number },
        // ... other subjects
      },

      byDifficulty: {
        'basic': { timesUsed: Number, avgAccuracy: Number },
        'intermediate': { timesUsed: Number, avgAccuracy: Number },
        'advanced': { timesUsed: Number, avgAccuracy: Number },
      },

      byGoal: {
        'gist': { timesUsed: Number, avgAccuracy: Number },
        'explain': { timesUsed: Number, avgAccuracy: Number },
        'apply': { timesUsed: Number, avgAccuracy: Number },
      },
    },

    'visualize': { /* same structure */ },
    'example': { /* same structure */ },
    'connect': { /* same structure */ },
    'teach': { /* same structure */ },
    'other': { /* same structure */ },
  },

  // ===================================================================
  // CALIBRATION TRACKING
  // ===================================================================
  calibration: {
    overallAvgError: Number,        // avg calibration error
    trend: String,                  // 'improving', 'stable', 'declining'

    // Historical trend (last 30 chunks)
    history: [{
      chunkId: ObjectId,
      timestamp: Date,
      predicted: Number,            // confidence
      actual: Number,               // accuracy
      error: Number,                // predicted - actual
    }],

    // By context
    byDifficulty: {
      'basic': { avgError: Number, count: Number },
      'intermediate': { avgError: Number, count: Number },
      'advanced': { avgError: Number, count: Number },
    },

    // Percentile (compared to all users)
    percentile: Number,             // 0-100
  },

  // ===================================================================
  // GOAL ACHIEVEMENT
  // ===================================================================
  goals: {
    'gist': {
      totalAttempts: Number,
      achieved: Number,             // count of 'completely' or 'mostly'
      achievementRate: Number,      // percentage
      avgAccuracy: Number,
    },

    'explain': { /* same structure */ },
    'apply': { /* same structure */ },
  },

  // ===================================================================
  // LEARNING PATTERNS
  // ===================================================================
  patterns: {
    // Averages
    avgAccuracy: Number,            // overall
    avgConfidence: Number,
    avgCalibration: Number,
    avgHintsPerChunk: Number,
    avgTimePerChunk: Number,        // seconds

    // Preferences
    preferredStrategy: String,      // most-used strategy
    preferredGoal: String,          // most-used goal

    // Help-seeking
    hintsRequestedRate: Number,     // % of chunks where hints used
    contentReviewRate: Number,      // % of chunks where content reviewed

    // Performance by context
    strongSubjects: [String],       // subjects with >80% avg accuracy
    weakSubjects: [String],         // subjects with <60% avg accuracy
    strongTopics: [String],         // specific topics mastered
    weakTopics: [String],           // specific topics struggling with
  },

  // ===================================================================
  // CUSTOM STRATEGIES
  // ===================================================================
  customStrategies: [{
    description: String,            // e.g., "Compare to video games"
    timesUsed: Number,
    avgAccuracy: Number,
    avgConfidence: Number,
    contexts: [String],             // where it worked well
    createdAt: Date,
  }],

  // ===================================================================
  // METACOGNITIVE MATURITY
  // ===================================================================
  metacognitiveMaturity: {
    level: String,                  // 'novice', 'intermediate', 'advanced', 'expert'

    scores: {
      calibrationAccuracy: Number,  // 0-100
      strategyDiversity: Number,    // 0-100
      selfMonitoring: Number,       // 0-100
      helpSeeking: Number,          // 0-100
      goalAlignment: Number,        // 0-100
    },

    overallScore: Number,           // 0-100
    lastCalculated: Date,
  },

  // ===================================================================
  // OVERALL STATS
  // ===================================================================
  totals: {
    chunksCompleted: Number,
    sessionsCompleted: Number,
    materialsCompleted: Number,
    totalLearningTimeSeconds: Number,
  },

  // Timestamps
  updatedAt: Date,                  // last time stats were recalculated

  // Indices for this collection
  // - userId: unique
}
```

**Indexes:**
```javascript
db.userStats.createIndex({ userId: 1 }, { unique: true });
db.userStats.createIndex({ updatedAt: 1 });
```

**Update Strategy:**
- Update after each chunk completion (incremental)
- Or recalculate weekly from userResponses (full refresh)

---

## Data Flow

### 1. User Completes a Chunk

```
1. Create userResponse document
   ├─ planPhase data
   ├─ monitorPhase data
   └─ evaluatePhase data

2. Update session document
   └─ Increment chunksCompleted
   └─ Update sessionStats

3. Update userStats (incremental)
   └─ Add to strategy stats
   └─ Add to calibration history
   └─ Update patterns

4. Update chunk stats
   └─ Increment totalAttempts
   └─ Update averageAccuracy
   └─ Add to commonMuddyPoints
```

---

## Sample Queries

### Get User's Best Strategy for a Goal

```javascript
db.userStats.aggregate([
  { $match: { userId: ObjectId('...') } },
  { $project: {
      strategies: { $objectToArray: '$strategyStats' }
  }},
  { $unwind: '$strategies' },
  { $project: {
      strategy: '$strategies.k',
      accuracy: '$strategies.v.byGoal.explain.avgAccuracy'
  }},
  { $sort: { accuracy: -1 } },
  { $limit: 1 }
]);
```

---

### Get Calibration Trend

```javascript
db.userStats.findOne(
  { userId: ObjectId('...') },
  { 'calibration.history': { $slice: -10 } }
);
```

---

### Find Weak Topics

```javascript
db.userResponses.aggregate([
  { $match: { userId: ObjectId('...') } },
  { $group: {
      _id: '$chunkTopic',
      avgAccuracy: { $avg: '$evaluatePhase.accuracy' },
      count: { $sum: 1 }
  }},
  { $match: { avgAccuracy: { $lt: 70 }, count: { $gte: 2 } } },
  { $sort: { avgAccuracy: 1 } }
]);
```

---

### Get Strategy Effectiveness by Subject

```javascript
db.userResponses.aggregate([
  { $match: {
      userId: ObjectId('...'),
      'planPhase.strategy': 'self-explain'
  }},
  { $lookup: {
      from: 'materials',
      localField: 'materialId',
      foreignField: '_id',
      as: 'material'
  }},
  { $unwind: '$material' },
  { $group: {
      _id: '$material.subject',
      avgAccuracy: { $avg: '$evaluatePhase.accuracy' },
      count: { $sum: 1 }
  }}
]);
```

---

## Data Migration Plan

### Step 1: Create New Collections

Run migration script to create collections with indexes.

### Step 2: Migrate Existing Data (if any)

```javascript
// Example migration for existing materials
db.oldMaterials.find().forEach(material => {
  db.materials.insertOne({
    _id: material._id,
    userId: material.userId,
    title: material.title,
    source: material.source || 'unknown',
    rawContent: material.content,
    status: 'ready',
    processedAt: material.createdAt,
    subject: material.subject || 'other',
    difficulty: material.difficulty || 'auto',
    estimatedTime: material.estimatedTime || 0,
    totalChunks: material.chunks?.length || 0,
    totalCompletions: 0,
    averageAccuracy: 0,
    createdAt: material.createdAt,
    updatedAt: material.updatedAt || material.createdAt,
  });
});
```

### Step 3: Update Chunks Schema

```javascript
// Add new fields to existing chunks
db.chunks.updateMany({}, {
  $set: {
    planPrompt: '',             // populate with defaults or regenerate
    evaluationPrompt: '',
    hints: [],
    prerequisites: [],
    tags: [],
    stats: {
      totalAttempts: 0,
      averageAccuracy: 0,
      averageConfidence: 0,
      averageCalibrationError: 0,
      averageHintsUsed: 0,
      commonMuddyPoints: [],
    }
  }
});
```

---

## Performance Considerations

### 1. Indexes

All critical indexes are defined above. Monitor query performance with:

```javascript
db.userResponses.explain('executionStats').find({ userId: ObjectId('...') });
```

### 2. Sharding (Future)

If you reach millions of documents:

```javascript
// Shard userResponses by userId
sh.shardCollection('metacognition.userResponses', { userId: 1 });
```

### 3. Data Retention

Consider archiving old userResponses after 1 year:

```javascript
// Archive responses older than 1 year
db.userResponses.aggregate([
  { $match: { completedAt: { $lt: new Date('2024-01-01') } } },
  { $out: 'userResponses_archive' }
]);
```

---

## Storage Estimates

### Per User (1000 chunks completed):

```
materials: ~5 KB × 10 materials = 50 KB
chunks: ~2 KB × 100 chunks = 200 KB
sessions: ~1 KB × 50 sessions = 50 KB
userResponses: ~3 KB × 1000 responses = 3 MB
userStats: ~50 KB × 1 = 50 KB

Total per user: ~3.35 MB
```

### For 10,000 Users:

```
Total: ~33.5 GB
MongoDB Atlas M10 (2 GB RAM): $57/month
MongoDB Atlas M20 (4 GB RAM): $125/month (recommended)
```

**Recommendation:** Start with M10, scale to M20 when you hit 5000 active users.

---

## Validation Rules

### MongoDB Schema Validation (Optional but Recommended)

```javascript
db.createCollection('userResponses', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'chunkId', 'planPhase', 'monitorPhase'],
      properties: {
        planPhase: {
          bsonType: 'object',
          required: ['goal', 'strategy'],
          properties: {
            goal: { enum: ['gist', 'explain', 'apply'] },
            strategy: { enum: ['self-explain', 'visualize', 'example', 'connect', 'teach', 'other'] },
          }
        },
        evaluatePhase: {
          bsonType: 'object',
          properties: {
            accuracy: { bsonType: 'number', minimum: 0, maximum: 100 },
            confidence: { bsonType: 'number', minimum: 0, maximum: 100 },
          }
        }
      }
    }
  }
});
```

---

## Next Steps

1. ✅ Review schema
2. ✅ Create collections with indexes
3. ✅ Set up validation rules
4. ✅ Build API endpoints to read/write this data
5. ✅ Create analytics functions
6. ✅ Test with sample data

---

## Summary

This database schema provides:

✅ **Complete metacognitive tracking** - All Plan-Monitor-Evaluate data
✅ **Personalization support** - Strategy effectiveness, calibration, patterns
✅ **Performance optimized** - Indexes on all query paths
✅ **Analytics ready** - Pre-aggregated stats for fast queries
✅ **Scalable** - Can handle millions of responses
✅ **Extensible** - Easy to add new fields without breaking existing data

**The foundation is solid. Let's build on it!**

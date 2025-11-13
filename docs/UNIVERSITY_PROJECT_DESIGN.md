# Metacognition Learning Engine - University Project Design Document

**Course:** [Your Course Name]
**Project Team:** [Your Names]
**Date:** November 2025
**License:** MIT

---

## Table of Contents

1. [Project Description](#project-description)
2. [User Personas](#user-personas)
3. [User Stories](#user-stories)
4. [System Architecture](#system-architecture)
5. [Database Design](#database-design)
6. [Design Mockups](#design-mockups)
7. [React Components](#react-components)
8. [API Endpoints](#api-endpoints)
9. [Implementation Timeline](#implementation-timeline)
10. [Technical Requirements](#technical-requirements)

---

## 1. Project Description

### Overview

The **Metacognition Learning Engine** is a web application that helps students learn more effectively by teaching them to think about their own thinking. Unlike traditional study apps that focus only on content memorization, our app guides users through a structured reflection process called the **Plan-Monitor-Evaluate loop**.

### The Problem

Students often:

- Read or review material without truly understanding it
- Overestimate how well they've learned something (illusion of knowing)
- Don't know which study strategies work best for them
- Lack awareness of their own learning patterns

### Our Solution

We transform user-uploaded study material into **short, guided learning loops** (90 seconds each) where students:

1. **PLAN** - Set a learning goal and choose a strategy
2. **MONITOR** - Test their understanding and rate their confidence
3. **EVALUATE** - Get feedback and reflect on what worked

Over time, students build **metacognitive awareness** - they learn not just the content, but also _how they learn best_.

### Core Features (MVP)

1. **Text Upload** - Students paste their notes, textbook sections, or study materials
2. **Chunk Generation** - AI breaks content into bite-sized learning chunks
3. **Guided Learning Loop** - Plan → Monitor → Evaluate cycle for each chunk
4. **Performance Tracking** - Confidence vs accuracy calibration
5. **Session Insights** - Summary showing which strategies worked best

### Technology Stack

**Frontend:**

- React 18 with Hooks
- CSS Modules (component-based styling)
- No prohibited libraries (no axios, mongoose, CORS)

**Backend:**

- Node.js + Express
- MongoDB with native driver (no Mongoose)
- RESTful API

**Deployment:**

- Frontend: Netlify or Vercel
- Backend: Render.com or Railway
- Database: MongoDB Atlas (free tier)

---

## 2. User Personas

### Persona 1: Alex - The Overwhelmed Pre-Med Student

**Demographics:**

- Age: 20
- Major: Biology (Pre-Med track)
- Year: Sophomore
- Tech savviness: Medium

**Background:**
Alex is juggling organic chemistry, cell biology, and physics. They spend hours re-reading lecture notes but still struggle on exams. They highlight everything but don't actually process the information.

**Goals:**

- Actually understand concepts, not just memorize them
- Study more efficiently (less time, better results)
- Know when they really "get it" vs when they're fooling themselves

**Pain Points:**

- Feels like they study a lot but scores don't reflect effort
- Doesn't know which study methods work best
- Often surprised by what they don't know on exam day

**How Our App Helps:**

- Breaks dense textbook sections into manageable chunks
- Forces active recall and self-explanation
- Shows calibration scores (confidence vs actual understanding)
- Reveals which strategies (diagrams, examples, self-explain) work best for different topics

**Typical Session:**
Alex pastes a section about cellular respiration (500 words). The app generates 4 chunks. For each chunk, Alex:

1. Picks a goal ("explain it to someone")
2. Chooses a strategy ("draw a diagram mentally")
3. Reads the mini-teach
4. Answers a question
5. Rates confidence (maybe 70%)
6. Gets feedback showing actual accuracy (60% - slight overconfidence)
7. Reflects on whether the strategy helped

After 4 chunks (~6 minutes), Alex sees that "self-explain" gave better accuracy than "visualize" for this topic.

---

### Persona 2: Jordan - The CS Student Who Learns by Doing

**Demographics:**

- Age: 22
- Major: Computer Science
- Year: Junior
- Tech savviness: High

**Background:**
Jordan learns best through hands-on practice but struggles with theoretical concepts (algorithms, complexity). They often skip the reading and jump straight to coding, leading to gaps in understanding.

**Goals:**

- Build stronger theoretical foundation
- Balance hands-on practice with conceptual understanding
- Track which study approaches work for abstract vs practical topics

**Pain Points:**

- Gets impatient with long reading assignments
- Performs well on coding projects but struggles on written exams
- Doesn't know how to study for theory-heavy courses

**How Our App Helps:**

- Short 90-second loops match Jordan's attention span
- "Work an example" strategy lets them apply concepts immediately
- Tracks performance by strategy and topic type
- Shows Jordan that they need different approaches for algorithms vs implementation

**Typical Session:**
Jordan pastes notes about Dijkstra's algorithm. The app creates 5 chunks. Jordan tries different strategies:

- Chunk 1: "Work an example" (85% accuracy - works well!)
- Chunk 2: "Self-explain" (70% accuracy - harder for Jordan)
- Chunk 3: "Visualize the graph" (80% accuracy - also good)

Session summary shows Jordan learns algorithms best by working examples and visualizing, not reading passively.

---

### Persona 3: Maria - The Returning Student and Parent

**Demographics:**

- Age: 35
- Major: Business Administration (evening program)
- Year: Junior
- Tech savviness: Medium-Low

**Background:**
Maria returned to college after 10 years. She's balancing classes, a full-time job, and two kids. Study time is precious - she needs to make every minute count. She feels rusty on studying and test-taking.

**Goals:**

- Use limited study time efficiently
- Rebuild confidence in her learning abilities
- Develop effective study habits

**Pain Points:**

- Only has 15-30 minute pockets of time to study
- Second-guesses herself on exams
- Doesn't remember how to study effectively
- Feels less confident than traditional students

**How Our App Helps:**

- Short sessions (5-10 chunks = ~12 minutes) fit her schedule
- Builds confidence through calibration feedback
- Shows concrete evidence of learning progress
- Simple, clear interface (not overwhelming)

**Typical Session:**
Maria has 15 minutes before picking up kids. She pastes a section from her marketing textbook about consumer behavior. App generates 6 chunks. Maria completes 5 of them:

- Starts uncertain (40% confidence) but actually scores 55% (improving!)
- By chunk 5, confidence is 65% and accuracy is 70% (well-calibrated)
- Session summary shows "You're better than you think! Your calibration improved."

This builds Maria's confidence and shows her that she _can_ learn effectively.

---

## 3. System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND (React)                  │
│  ┌──────────────┐  ┌──────────────┐                │
│  │   Upload     │  │  Learning    │                │
│  │  Component   │  │  Loop        │                │
│  │              │  │  Component   │                │
│  └──────────────┘  └──────────────┘                │
│  ┌──────────────┐  ┌──────────────┐                │
│  │   Session    │  │   History    │                │
│  │  Summary     │  │  Component   │                │
│  └──────────────┘  └──────────────┘                │
└──────────────┬──────────────────────────────────────┘
               │ REST API
               │ (fetch)
┌──────────────▼──────────────────────────────────────┐
│              BACKEND (Node + Express)               │
│  ┌──────────────┐  ┌──────────────┐                │
│  │   Routes     │  │  Services    │                │
│  │  /chunks     │  │  - LLM       │                │
│  │  /responses  │  │  - Evaluate  │                │
│  │  /sessions   │  │              │                │
│  └──────────────┘  └──────────────┘                │
└──────────────┬──────────────────────────────────────┘
               │ MongoDB Driver
               │ (native, no Mongoose)
┌──────────────▼──────────────────────────────────────┐
│              DATABASE (MongoDB)                     │
│  ┌──────────────┐  ┌──────────────┐                │
│  │   sessions   │  │   responses  │                │
│  │  collection  │  │  collection  │                │
│  │  (200 docs)  │  │  (1200+ docs)│                │
│  └──────────────┘  └──────────────┘                │
└─────────────────────────────────────────────────────┘
```

### Component Communication Flow

```
User Action: Upload Text
    ↓
UploadComponent.jsx
    ↓ POST /api/chunks/generate
Backend: chunksRoute.js
    ↓
LLM Service (Gemini API)
    ↓
Returns: Array of chunks
    ↓
Store in sessions collection
    ↓
Frontend: Navigate to LearningLoop
    ↓
LearningLoopComponent.jsx
    ↓ For each chunk:
    Plan → Monitor → Evaluate
    ↓ POST /api/responses
Backend: responsesRoute.js
    ↓
Evaluate Service (LLM)
    ↓
Store in responses collection
    ↓
Frontend: Show feedback
    ↓
Repeat until all chunks done
    ↓
SessionSummaryComponent.jsx
    ↓ GET /api/sessions/:id/summary
Backend: Calculate stats
    ↓
Display insights
```

---

## 4. Database Design

### MongoDB Collections

#### Collection 1: `sessions`

**Purpose:** Store each learning session and its generated chunks

**Fields:**

```javascript
{
  _id: ObjectId,
  userId: String,               // "anonymous" for MVP (future: real user IDs)
  rawContent: String,           // Original pasted text
  contentPreview: String,       // First 100 chars (for list display)
  createdAt: Date,
  completedAt: Date,            // null until session finished
  status: String,               // "in_progress", "completed"
  chunks: [                     // Array of generated chunks
    {
      chunkId: String,          // "chunk_0", "chunk_1", etc.
      topic: String,
      miniTeach: String,
      question: String,
      expectedPoints: [String],
      completed: Boolean
    }
  ],
  sessionStats: {               // Calculated after session
    totalChunks: Number,
    chunksCompleted: Number,
    averageAccuracy: Number,
    averageConfidence: Number,
    calibrationError: Number,   // avgConfidence - avgAccuracy
    totalTimeSeconds: Number
  }
}
```

**CRUD Operations:**

- **CREATE:** POST `/api/sessions` (when user uploads content)
- **READ:** GET `/api/sessions` (list all sessions)
- **READ:** GET `/api/sessions/:id` (get specific session)
- **UPDATE:** PATCH `/api/sessions/:id` (mark chunk complete, update stats)
- **DELETE:** DELETE `/api/sessions/:id` (remove session)

**Indexes:**

- `_id` (default)
- `userId` (for filtering user's sessions)
- `createdAt` (for sorting by date)

**Synthetic Data:** Generate 200 sample sessions with realistic text content (each session has 5-8 chunks)

---

#### Collection 2: `responses`

**Purpose:** Store each individual chunk response (Plan-Monitor-Evaluate data)

**Fields:**

```javascript
{
  _id: ObjectId,
  sessionId: ObjectId,          // Reference to sessions collection
  userId: String,               // Same as session.userId
  chunkId: String,              // "chunk_0", "chunk_1", etc.
  chunkTopic: String,           // Denormalized for easy querying

  // PLAN phase
  goal: String,                 // "gist", "explain", "apply"
  strategy: String,             // "self-explain", "visualize", "example"
  planTimestamp: Date,

  // MONITOR phase
  question: String,             // The question asked
  userAnswer: String,           // User's explanation
  confidence: Number,           // 0-100
  monitorTimestamp: Date,

  // EVALUATE phase
  expectedPoints: [String],     // What should be in answer
  correctPoints: [String],      // What they got right
  missingPoints: [String],      // What they missed
  accuracy: Number,             // 0-100
  calibrationError: Number,     // confidence - accuracy
  calibrationDirection: String, // "overconfident", "underconfident", "accurate"
  feedback: String,             // AI-generated feedback
  strategyHelpful: Boolean,     // Did strategy help? (yes/no)
  evaluateTimestamp: Date,

  createdAt: Date,
  timeSpentSeconds: Number      // Total time on this chunk
}
```

**CRUD Operations:**

- **CREATE:** POST `/api/responses` (when user submits chunk answer)
- **READ:** GET `/api/responses` (all responses)
- **READ:** GET `/api/responses/session/:sessionId` (responses for a session)
- **READ:** GET `/api/responses/strategy/:strategy` (filter by strategy)
- **UPDATE:** PATCH `/api/responses/:id` (edit response - rare)
- **DELETE:** DELETE `/api/responses/:id` (remove response)

**Indexes:**

- `_id` (default)
- `sessionId` (for filtering by session)
- `userId` (for filtering user's responses)
- `strategy` (for aggregating by strategy)
- `createdAt` (for time-based queries)

**Synthetic Data:** Generate **1200 sample responses** (6 responses per session on average: 200 sessions × 6 = 1200 docs)

**This meets the requirement of at least 1000 documents in one collection.**

---

### Database Relationships

```
sessions (1) ────── (many) responses
   │
   └─ sessionId referenced in responses.sessionId
```

**Note:** Using denormalization (storing chunkTopic in responses) for performance. This is acceptable for MVP scale.

---

### Total Database Size

- `sessions` collection: **200 documents**
- `responses` collection: **1200 documents**
- **Total: 1400 documents** ✓ (exceeds 1000 minimum)

---

## 5. Design Mockups

### Mockup 1: Landing Page

```
╔════════════════════════════════════════════════════╗
║                                         [Sign In]  ║
║                                                    ║
║          🧠 Metacognition Learning Engine         ║
║                                                    ║
║          Learn by Reflecting, Not Just Reading     ║
║                                                    ║
║  ┌──────────────────────────────────────────────┐ ║
║  │                                              │ ║
║  │  Transform your notes into active learning   │ ║
║  │  loops that teach you the content AND        │ ║
║  │  how you learn best.                         │ ║
║  │                                              │ ║
║  │  Each loop takes ~90 seconds:                │ ║
║  │    1. Plan your approach                     │ ║
║  │    2. Test your understanding                │ ║
║  │    3. Reflect and improve                    │ ║
║  │                                              │ ║
║  └──────────────────────────────────────────────┘ ║
║                                                    ║
║          ┌────────────────────────────┐           ║
║          │   Try Demo Content         │           ║
║          └────────────────────────────┘           ║
║                                                    ║
║          ┌────────────────────────────┐           ║
║          │   Upload Your Own Text     │           ║
║          └────────────────────────────┘           ║
║                                                    ║
║  ┌─────────┐  ┌─────────┐  ┌─────────┐          ║
║  │ 📤      │  │ 🧠      │  │ 📊      │          ║
║  │ Upload  │  │ Reflect │  │ Discover│          ║
║  │ Notes   │  │ Deeply  │  │ Patterns│          ║
║  └─────────┘  └─────────┘  └─────────┘          ║
║                                                    ║
╚════════════════════════════════════════════════════╝
```

**Key Elements:**

- Clear value proposition
- Call to action buttons
- Visual hierarchy
- Feature highlights

---

### Mockup 2: Upload Screen

```
╔════════════════════════════════════════════════════╗
║  ← Back to Home                                    ║
║                                                    ║
║          📝 Upload Your Study Material             ║
║                                                    ║
║  ┌──────────────────────────────────────────────┐ ║
║  │                                              │ ║
║  │  Paste your lecture notes, textbook         │ ║
║  │  sections, or study materials here...       │ ║
║  │                                              │ ║
║  │  Example:                                    │ ║
║  │  "Photosynthesis is the process by which    │ ║
║  │   plants convert light energy into chemical  │ ║
║  │   energy. It occurs in chloroplasts..."     │ ║
║  │                                              │ ║
║  │                                              │ ║
║  │  [Large textarea - 8 rows]                  │ ║
║  │                                              │ ║
║  │                                              │ ║
║  └──────────────────────────────────────────────┘ ║
║                                                    ║
║  Characters: 1,245 / 500 minimum ✓                ║
║  Estimated chunks: 5-7                            ║
║                                                    ║
║  ───────────────────────────────────────────────  ║
║                                                    ║
║  Optional: Give this content a title              ║
║  ┌──────────────────────────────────────────────┐ ║
║  │  e.g., "Biology Lecture 3 - Photosynthesis" │ ║
║  └──────────────────────────────────────────────┘ ║
║                                                    ║
║                                                    ║
║          ┌────────────────────────────┐           ║
║          │   Generate Learning Chunks │           ║
║          └────────────────────────────┘           ║
║                                                    ║
╚════════════════════════════════════════════════════╝
```

**Key Elements:**

- Large text area for easy pasting
- Character counter with validation
- Estimated chunk count
- Optional title field
- Clear CTA button

---

### Mockup 3: Learning Loop - Plan Phase

```
╔════════════════════════════════════════════════════╗
║  Chunk 1/5                              [Pause]    ║
║                                                    ║
║  📖 PLAN: Set Your Approach                        ║
║                                                    ║
║  ┌──────────────────────────────────────────────┐ ║
║  │ Mini-Teach: Photosynthesis                   │ ║
║  │                                              │ ║
║  │ Photosynthesis converts light energy into   │ ║
║  │ chemical energy (glucose). It has two stages:│ ║
║  │ light-dependent reactions (in thylakoids)    │ ║
║  │ and light-independent reactions (in stroma). │ ║
║  │ The overall equation: 6CO₂ + 6H₂O → C₆H₁₂O₆ │ ║
║  └──────────────────────────────────────────────┘ ║
║                                                    ║
║  🎯 What's your learning goal?                    ║
║                                                    ║
║  ┌──────────────┐ ┌──────────────┐ ┌──────────┐  ║
║  │ 📋 Get the   │ │ 💡 Explain   │ │ 🛠️ Apply │  ║
║  │    gist      │ │    it        │ │    it    │  ║
║  │              │ │              │ │          │  ║
║  │ Understand   │ │ Teach to     │ │ Use in   │  ║
║  │ main idea    │ │ someone else │ │ problem  │  ║
║  └──────────────┘ └──────────────┘ └──────────┘  ║
║                       [SELECTED - HIGHLIGHTED]     ║
║                                                    ║
║  🧭 Which strategy will you use?                  ║
║                                                    ║
║  ┌──────────────┐ ┌──────────────┐ ┌──────────┐  ║
║  │ 💬 Self-     │ │ ✏️ Visualize │ │ 📝 Work  │  ║
║  │    Explain   │ │    it        │ │    Example│  ║
║  │              │ │              │ │          │  ║
║  │ Describe in  │ │ Create mental│ │ Apply to │  ║
║  │ own words    │ │ picture      │ │ a case   │  ║
║  └──────────────┘ └──────────────┘ └──────────┘  ║
║                                                    ║
║                                                    ║
║          ┌────────────────────────────┐           ║
║          │   Start Learning →         │           ║
║          └────────────────────────────┘           ║
║                                                    ║
╚════════════════════════════════════════════════════╝
```

**Key Elements:**

- Chunk progress indicator
- Self-contained mini-teach
- Goal selection cards (large, clear)
- Strategy selection cards
- Visual feedback for selected items
- Single action button

---

### Mockup 4: Learning Loop - Monitor Phase

```
╔════════════════════════════════════════════════════╗
║  Chunk 1/5                              [Pause]    ║
║                                                    ║
║  💭 MONITOR: Test Your Understanding               ║
║                                                    ║
║  Goal: Explain it • Strategy: Self-explain         ║
║                                                    ║
║  ┌──────────────────────────────────────────────┐ ║
║  │ Question:                                    │ ║
║  │                                              │ ║
║  │ Explain the difference between light-        │ ║
║  │ dependent and light-independent reactions    │ ║
║  │ in photosynthesis.                           │ ║
║  └──────────────────────────────────────────────┘ ║
║                                                    ║
║  ✍️ Your explanation:                             ║
║  ┌──────────────────────────────────────────────┐ ║
║  │ Light-dependent reactions need sunlight     │ ║
║  │ and happen in the thylakoids, while light-  │ ║
║  │ independent reactions (Calvin cycle) happen │ ║
║  │ in the stroma and don't need light directly.│ ║
║  │                                              │ ║
║  └──────────────────────────────────────────────┘ ║
║  125 characters (aim for 100+)                    ║
║                                                    ║
║  💪 How confident are you?                        ║
║  ┌──────────────────────────────────────────────┐ ║
║  │                                              │ ║
║  │  Not sure   ●────────────●──────  Very sure  │ ║
║  │      0       25    50    ^75       100       │ ║
║  │                          75%                 │ ║
║  │                                              │ ║
║  └──────────────────────────────────────────────┘ ║
║                                                    ║
║                                                    ║
║          ┌────────────────────────────┐           ║
║          │   Check My Answer →        │           ║
║          └────────────────────────────┘           ║
║                                                    ║
╚════════════════════════════════════════════════════╝
```

**Key Elements:**

- Shows selected goal and strategy
- Clear question
- Expandable text area
- Character counter
- Confidence slider with visual gradient
- Disabled button until answer provided

---

### Mockup 5: Learning Loop - Evaluate Phase

```
╔════════════════════════════════════════════════════╗
║  Chunk 1/5                              [Pause]    ║
║                                                    ║
║  ✅ EVALUATE: How Did You Do?                      ║
║                                                    ║
║  ┌──────────────────────────────────────────────┐ ║
║  │ ✓ What you got right:                        │ ║
║  │   • Light-dependent reactions need sunlight  │ ║
║  │   • They occur in thylakoids                 │ ║
║  │   • Light-independent reactions (Calvin      │ ║
║  │     cycle) occur in stroma                   │ ║
║  │                                              │ ║
║  │ 💡 What to add to your understanding:        │ ║
║  │   • Light-dependent reactions produce ATP    │ ║
║  │     and NADPH, which power the Calvin cycle  │ ║
║  │   • Light-independent reactions use CO₂ to   │ ║
║  │     build glucose                            │ ║
║  └──────────────────────────────────────────────┘ ║
║                                                    ║
║  📊 Your Performance:                             ║
║  ┌──────────────────────────────────────────────┐ ║
║  │  Accuracy:     75%  ▓▓▓▓▓▓▓░░░              │ ║
║  │  Confidence:   75%  ▓▓▓▓▓▓▓░░░              │ ║
║  │  Calibration:  Well-calibrated! ✓            │ ║
║  └──────────────────────────────────────────────┘ ║
║                                                    ║
║  🧭 Did your strategy help?                       ║
║                                                    ║
║     ┌──────────────┐      ┌──────────────┐       ║
║     │ 👍 Yes, it   │      │ 👎 Not really│       ║
║     │    helped    │      │              │       ║
║     └──────────────┘      └──────────────┘       ║
║                                                    ║
║                                                    ║
║          ┌────────────────────────────┐           ║
║          │   Next Chunk →             │           ║
║          └────────────────────────────┘           ║
║                                                    ║
╚════════════════════════════════════════════════════╝
```

**Key Elements:**

- Positive feedback first
- Constructive additions
- Performance visualization
- Calibration interpretation
- Strategy reflection question
- Clear path to continue

---

### Mockup 6: Session Summary

```
╔════════════════════════════════════════════════════╗
║                                                    ║
║              🎉 Session Complete!                  ║
║                                                    ║
║  ┌──────────────────────────────────────────────┐ ║
║  │                                              │ ║
║  │  Photosynthesis Study Session                │ ║
║  │  5 chunks completed in 8 minutes             │ ║
║  │                                              │ ║
║  └──────────────────────────────────────────────┘ ║
║                                                    ║
║  📊 Your Performance:                             ║
║                                                    ║
║  ┌───────────────┐ ┌───────────────┐ ┌──────────┐║
║  │ Overall       │ │ Avg           │ │ Calibrat-││
║  │ Accuracy      │ │ Confidence    │ │ ion      ││
║  │               │ │               │ │          ││
║  │    78%        │ │    73%        │ │   -5%    ││
║  │               │ │               │ │ Slight   ││
║  │               │ │               │ │ under    ││
║  └───────────────┘ └───────────────┘ └──────────┘║
║                                                    ║
║  🎯 Strategy Performance:                         ║
║  ┌──────────────────────────────────────────────┐ ║
║  │                                              │ ║
║  │  Self-explain     ▓▓▓▓▓▓▓▓▓░  85% (3 uses)  │ ║
║  │  Visualize        ▓▓▓▓▓▓░░░░  65% (1 use)   │ ║
║  │  Work example     ▓▓▓▓▓▓▓░░░  75% (1 use)   │ ║
║  │                                              │ ║
║  └──────────────────────────────────────────────┘ ║
║                                                    ║
║  💡 Key Insight:                                  ║
║  ┌──────────────────────────────────────────────┐ ║
║  │ Your "self-explain" strategy worked best!    │ ║
║  │ When you described concepts in your own      │ ║
║  │ words, you scored 10% higher. Try using it   │ ║
║  │ more often!                                  │ ║
║  └──────────────────────────────────────────────┘ ║
║                                                    ║
║     ┌──────────────────┐  ┌──────────────────┐   ║
║     │ View All Sessions│  │ Upload New Content│   ║
║     └──────────────────┘  └──────────────────┘   ║
║                                                    ║
╚════════════════════════════════════════════════════╝
```

**Key Elements:**

- Celebration message
- Session metadata
- Performance metrics (cards)
- Strategy comparison (visual bars)
- Personalized insight
- Clear next actions

---

### Mockup 7: Session History

```
╔════════════════════════════════════════════════════╗
║                                                    ║
║  📚 My Learning Sessions                          ║
║                                                    ║
║  ┌────────────────────────────────────────────┐   ║
║  │ Photosynthesis Study Session               │   ║
║  │ Nov 5, 2025 • 5 chunks • 8 min             │   ║
║  │ Accuracy: 78% • Confidence: 73%            │   ║
║  │                                            │   ║
║  │ Best strategy: Self-explain (85%)          │   ║
║  │                             [View Details] │   ║
║  └────────────────────────────────────────────┘   ║
║                                                    ║
║  ┌────────────────────────────────────────────┐   ║
║  │ Cellular Respiration Notes                 │   ║
║  │ Nov 4, 2025 • 7 chunks • 12 min            │   ║
║  │ Accuracy: 82% • Confidence: 80%            │   ║
║  │                                            │   ║
║  │ Best strategy: Visualize (88%)             │   ║
║  │                             [View Details] │   ║
║  └────────────────────────────────────────────┘   ║
║                                                    ║
║  ┌────────────────────────────────────────────┐   ║
║  │ JavaScript Closures                        │   ║
║  │ Nov 3, 2025 • 4 chunks • 6 min             │   ║
║  │ Accuracy: 70% • Confidence: 75%            │   ║
║  │                                            │   ║
║  │ Best strategy: Work example (75%)          │   ║
║  │                             [View Details] │   ║
║  └────────────────────────────────────────────┘   ║
║                                                    ║
║                                                    ║
║          ┌────────────────────────────┐           ║
║          │   Start New Session        │           ║
║          └────────────────────────────┘           ║
║                                                    ║
╚════════════════════════════════════════════════════╝
```

**Key Elements:**

- List of all sessions
- Session cards with metadata
- Performance summaries
- Best strategy highlighted
- View details link
- New session CTA

---

## 6. React Components

### Component Hierarchy

```
App.jsx
├── Header.jsx
├── Router
│   ├── LandingPage.jsx
│   ├── UploadPage.jsx
│   ├── ProcessingPage.jsx
│   ├── LearningSession.jsx
│   │   ├── PlanPhase.jsx
│   │   │   ├── GoalSelector.jsx
│   │   │   └── StrategySelector.jsx
│   │   ├── MonitorPhase.jsx
│   │   │   ├── QuestionDisplay.jsx
│   │   │   ├── AnswerInput.jsx
│   │   │   └── ConfidenceSlider.jsx
│   │   └── EvaluatePhase.jsx
│   │       ├── FeedbackDisplay.jsx
│   │       ├── PerformanceMetrics.jsx
│   │       └── StrategyReflection.jsx
│   ├── SessionSummary.jsx
│   │   ├── PerformanceCards.jsx
│   │   ├── StrategyComparison.jsx
│   │   └── InsightCard.jsx
│   └── HistoryPage.jsx
│       └── SessionCard.jsx
└── Footer.jsx
```

### Minimum Required Components (15+ total)

1. **App.jsx** - Main app container with routing
2. **Header.jsx** - Navigation header
3. **Footer.jsx** - Footer with credits
4. **LandingPage.jsx** - Welcome screen
5. **UploadPage.jsx** - Text paste interface
6. **ProcessingPage.jsx** - Loading screen
7. **LearningSession.jsx** - Main learning loop container
8. **PlanPhase.jsx** - Goal + strategy selection
9. **GoalSelector.jsx** - Goal cards
10. **StrategySelector.jsx** - Strategy cards
11. **MonitorPhase.jsx** - Question + answer interface
12. **ConfidenceSlider.jsx** - Confidence rating component
13. **EvaluatePhase.jsx** - Feedback display
14. **SessionSummary.jsx** - Session complete screen
15. **HistoryPage.jsx** - List of past sessions
16. **SessionCard.jsx** - Individual session display card
17. **PerformanceCards.jsx** - Summary metrics cards

### Component Code Examples

#### UploadPage.jsx

```jsx
import { useState } from "react";
import PropTypes from "prop-types";
import "./UploadPage.css";

function UploadPage({ onNavigate, setSessionData }) {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (content.length < 500) {
      setError("Please enter at least 500 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/chunks/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, title }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate chunks");
      }

      const data = await response.json();
      setSessionData(data);
      onNavigate("learning");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-page">
      <h2>📝 Upload Your Study Material</h2>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Paste your lecture notes, textbook sections, or study materials here..."
        rows={10}
        disabled={loading}
      />

      <p className="character-count">
        Characters: {content.length} / 500 minimum
        {content.length >= 500 && " ✓"}
      </p>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Optional: Give this content a title"
        disabled={loading}
      />

      {error && <p className="error">{error}</p>}

      <button onClick={handleSubmit} disabled={content.length < 500 || loading}>
        {loading ? "Processing..." : "Generate Learning Chunks"}
      </button>
    </div>
  );
}

UploadPage.propTypes = {
  onNavigate: PropTypes.func.isRequired,
  setSessionData: PropTypes.func.isRequired,
};

export default UploadPage;
```

---

#### GoalSelector.jsx

```jsx
import PropTypes from "prop-types";
import "./GoalSelector.css";

function GoalSelector({ selectedGoal, onSelectGoal }) {
  const goals = [
    {
      id: "gist",
      icon: "📋",
      title: "Get the gist",
      description: "Understand main idea",
    },
    {
      id: "explain",
      icon: "💡",
      title: "Explain it",
      description: "Teach to someone else",
    },
    {
      id: "apply",
      icon: "🛠️",
      title: "Apply it",
      description: "Use in problem",
    },
  ];

  return (
    <div className="goal-selector">
      <h3>🎯 What's your learning goal?</h3>
      <div className="goal-cards">
        {goals.map((goal) => (
          <button
            key={goal.id}
            className={`goal-card ${selectedGoal === goal.id ? "selected" : ""}`}
            onClick={() => onSelectGoal(goal.id)}
            aria-pressed={selectedGoal === goal.id}
          >
            <span className="icon" aria-hidden="true">
              {goal.icon}
            </span>
            <h4>{goal.title}</h4>
            <p>{goal.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

GoalSelector.propTypes = {
  selectedGoal: PropTypes.string,
  onSelectGoal: PropTypes.func.isRequired,
};

export default GoalSelector;
```

---

#### ConfidenceSlider.jsx

```jsx
import PropTypes from "prop-types";
import "./ConfidenceSlider.css";

function ConfidenceSlider({ value, onChange }) {
  const getZoneColor = (val) => {
    if (val < 34) return "red";
    if (val < 67) return "yellow";
    return "green";
  };

  const getZoneLabel = (val) => {
    if (val < 34) return "Unsure";
    if (val < 67) return "Somewhat confident";
    return "Very confident";
  };

  return (
    <div className="confidence-slider">
      <h3>💪 How confident are you?</h3>
      <div className="slider-container">
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={`slider ${getZoneColor(value)}`}
          aria-label="Confidence level"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow={value}
          aria-valuetext={`${value}% - ${getZoneLabel(value)}`}
        />
        <div className="slider-labels">
          <span>Not sure</span>
          <span className="current-value">{value}%</span>
          <span>Very sure</span>
        </div>
        <p className="zone-label">{getZoneLabel(value)}</p>
      </div>
    </div>
  );
}

ConfidenceSlider.propTypes = {
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default ConfidenceSlider;
```

---

## 7. API Endpoints

### Base URL

```
Development: http://localhost:3000/api
Production: https://your-app.onrender.com/api
```

### Endpoints Summary

| Method | Endpoint                        | Purpose                   | Auth |
| ------ | ------------------------------- | ------------------------- | ---- |
| POST   | `/chunks/generate`              | Generate chunks from text | No   |
| POST   | `/sessions`                     | Create new session        | No   |
| GET    | `/sessions`                     | List all sessions         | No   |
| GET    | `/sessions/:id`                 | Get specific session      | No   |
| PATCH  | `/sessions/:id/complete-chunk`  | Mark chunk as done        | No   |
| DELETE | `/sessions/:id`                 | Delete session            | No   |
| POST   | `/responses`                    | Submit chunk response     | No   |
| GET    | `/responses/session/:sessionId` | Get session responses     | No   |
| GET    | `/sessions/:id/summary`         | Get session summary       | No   |

### Detailed Endpoint Specifications

#### POST /api/chunks/generate

**Request:**

```json
{
  "content": "Long text content here (min 500 chars)...",
  "title": "Optional title"
}
```

**Response (200 OK):**

```json
{
  "sessionId": "673abc123def456...",
  "chunks": [
    {
      "chunkId": "chunk_0",
      "topic": "Photosynthesis Overview",
      "miniTeach": "Photosynthesis converts light...",
      "question": "Why do plants need light...",
      "expectedPoints": ["Light energy", "Glucose production", "Oxygen release"]
    }
  ],
  "totalChunks": 5
}
```

**Error (400 Bad Request):**

```json
{
  "error": "Content must be at least 500 characters"
}
```

---

#### POST /api/responses

**Request:**

```json
{
  "sessionId": "673abc123def456...",
  "chunkId": "chunk_0",
  "goal": "explain",
  "strategy": "self-explain",
  "userAnswer": "Plants use light to make glucose...",
  "confidence": 75
}
```

**Response (200 OK):**

```json
{
  "responseId": "673xyz789abc...",
  "accuracy": 70,
  "calibrationError": 5,
  "calibrationDirection": "overconfident",
  "correctPoints": ["Light energy", "Glucose production"],
  "missingPoints": ["Oxygen release", "Chlorophyll role"],
  "feedback": "Great start! You correctly identified... To improve, also mention..."
}
```

---

#### GET /api/sessions/:id/summary

**Response (200 OK):**

```json
{
  "sessionId": "673abc123def456...",
  "title": "Photosynthesis Study",
  "completedAt": "2025-11-05T14:30:00Z",
  "stats": {
    "totalChunks": 5,
    "averageAccuracy": 78,
    "averageConfidence": 73,
    "calibrationError": -5,
    "totalTimeSeconds": 480
  },
  "strategyPerformance": [
    { "strategy": "self-explain", "accuracy": 85, "uses": 3 },
    { "strategy": "visualize", "accuracy": 65, "uses": 1 },
    { "strategy": "example", "accuracy": 75, "uses": 1 }
  ],
  "insight": "Your 'self-explain' strategy worked best! You scored 10% higher when..."
}
```

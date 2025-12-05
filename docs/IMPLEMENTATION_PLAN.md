# Metacognition Features Implementation Plan

**Date:** 2025-12-02
**Status:** Ready for Implementation
**Priority:** High - Align with MVP Requirements

---

## Table of Contents

1. [Overview](#overview)
2. [Implementation Phases](#implementation-phases)
3. [Phase 1: Critical PLAN Phase Features](#phase-1-critical-plan-phase-features)
4. [Phase 2: Critical MONITOR Phase Features](#phase-2-critical-monitor-phase-features)
5. [Phase 3: Critical EVALUATE Phase Features](#phase-3-critical-evaluate-phase-features)
6. [Phase 4: Backend Schema Updates](#phase-4-backend-schema-updates)
7. [Testing Checklist](#testing-checklist)
8. [Database Schema Changes](#database-schema-changes)
9. [Component Structure Changes](#component-structure-changes)

---

## Overview

### Current State
The app has a solid Plan-Monitor-Evaluate loop structure but is missing key metacognitive scaffolding features specified in the design docs.

### Goal
Implement all missing metacognitive features to align with MVP requirements in [METACOGNITION_EXPLAINED.md](./METACOGNITION_EXPLAINED.md) and [MVP_DECISIONS.md](./MVP_DECISIONS.md).

### Success Criteria
- All 8 critical missing features implemented
- Goals reduced from 4 to 3 (align with docs)
- Strategies expanded from 5 to 6 + custom option
- Database schema supports all new fields
- Frontend collects and displays all metacognitive data
- User experience matches design mockups

---

## Implementation Phases

### Priority Order
1. **Phase 1:** PLAN phase features (prior knowledge, goals/strategies alignment)
2. **Phase 2:** MONITOR phase features (hints, content review, muddiest point)
3. **Phase 3:** EVALUATE phase features (goal evaluation, next time reflection)
4. **Phase 4:** Backend schema updates (chunk generation enhancements)

### Estimated Complexity
- **Phase 1:** Medium (frontend + backend response schema)
- **Phase 2:** Medium-High (UI + chunk schema + backend tracking)
- **Phase 3:** Low-Medium (mostly frontend additions)
- **Phase 4:** High (LLM prompt engineering + chunk schema)

---

## Phase 1: Critical PLAN Phase Features

### 1.1 Prior Knowledge Activation Step

**Location:** `frontend/src/pages/Learning.jsx`

**Requirements:**
- Add a new phase BEFORE goal selection
- Show this step immediately after loading chunk (before miniTeach)
- Optional text input: "What do you already know about this topic?"
- Checkbox: "I have no prior knowledge of this topic"
- If checkbox is checked, disable text input
- Track time spent on this step

**UI Design:**
```
╔════════════════════════════════════════════════════════╗
║  Chunk 1/5                              [Exit]         ║
║                                                        ║
║  📖 PLAN: Activate Prior Knowledge                     ║
║                                                        ║
║  Topic: [Chunk Topic]                                  ║
║                                                        ║
║  Before we begin, take a moment to think:             ║
║  What do you already know about this topic?           ║
║                                                        ║
║  ┌──────────────────────────────────────────────────┐ ║
║  │ Your thoughts (optional):                        │ ║
║  │ [                                                │ ║
║  │                                                  │ ║
║  │                                                ] │ ║
║  └──────────────────────────────────────────────────┘ ║
║                                                        ║
║  ☐ I have no prior knowledge of this topic           ║
║     (That's totally fine! This helps us understand    ║
║      where you're starting from.)                     ║
║                                                        ║
║                               [Continue →]             ║
╚════════════════════════════════════════════════════════╝
```

**Implementation Steps:**
1. Add new phase constant: `PRIOR_KNOWLEDGE: "prior_knowledge"`
2. Add state variables:
   ```javascript
   const [priorKnowledge, setPriorKnowledge] = useState("");
   const [hasPriorKnowledge, setHasPriorKnowledge] = useState(true);
   const [priorKnowledgeTime, setPriorKnowledgeTime] = useState(0);
   ```
3. Set initial phase to `PHASES.PRIOR_KNOWLEDGE` instead of `PHASES.PLAN`
4. Create UI section for prior knowledge phase
5. Handle checkbox interaction (disable textarea when checked)
6. Track time spent on this step
7. Pass `priorKnowledge` and `hasPriorKnowledge` to `submitResponse()`

**Backend Changes:**
- Update response schema in `routes/userResponseRoute.js`
- Add fields to response document:
  ```javascript
  priorKnowledge: String,
  hasPriorKnowledge: Boolean,
  priorKnowledgeTimeSeconds: Number,
  ```

---

### 1.2 Align Goals with MVP Spec

**Location:** `frontend/src/pages/Learning.jsx` (line 21-26)

**Current Goals (4):**
```javascript
const GOALS = [
  { id: "understand", label: "Understand the concept" },
  { id: "memorize", label: "Memorize key information" },
  { id: "apply", label: "Apply to real situations" },
  { id: "analyze", label: "Analyze and critique" },
];
```

**Required Goals (3):**
```javascript
const GOALS = [
  {
    id: "gist",
    icon: "📋",
    label: "Get the gist",
    description: "Understand the main idea quickly"
  },
  {
    id: "explain",
    icon: "💡",
    label: "Be able to explain",
    description: "Deeply understand to teach others"
  },
  {
    id: "apply",
    icon: "🛠️",
    label: "Apply to a problem",
    description: "Use this concept in practice"
  },
];
```

**Implementation Steps:**
1. Replace GOALS array with new 3-goal structure
2. Add icons and descriptions
3. Update UI to display icons + descriptions
4. Update Card styling to show description text

---

### 1.3 Expand Strategies to 6 + Custom

**Location:** `frontend/src/pages/Learning.jsx` (line 28-34)

**Current Strategies (5):**
```javascript
const STRATEGIES = [
  "Self-explain (teach it back)",
  "Visualize (create mental images)",
  "Work an example",
  "Connect to prior knowledge",
  "Ask questions about it",
];
```

**Required Strategies (6 + custom):**
```javascript
const STRATEGIES = [
  {
    id: "self-explain",
    icon: "💬",
    label: "Self-explain",
    description: "Describe the concept in your own words",
    guidance: "Imagine teaching this to a friend. What would you say?",
  },
  {
    id: "visualize",
    icon: "✏️",
    label: "Visualize it",
    description: "Create a mental image or diagram",
    guidance: "What would this look like as a picture or flowchart?",
  },
  {
    id: "example",
    icon: "📝",
    label: "Work an example",
    description: "Apply to a concrete case",
    guidance: "Try the concept with specific numbers or scenarios",
  },
  {
    id: "connect",
    icon: "🔗",
    label: "Connect to prior knowledge",
    description: "Link to something you already know",
    guidance: "How is this similar to concepts you already understand?",
  },
  {
    id: "teach",
    icon: "👥",
    label: "Pretend to teach",
    description: "Explain as if teaching someone",
    guidance: "What would you write on a whiteboard to explain this?",
  },
  {
    id: "other",
    icon: "✨",
    label: "My own approach",
    description: "Use your preferred strategy",
    requiresInput: true,
  },
];
```

**Custom Strategy UI (when "My own approach" is selected):**
```
┌─────────────────────────────────────────────────────┐
│ ✨ Using your own approach                          │
│                                                      │
│ Briefly describe your strategy:                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ e.g., "Create a mnemonic", "Compare to similar  │ │
│ │ concept", "Think of real-world uses"            │ │
│ │ [                                          ]    │ │
│ └─────────────────────────────────────────────────┘ │
│                                                      │
│ ℹ️  We'll track how well this works for you!        │
│                                                      │
│                                    [Continue →]     │
└─────────────────────────────────────────────────────┘
```

**Implementation Steps:**
1. Replace STRATEGIES array with object-based structure
2. Add state: `const [customStrategy, setCustomStrategy] = useState("")`
3. Update strategy selection UI to show icons, labels, descriptions
4. Show custom strategy input when `strategy.id === "other"`
5. Disable "Continue" button until custom strategy is filled (if selected)
6. Pass `customStrategyDescription` to `submitResponse()`

**Backend Changes:**
- Add field to response document:
  ```javascript
  customStrategyDescription: String,  // Only if strategy === 'other'
  ```

---

## Phase 2: Critical MONITOR Phase Features

### 2.1 Muddiest Point Input

**Location:** `frontend/src/pages/Learning.jsx` (MONITOR phase section)

**Requirements:**
- Optional text input after user's answer
- Prompt: "What's the muddiest (most confusing) part?"
- Placeholder: "e.g., 'I don't understand how X relates to Y'"
- Store in response document

**UI Design (add after answer textarea):**
```
┌──────────────────────────────────────────────────┐
│ 🤔 What's the muddiest (most confusing) part?   │
│    (Optional - helps us understand your gaps)   │
│                                                  │
│ [                                            ]  │
│                                                  │
└──────────────────────────────────────────────────┘
```

**Implementation Steps:**
1. Add state: `const [muddyPoint, setMuddyPoint] = useState("")`
2. Add textarea input after user answer section
3. Pass `muddyPoint` to `submitResponse()`

**Backend Changes:**
- Add field to response document:
  ```javascript
  muddyPoint: String,
  ```

---

### 2.2 Hints System

**Location:** Multiple files

**Requirements:**
- Chunks must include `hints: [String]` array (3 progressive hints)
- UI: "Show hint" button in Monitor phase
- Display hints one at a time
- Track how many hints were used
- Increment `hintsUsed` counter

**UI Design:**
```
┌──────────────────────────────────────────────────┐
│ Need help?                                       │
│                                                  │
│ [💡 Show hint (2 remaining)]                    │
│                                                  │
│ Hint 1: Think about the relationship between... │
│                                                  │
│ [💡 Show next hint (1 remaining)]               │
└──────────────────────────────────────────────────┘
```

**Implementation Steps:**

**Frontend (`Learning.jsx`):**
1. Add state: `const [visibleHints, setVisibleHints] = useState(0)`
2. Add "Show hint" button in Monitor phase
3. Display `currentChunk.hints.slice(0, visibleHints)`
4. Increment `visibleHints` when button clicked
5. Track `hintsUsed` count
6. Pass `hintsUsed: visibleHints` to `submitResponse()`

**Backend (LLM Service):**
1. Update chunk generation prompts in:
   - `services/llm/geminiService.js`
   - `services/llm/openaiService.js`
   - `services/llm/claudeService.js`
2. Add to chunk schema:
   ```javascript
   hints: [String],  // Array of 3 progressive hints
   ```
3. Update LLM prompt to generate hints:
   ```
   Generate 3 progressive hints:
   - Hint 1: Gentle nudge (general direction)
   - Hint 2: More specific (point to key concept)
   - Hint 3: Almost give it away (very specific)
   ```

**Backend Changes (Response Route):**
- Already tracking `hintsUsed` ✓
- Just needs frontend to pass actual count

---

### 2.3 Content Review Toggle

**Location:** `frontend/src/pages/Learning.jsx` (MONITOR phase section)

**Requirements:**
- Button to show/hide miniTeach content during Monitor phase
- Track if user reviewed content (`contentReviewed: Boolean`)
- Set to `true` if button is clicked

**UI Design:**
```
┌──────────────────────────────────────────────────┐
│ Question: Explain the difference between...     │
└──────────────────────────────────────────────────┘

[📖 Review content]  ← Button

{If clicked, show miniTeach in collapsible Card}
┌──────────────────────────────────────────────────┐
│ [Content from miniTeach]                         │
└──────────────────────────────────────────────────┘
```

**Implementation Steps:**
1. Add state: `const [showContent, setShowContent] = useState(false)`
2. Add "Review content" button after question
3. Show/hide miniTeach content based on `showContent`
4. When button is clicked:
   - Set `setContentReviewed(true)`
   - Toggle `setShowContent(!showContent)`
5. Pass `contentReviewed` to `submitResponse()`

**Backend Changes:**
- Already tracking `contentReviewed` ✓
- Just needs frontend to pass `true` when reviewed

---

### 2.4 Monitoring Checklist (Optional - Post-MVP)

**Location:** `frontend/src/pages/Learning.jsx` (MONITOR phase section)

**Requirements:**
- Self-check items during learning
- Examples: "Am I understanding this?", "Should I slow down?", "Do I need to re-read?"

**UI Design:**
```
┌──────────────────────────────────────────────────┐
│ 🧠 Self-monitoring checklist:                    │
│                                                  │
│ ☐ I understand the main concept                 │
│ ☐ I can explain this in my own words            │
│ ☐ I know what I'm confused about                │
│ ☐ I'm ready to answer the question              │
└──────────────────────────────────────────────────┘
```

**Implementation Steps (Post-MVP):**
1. Add state: `const [checklistItems, setChecklistItems] = useState({})`
2. Create checklist component
3. Track which items are checked
4. Store in response document

---

## Phase 3: Critical EVALUATE Phase Features

### 3.1 Goal Evaluation

**Location:** `frontend/src/pages/Learning.jsx` (EVALUATE phase section)

**Requirements:**
- Ask: "Did you achieve your learning goal?"
- Show the goal they selected in PLAN phase
- Yes/No/Partially buttons
- Store in response document

**UI Design (add after calibration feedback):**
```
┌──────────────────────────────────────────────────┐
│ 🎯 Goal Achievement                              │
│                                                  │
│ Your goal was: "Be able to explain"             │
│                                                  │
│ Did you achieve your learning goal?             │
│                                                  │
│ [✅ Yes]  [⚡ Partially]  [❌ No]               │
└──────────────────────────────────────────────────┘
```

**Implementation Steps:**
1. Add state: `const [goalAchieved, setGoalAchieved] = useState(null)`
2. Add goal evaluation section after calibration display
3. Show selected goal label
4. Three button options: "yes", "partial", "no"
5. Update `markStrategyHelpful()` call to include `goalAchieved`

**Backend Changes:**
- Update `routes/userResponseRoute.js`
- Modify `PATCH /responses/:id/strategy-helpful` endpoint
- Add field to response document:
  ```javascript
  goalAchieved: String,  // "yes", "partial", "no"
  ```

---

### 3.2 "Next Time, I'll..." Reflection

**Location:** `frontend/src/pages/Learning.jsx` (EVALUATE phase section)

**Requirements:**
- Prompt: "Next time, I'll:"
- Options (select one):
  - Try a different strategy
  - Slow down more
  - Review content before answering
  - Ask for hints earlier
  - (Custom text input option)
- Store in response document

**UI Design (add after strategy reflection):**
```
┌──────────────────────────────────────────────────┐
│ 🔄 Plan for Next Time                            │
│                                                  │
│ Based on this experience, next time I'll:       │
│                                                  │
│ ○ Try a different strategy                      │
│ ○ Slow down and think more carefully            │
│ ○ Review the content before answering           │
│ ○ Ask for hints earlier                         │
│ ○ Other: [____________________________]         │
│                                                  │
└──────────────────────────────────────────────────┘
```

**Implementation Steps:**
1. Add state: `const [nextTimeAdjustment, setNextTimeAdjustment] = useState("")`
2. Add state: `const [nextTimeCustom, setNextTimeCustom] = useState("")`
3. Create radio button group with options
4. Show text input if "Other" is selected
5. Update `markStrategyHelpful()` call to include adjustment
6. Require this before "Next chunk" button is enabled

**Backend Changes:**
- Update `routes/userResponseRoute.js`
- Modify `PATCH /responses/:id/strategy-helpful` endpoint
- Add field to response document:
  ```javascript
  nextTimeAdjustment: String,
  ```

---

## Phase 4: Backend Schema Updates

### 4.1 Enhanced Chunk Generation

**Location:** `services/llm/geminiService.js`, `openaiService.js`, `claudeService.js`

**Requirements:**
- Add `planPrompt` to each chunk
- Add `hints` array (3 progressive hints)
- Add `evaluationPrompt` to each chunk

**Current Chunk Schema:**
```javascript
{
  chunkId: String,
  topic: String,
  miniTeach: String,
  question: String,
  expectedPoints: [String],
}
```

**Enhanced Chunk Schema:**
```javascript
{
  chunkId: String,
  topic: String,
  planPrompt: String,           // NEW
  miniTeach: String,
  question: String,
  expectedPoints: [String],
  hints: [String],              // NEW - Array of 3 hints
  evaluationPrompt: String,     // NEW
  difficulty: String,           // OPTIONAL
  example: String,              // OPTIONAL
}
```

**Implementation Steps:**

**1. Update LLM Prompts (Gemini example):**

```javascript
// In services/llm/geminiService.js

const CHUNK_GENERATION_PROMPT = `
You are an expert instructional designer creating learning chunks for metacognitive learning.

Given this content, create 5-8 bite-sized learning chunks. Each chunk should:

1. **Topic**: A clear, specific topic name
2. **planPrompt**: A reflection question to activate prior knowledge
   - Example: "Before learning about photosynthesis, what do you already know about how plants get energy?"
   - Should help learners connect to what they know
3. **miniTeach**: A self-contained explanation (2-4 sentences)
   - Must teach the concept clearly
   - Include key information needed to answer the question
4. **question**: A question that tests understanding
   - Should require explanation, not just recall
5. **expectedPoints**: 3-5 key points that should be in a good answer
6. **hints**: Array of exactly 3 progressive hints
   - Hint 1: Gentle nudge (general direction)
   - Hint 2: More specific (point to key concept)
   - Hint 3: Almost complete (very specific)
7. **evaluationPrompt**: Custom prompt for evaluating this specific chunk's answer
   - Should guide the LLM to check for specific concepts

Return ONLY valid JSON array of chunks, no markdown formatting.

Content to chunk:
{content}
`;
```

**2. Update Response Interface:**

All LLM services must return chunks matching the enhanced schema.

**3. Update Validation:**

```javascript
// In services/llm/geminiService.js

function validateChunks(chunks) {
  if (!Array.isArray(chunks)) {
    throw new Error("Chunks must be an array");
  }

  chunks.forEach((chunk, index) => {
    if (!chunk.topic || !chunk.miniTeach || !chunk.question) {
      throw new Error(`Chunk ${index} missing required fields`);
    }

    if (!chunk.planPrompt) {
      throw new Error(`Chunk ${index} missing planPrompt`);
    }

    if (!Array.isArray(chunk.hints) || chunk.hints.length !== 3) {
      throw new Error(`Chunk ${index} must have exactly 3 hints`);
    }

    if (!chunk.evaluationPrompt) {
      throw new Error(`Chunk ${index} missing evaluationPrompt`);
    }

    if (!Array.isArray(chunk.expectedPoints) || chunk.expectedPoints.length < 3) {
      throw new Error(`Chunk ${index} must have at least 3 expected points`);
    }
  });

  return chunks;
}
```

**4. Use evaluationPrompt in Response Evaluation:**

```javascript
// In evaluateResponseWithGemini()

const evaluationPrompt = `
${chunk.evaluationPrompt}

Question: ${question}
Expected points: ${expectedPoints.join(", ")}
Student's answer: ${userAnswer}

Provide:
1. Which expected points they captured (array)
2. Which points they missed (array)
3. Accuracy percentage (0-100)
4. Constructive feedback (2-3 sentences)
`;
```

---

### 4.2 Update Response Schema

**Location:** `routes/userResponseRoute.js`

**Current Response Schema:**
```javascript
{
  sessionId: ObjectId,
  userId: String,
  chunkId: String,
  chunkTopic: String,
  goal: String,
  strategy: String,
  question: String,
  userAnswer: String,
  confidence: Number,
  expectedPoints: [String],
  correctPoints: [String],
  missingPoints: [String],
  accuracy: Number,
  calibrationError: Number,
  calibrationDirection: String,
  feedback: String,
  strategyHelpful: Boolean,
  strategyReflection: String,
  createdAt: Date,
  planTimeSeconds: Number,
  monitorTimeSeconds: Number,
  evaluateTimeSeconds: Number,
  timeSpentSeconds: Number,
  hintsUsed: Number,
  contentReviewed: Boolean,
}
```

**Enhanced Response Schema:**
```javascript
{
  // Existing fields...

  // NEW - Phase 1 additions
  priorKnowledge: String,
  hasPriorKnowledge: Boolean,
  priorKnowledgeTimeSeconds: Number,
  customStrategyDescription: String,

  // NEW - Phase 2 additions
  muddyPoint: String,

  // NEW - Phase 3 additions
  goalAchieved: String,  // "yes", "partial", "no"
  nextTimeAdjustment: String,

  // Existing fields remain...
}
```

**Implementation Steps:**

**1. Update POST /api/responses:**

```javascript
// In routes/userResponseRoute.js

router.post("/", async (req, res) => {
  const {
    sessionId,
    chunkId,
    goal,
    strategy,
    customStrategyDescription = "",  // NEW
    priorKnowledge = "",              // NEW
    hasPriorKnowledge = true,         // NEW
    userAnswer,
    confidence,
    muddyPoint = "",                  // NEW
    provider = "GEMINI",
    planTimeSeconds = 0,
    priorKnowledgeTimeSeconds = 0,    // NEW
    monitorTimeSeconds = 0,
    hintsUsed = 0,
    contentReviewed = false,
  } = req.body;

  // ... existing validation ...

  const response = {
    // ... existing fields ...

    // NEW fields
    priorKnowledge,
    hasPriorKnowledge,
    priorKnowledgeTimeSeconds,
    customStrategyDescription,
    muddyPoint,

    // These will be updated later via PATCH
    goalAchieved: null,
    nextTimeAdjustment: null,
  };

  // ... rest of implementation ...
});
```

**2. Update PATCH /api/responses/:id/strategy-helpful:**

```javascript
router.patch("/:id/strategy-helpful", async (req, res) => {
  const { id } = req.params;
  const {
    strategyHelpful,
    strategyReflection = "",
    goalAchieved = null,          // NEW
    nextTimeAdjustment = null,    // NEW
  } = req.body;

  // ... existing validation ...

  const updateFields = {
    strategyHelpful,
  };

  if (strategyReflection && strategyReflection.trim()) {
    updateFields.strategyReflection = strategyReflection.trim();
  }

  // NEW additions
  if (goalAchieved) {
    updateFields.goalAchieved = goalAchieved;
  }

  if (nextTimeAdjustment) {
    updateFields.nextTimeAdjustment = nextTimeAdjustment;
  }

  // ... rest of implementation ...
});
```

---

## Testing Checklist

### Frontend Testing

**PLAN Phase:**
- [ ] Prior knowledge step appears first
- [ ] Can enter prior knowledge text
- [ ] Can check "no prior knowledge" checkbox
- [ ] Checkbox disables textarea
- [ ] 3 goals displayed with icons and descriptions
- [ ] Goal selection works
- [ ] 6 strategies displayed with icons and descriptions
- [ ] Strategy selection works
- [ ] "My own approach" shows custom input field
- [ ] Cannot continue without filling custom strategy
- [ ] MiniTeach displays after prior knowledge step
- [ ] Time tracking works for prior knowledge step

**MONITOR Phase:**
- [ ] Question displays correctly
- [ ] Strategy reminder shows selected strategy
- [ ] Answer textarea works
- [ ] Muddiest point input appears
- [ ] Confidence slider works
- [ ] "Review content" button appears
- [ ] Content shows/hides when button clicked
- [ ] Hints button appears
- [ ] Hints display progressively
- [ ] Hint count increments correctly
- [ ] Cannot submit without answer
- [ ] Time tracking works

**EVALUATE Phase:**
- [ ] Performance display shows accuracy
- [ ] Calibration check displays correctly
- [ ] Feedback displays
- [ ] Goal achievement question appears
- [ ] Goal achievement buttons work
- [ ] Strategy reflection textarea works
- [ ] "Next time I'll" section appears
- [ ] Can select next-time adjustment
- [ ] Custom adjustment input works
- [ ] Cannot continue without completing all reflections
- [ ] "Next chunk" button works

### Backend Testing

**Chunk Generation:**
- [ ] Chunks include planPrompt
- [ ] Chunks include hints array (3 items)
- [ ] Chunks include evaluationPrompt
- [ ] All chunk fields validate correctly

**Response Creation:**
- [ ] POST /api/responses accepts new fields
- [ ] priorKnowledge stored correctly
- [ ] hasPriorKnowledge stored correctly
- [ ] customStrategyDescription stored correctly
- [ ] muddyPoint stored correctly
- [ ] Time tracking includes priorKnowledgeTimeSeconds

**Response Update:**
- [ ] PATCH /api/responses/:id/strategy-helpful accepts goalAchieved
- [ ] PATCH /api/responses/:id/strategy-helpful accepts nextTimeAdjustment
- [ ] All fields update correctly in database

**Session Summary:**
- [ ] Summary includes strategy performance
- [ ] Custom strategies tracked separately
- [ ] Insights generation works with new data

### Integration Testing

**Full Learning Loop:**
- [ ] User can complete entire loop with all new features
- [ ] Data persists correctly to database
- [ ] Session summary reflects all data
- [ ] Can navigate back and see historical data
- [ ] Session redo works with new schema
- [ ] Session delete works

---

## Database Schema Changes

### Collections to Update

**1. sessions collection:**
```javascript
// No changes needed - chunks are embedded documents
// The chunk schema updates happen at generation time
```

**2. responses collection:**
```javascript
// Add indexes for new query patterns
db.responses.createIndex({ "goalAchieved": 1 });
db.responses.createIndex({ "hasPriorKnowledge": 1 });
db.responses.createIndex({ "customStrategyDescription": 1 });
```

### Migration Strategy

**No migration needed** - All new fields are optional and have default values. Existing responses will work fine without these fields.

**New responses** will include all fields going forward.

---

## Component Structure Changes

### New Components to Create

**Optional (for better organization):**

1. `frontend/src/components/PriorKnowledgeStep.jsx`
2. `frontend/src/components/GoalSelector.jsx`
3. `frontend/src/components/StrategySelector.jsx`
4. `frontend/src/components/CustomStrategyInput.jsx`
5. `frontend/src/components/HintsDisplay.jsx`
6. `frontend/src/components/GoalEvaluation.jsx`
7. `frontend/src/components/NextTimeReflection.jsx`

**OR:** Keep all in `Learning.jsx` for MVP (current approach is fine)

---

## Implementation Order

### Recommended Sequence

**Day 1: PLAN Phase**
1. Add prior knowledge step (1.1)
2. Update goals to 3 (1.2)
3. Expand strategies to 6 + custom (1.3)

**Day 2: MONITOR Phase**
1. Add muddiest point input (2.1)
2. Add content review toggle (2.3)
3. Add hints system frontend (2.2 - part 1)

**Day 3: EVALUATE Phase**
1. Add goal evaluation (3.1)
2. Add next-time reflection (3.2)

**Day 4: Backend Enhancements**
1. Update chunk generation prompts (4.1)
2. Add hints to chunks (2.2 - part 2)
3. Test all LLM providers

**Day 5: Testing & Polish**
1. Full integration testing
2. Bug fixes
3. UI/UX improvements
4. Documentation updates

---

## Success Metrics

### Before Implementation
- Goals: 4 (wrong)
- Strategies: 5 (incomplete)
- PLAN phase: 1 step (missing prior knowledge)
- MONITOR phase: Basic (missing hints, content review, muddiest point)
- EVALUATE phase: Partial (missing goal evaluation, next-time reflection)

### After Implementation
- Goals: 3 ✓ (aligned with MVP)
- Strategies: 6 + custom ✓ (complete)
- PLAN phase: 2 steps ✓ (prior knowledge + goal/strategy)
- MONITOR phase: Complete ✓ (all scaffolding features)
- EVALUATE phase: Complete ✓ (all reflection features)

---

## Notes for AI Agent

**Critical Rules:**
1. Read existing code carefully before making changes
2. Maintain existing styling patterns
3. Preserve all current functionality
4. Add features incrementally (test after each)
5. Update both frontend AND backend for each feature
6. Follow existing naming conventions
7. Add proper error handling
8. Test database operations
9. Verify LLM integration works with new prompts
10. Update documentation as you go

**Files to Modify:**
- `frontend/src/pages/Learning.jsx` (primary)
- `routes/userResponseRoute.js` (response schema)
- `services/llm/geminiService.js` (chunk generation)
- `services/llm/openaiService.js` (chunk generation)
- `services/llm/claudeService.js` (chunk generation)
- `frontend/src/services/api.js` (if needed for new endpoints)

**Files to Reference:**
- `docs/METACOGNITION_EXPLAINED.md` (feature rationale)
- `docs/MVP_DECISIONS.md` (detailed requirements)
- `docs/UNIVERSITY_PROJECT_DESIGN.md` (UI mockups)

---

**Document Version:** 1.0
**Last Updated:** 2025-12-02
**Ready for Implementation:** YES ✅

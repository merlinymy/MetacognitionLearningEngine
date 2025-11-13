# MVP Decisions & Clarifications

**Date:** Current
**Status:** Ready for Implementation

---

## Key Questions & Answers

### 1. Can Users Still Upload Materials?

**YES** - The upload flow remains unchanged. The redesign only affects the Learning Loop page.

**Flow:**
```
Landing → Upload → Processing → Library → Learning Loop (REDESIGNED)
```

---

### 2. What If Users Have No Prior Knowledge?

**Solution:** Make prior knowledge input optional with explicit "no knowledge" option.

#### Updated Prior Knowledge Step:

```
┌─────────────────────────────────────────────────────────┐
│ 📖 Topic: [Chunk Topic]                                │
│                                                          │
│ Before we begin, take a moment to think:                │
│                                                          │
│ [planPrompt from chunk]                                 │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Your initial thoughts (optional):                   │ │
│ │ [                                              ]    │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ [ ] I have no prior knowledge of this topic            │
│     (That's totally fine! This helps us understand     │
│      where you're starting from.)                      │
│                                                          │
│                               [Continue →]              │
└─────────────────────────────────────────────────────────┘
```

**Key Changes:**
- Text input is optional (can be left blank)
- Checkbox for "no prior knowledge"
- Positive framing (not shameful)
- Tracked for analytics

**Backend Tracking:**
```javascript
planPhase: {
  priorKnowledge: String,          // empty if skipped
  hasPriorKnowledge: Boolean,     // false if checkbox checked
  timeSpent: Number,
}
```

---

### 3. How Many Learning Goals?

**MVP Decision: Keep 3 goals**

```javascript
const goals = [
  {
    id: 'gist',
    icon: '📋',
    title: 'Get the gist',
    description: 'Understand the main idea quickly',
    bloomLevel: 'understand',
  },
  {
    id: 'explain',
    icon: '💡',
    title: 'Be able to explain',
    description: 'Deeply understand to teach others',
    bloomLevel: 'comprehend',
  },
  {
    id: 'apply',
    icon: '🛠️',
    title: 'Apply to a problem',
    description: 'Use this concept in practice',
    bloomLevel: 'apply',
  },
];
```

**Reasoning:**
- Maps to Bloom's Taxonomy
- Easy to choose (not overwhelming)
- Sufficient for MVP validation
- Can expand post-MVP

**Post-MVP Expansions:**
- 🔍 Analyze critically (Bloom: Analyze)
- ✨ Create something new (Bloom: Create)
- 🧠 Memorize for exam (Bloom: Remember)

---

### 4. How Many Learning Strategies?

**MVP Decision: 6 strategies (5 preset + "Other")**

```javascript
const strategies = [
  {
    id: 'self-explain',
    icon: '💬',
    title: 'Self-explain',
    description: 'Describe the concept in your own words',
    guidance: 'Imagine teaching this to a friend. What would you say?',
    bestFor: ['concepts', 'processes'],
  },
  {
    id: 'visualize',
    icon: '✏️',
    title: 'Visualize it',
    description: 'Create a mental image or diagram',
    guidance: 'What would this look like as a picture or flowchart?',
    bestFor: ['systems', 'relationships', 'structures'],
  },
  {
    id: 'example',
    icon: '📝',
    title: 'Work an example',
    description: 'Apply to a concrete case',
    guidance: 'Try the concept with specific numbers or scenarios',
    bestFor: ['procedures', 'code', 'formulas'],
  },
  {
    id: 'connect',
    icon: '🔗',
    title: 'Connect to prior knowledge',
    description: 'Link to something you already know',
    guidance: 'How is this similar to concepts you already understand?',
    bestFor: ['new-concepts', 'analogies', 'building-on-basics'],
  },
  {
    id: 'teach',
    icon: '👥',
    title: 'Pretend to teach',
    description: 'Explain as if teaching someone',
    guidance: 'What would you write on a whiteboard to explain this?',
    bestFor: ['complex-ideas', 'deep-understanding'],
  },
  {
    id: 'other',
    icon: '✨',
    title: 'My own approach',
    description: 'Use your preferred strategy',
    requiresInput: true,
  },
];
```

**If user selects "Other":**
```
┌─────────────────────────────────────────────────────────┐
│ ✨ Using your own approach                              │
│                                                          │
│ Briefly describe your strategy:                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ e.g., "Create a mnemonic", "Compare to a similar    │ │
│ │ concept I know", "Think of real-world uses"         │ │
│ │ [                                              ]    │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ ℹ️  We'll track how well this works for you!            │
│                                                          │
│                                    [Continue →]         │
└─────────────────────────────────────────────────────────┘
```

**Backend Tracking:**
```javascript
planPhase: {
  strategy: String,               // 'self-explain', 'other', etc.
  customStrategyDescription: String,  // only if strategy === 'other'
}
```

**Reasoning:**
- 5 preset strategies cover major evidence-based approaches
- "Other" allows flexibility without overwhelming UI
- Can analyze custom strategies over time
- Balances structure with user agency

**Post-MVP Additions:**
- Quiz myself (retrieval practice)
- Elaborate (ask why questions)
- Space it out (distributed practice)

---

### 5. Upload Type for MVP?

**MVP Decision: Text paste only**

#### Simplified Upload Page:

```
┌─────────────────────────────────────────────────────────┐
│ 📝 Upload Learning Material (MVP)                       │
│                                                          │
│ Paste your learning material below:                     │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │                                                     │ │
│ │ [Large textarea]                                   │ │
│ │ Minimum 500 characters                             │ │
│ │                                                     │ │
│ │                                                     │ │
│ │                                                     │ │
│ │                                                     │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ 📊 Character count: 1,245                               │
│ Estimated chunks: 5-8                                   │
│                                                          │
│ ───────────────────────────────────────────────────────│
│                                                          │
│ Optional settings:                                      │
│                                                          │
│ Title (optional):                                       │
│ [_____________________________]                         │
│                                                          │
│ Subject area:                                           │
│ [ Select: Programming, Science, Math, Business, Other] │
│                                                          │
│ Difficulty:                                             │
│ ⚫ Auto-detect  ○ Basic  ○ Intermediate  ○ Advanced     │
│                                                          │
│ Target chunks:                                          │
│ [ 5-8 chunks (default) ▼ ]                             │
│                                                          │
│ ✨ AI will transform this into bite-sized learning     │
│    chunks with metacognitive prompts                    │
│                                                          │
│                              [Generate Chunks →]        │
└─────────────────────────────────────────────────────────┘
```

**Reasoning:**
- ✅ Faster to implement
- ✅ Fewer edge cases (no PDF parsing errors)
- ✅ Easier for testing
- ✅ Sufficient to validate metacognition features
- ✅ Can add file upload post-MVP

**Post-MVP File Upload:**
- PDF support (.pdf)
- Word documents (.docx)
- Markdown (.md)
- Plain text (.txt)
- Web articles (URL paste)

---

## Updated Component Structure

### Strategy Selector Component

```javascript
// StrategySelector.jsx

const StrategySelector = ({
  strategies,
  selected,
  onSelect,
  userStats,  // for personalized recommendations
  goal,       // current goal for compatibility
}) => {
  return (
    <div>
      <h3>🧭 What strategy will you try?</h3>
      <p className="text-sm text-gray-600">
        Your goal: {goalLabels[goal]}
      </p>

      <div className="grid gap-4">
        {strategies.map(strategy => (
          <SelectionCard
            key={strategy.id}
            icon={strategy.icon}
            title={strategy.title}
            description={strategy.description}
            selected={selected === strategy.id}
            onClick={() => onSelect(strategy.id)}
            badge={getRecommendationBadge(strategy, goal, userStats)}
          />
        ))}
      </div>

      {selected === 'other' && (
        <CustomStrategyInput onSubmit={handleCustomStrategy} />
      )}
    </div>
  );
};
```

### Custom Strategy Input Component

```javascript
// CustomStrategyInput.jsx

const CustomStrategyInput = ({ onSubmit }) => {
  const [strategyDescription, setStrategyDescription] = useState('');

  return (
    <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-4">
      <h4 className="font-semibold text-purple-900 mb-2">
        ✨ Describe your strategy:
      </h4>

      <input
        type="text"
        value={strategyDescription}
        onChange={(e) => setStrategyDescription(e.target.value)}
        placeholder='e.g., "Create a mnemonic", "Think of real-world uses"'
        className="w-full px-4 py-2 border border-purple-300 rounded focus:ring-2 focus:ring-purple-500"
      />

      <p className="text-sm text-purple-700 mt-2">
        ℹ️ We'll track how well this works for you!
      </p>
    </div>
  );
};
```

---

## Updated State Management

### LearningLoopPage State Variables

```javascript
// PLAN phase
const [priorKnowledge, setPriorKnowledge] = useState('');
const [hasPriorKnowledge, setHasPriorKnowledge] = useState(true);  // NEW
const [customStrategy, setCustomStrategy] = useState('');          // NEW

// Existing...
const [selectedGoal, setSelectedGoal] = useState(null);
const [selectedStrategy, setSelectedStrategy] = useState(null);
```

---

## Updated Database Schema

### Chunks Collection - No Changes Needed

Your chunk structure already supports everything:
```javascript
{
  topic: String,
  planPrompt: String,      // ✅ Already in design
  miniTeach: String,
  question: String,
  expectedPoints: [String],
  evaluationPrompt: String, // ✅ Already in design
  hints: [String],         // ✅ Already in design
  example: String,
  difficulty: String,
  prerequisites: [String],
}
```

### User Responses - Add Custom Strategy Field

```javascript
{
  // ... existing fields ...

  planPhase: {
    priorKnowledge: String,
    hasPriorKnowledge: Boolean,        // NEW - tracks "no prior knowledge"
    goal: String,
    strategy: String,
    customStrategyDescription: String, // NEW - only if strategy === 'other'
    timeSpent: Number,
  },

  // ... rest of schema ...
}
```

---

## Implementation Priority for MVP

### Must-Have (Phase 1)

1. ✅ **Prior Knowledge Step**
   - Optional text input
   - "No prior knowledge" checkbox
   - Skip logic if checkbox is checked

2. ✅ **6 Strategy Options**
   - 5 preset strategies with descriptions
   - "Other" option with text input
   - Track custom strategy descriptions

3. ✅ **Text-Only Upload**
   - Remove file upload UI
   - Large textarea with character count
   - Basic metadata (title, subject, difficulty)

4. ✅ **3 Learning Goals**
   - Keep current 3 goals
   - Add descriptions to help users choose

### Nice-to-Have (Post-MVP)

1. ⏳ More strategies (quiz, elaborate, etc.)
2. ⏳ More goals (analyze, create, memorize)
3. ⏳ File upload support
4. ⏳ Adaptive planPrompts based on difficulty
5. ⏳ Strategy recommendations based on history

---

## User Flow Summary

### Complete MVP Flow:

```
1. UPLOAD (Text only)
   └─> Paste text → Set metadata → Generate chunks

2. LIBRARY
   └─> Select material → Start learning

3. PLAN PHASE
   ├─> Step 1: Prior Knowledge (optional + checkbox)
   ├─> Step 2: Select Goal (3 options)
   ├─> Step 3: Select Strategy (6 options + custom)
   └─> Step 4: Show Content (miniTeach)

4. MONITOR PHASE
   ├─> Question (with strategy reminder)
   ├─> Hints (progressive, if requested)
   ├─> Monitoring Checklist
   └─> Confidence + Muddy Point

5. EVALUATE PHASE
   ├─> Performance Feedback
   ├─> Calibration Check
   ├─> Goal Evaluation
   ├─> Strategy Reflection (nuanced)
   ├─> Custom Evaluation Prompt
   └─> Plan Next Chunk

6. Repeat for next chunk or complete session
```

---

## Analytics to Track

### New Metrics for Custom Strategies

```javascript
// Track custom strategy effectiveness
{
  userId: ObjectId,
  customStrategies: [
    {
      description: "Create visual analogies",
      timesUsed: 5,
      avgAccuracy: 82,
      avgConfidence: 75,
      contexts: ["biology", "chemistry"],
    },
    {
      description: "Relate to video games",
      timesUsed: 3,
      avgAccuracy: 90,
      avgConfidence: 85,
      contexts: ["programming", "algorithms"],
    },
  ],
}
```

### Prior Knowledge Tracking

```javascript
// Track correlation between prior knowledge and performance
{
  chunkId: ObjectId,
  hasPriorKnowledge: Boolean,
  priorKnowledgeLength: Number,  // character count
  accuracy: Number,
  confidenceBeforeLearning: Number,  // could add this!
}
```

**Insight Potential:**
- Do users with prior knowledge perform better?
- Do users overestimate prior knowledge? (familiarity bias)
- Which topics have lowest "prior knowledge" rates? (indicates difficulty)

---

## Testing Scenarios for MVP

### 1. Complete Beginner Path

```
User flow:
1. Pastes text about quantum physics (no prior knowledge)
2. Checks "I have no prior knowledge" ✓
3. Selects goal: "Get the gist" ✓
4. Selects strategy: "Visualize it" ✓
5. Reads miniTeach
6. Struggles with question → Requests hints ✓
7. Uses all 3 hints
8. Answers with moderate confidence (50%)
9. Gets 60% accuracy → Good calibration! ✓
10. Reflects: "Visualization helped me see structure"
11. Next chunk: Tries "Self-explain" to compare
```

**Expected outcome:** User feels supported, not penalized for being beginner.

---

### 2. Advanced Learner Path

```
User flow:
1. Pastes text about recursion (has prior knowledge)
2. Fills in prior knowledge: "I know loops and function calls"
3. Selects goal: "Apply to a problem" ✓
4. Selects strategy: "Other" → "Break it into base/recursive cases" ✓
5. Reads miniTeach quickly
6. Answers without hints ✓
7. High confidence (90%)
8. Gets 95% accuracy → Slight underconfidence
9. Reflects: "My custom strategy works well!"
10. System learns this strategy works for this user
```

**Expected outcome:** User feels agency, system learns from them.

---

### 3. Mixed Knowledge Path

```
User flow:
1. Pastes text about React hooks (partial knowledge)
2. Prior knowledge: "I know useState but not useEffect"
3. Selects goal: "Be able to explain" ✓
4. Chunk 1 (useState): Skips prior knowledge (already knows)
5. Chunk 2 (useEffect): Fills in prior knowledge ✓
6. System sees different prep for different chunks ✓
```

**Expected outcome:** Flexibility to adapt per chunk.

---

## Open Questions Resolved

| Question | Decision | Rationale |
|----------|----------|-----------|
| Keep uploads? | ✅ Yes, text only for MVP | Simplifies implementation |
| No prior knowledge? | ✅ Optional + checkbox | Supports beginners |
| More goals? | ❌ Keep 3 for MVP | Sufficient coverage |
| More strategies? | ✅ Yes, 6 total | More choice without overwhelming |
| Custom strategies? | ✅ Yes, via "Other" | Balances structure + agency |

---

## Next Steps

1. **Review this document** - Confirm all decisions align with vision

2. **Update chunk generation prompt** - Ensure it generates appropriate planPrompts for beginners vs. advanced

3. **Start Phase 1 implementation:**
   - Update UploadPage (text-only)
   - Create PriorKnowledgePrompt component
   - Expand strategies to 6
   - Add custom strategy input

4. **Test with real users** - Validate these decisions with actual learners

---

## Success Criteria for MVP

### User Can Complete This Flow:

1. ✅ Paste text content
2. ✅ Generate chunks
3. ✅ Select a chunk
4. ✅ PLAN: Activate prior knowledge (or skip)
5. ✅ PLAN: Select goal
6. ✅ PLAN: Select strategy (including custom)
7. ✅ MONITOR: Read content
8. ✅ MONITOR: Answer question
9. ✅ MONITOR: Rate confidence
10. ✅ EVALUATE: See feedback
11. ✅ EVALUATE: Reflect on strategy
12. ✅ Complete all chunks in session

### Data is Tracked:

1. ✅ Prior knowledge (or lack thereof)
2. ✅ Custom strategies
3. ✅ Strategy effectiveness
4. ✅ Calibration over time
5. ✅ Goal achievement

### User Feels:

1. ✅ Not penalized for being a beginner
2. ✅ Has meaningful choices
3. ✅ Learns about their learning
4. ✅ Gets personalized feedback
5. ✅ Wants to continue learning

---

**Document Status:** Ready for review and implementation
**Last Updated:** [Current Date]
**Version:** 1.0

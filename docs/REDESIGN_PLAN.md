# Metacognitive Learning Engine - Comprehensive Redesign Plan

## Executive Summary

This document outlines a complete redesign of the learning loop to properly implement research-backed metacognitive learning principles. The current implementation has the structure of metacognition but lacks the substance needed to actually provoke metacognitive thinking.

**Timeline:** No rush - focus on doing it right.

---

## Table of Contents

1. [Core Problems with Current Implementation](#core-problems)
2. [Research-Based Requirements](#research-requirements)
3. [Detailed Phase-by-Phase Redesign](#phase-redesign)
4. [Frontend Component Changes](#frontend-changes)
5. [Backend/Data Structure Changes](#backend-changes)
6. [User Experience Improvements](#ux-improvements)
7. [Implementation Roadmap](#roadmap)
8. [Success Metrics](#metrics)

---

## Core Problems with Current Implementation {#core-problems}

### 1. **PLAN Phase Violates Metacognitive Principles**

**Current Flow:**
```
1. Show miniTeach content
2. Ask for learning goal
3. Ask for strategy
4. Move to MONITOR phase
```

**Problems:**
- ❌ Content is shown BEFORE planning
- ❌ Goal-setting is performative (user already saw content)
- ❌ Strategy selection has no context
- ❌ Prior knowledge is never activated
- ❌ planPrompt field is designed but NOT USED

**Research Evidence:**
> "Pre-assessments that help students understand their existing knowledge about a topic can help them plan their learning approach." (articleOnMetacognition.txt, lines 24-26)

> "Planning: What is the nature of the task? What is my goal? What information, resources, and strategies do I need?" (articleOnMetacognition.txt, lines 32-36)

**Impact:** Users are going through motions without genuine planning.

---

### 2. **MONITOR Phase Lacks Guidance**

**Current Flow:**
```
1. Show question
2. Generic textarea: "Explain in your own words..."
3. Confidence slider
4. Muddiest point (optional)
```

**Problems:**
- ❌ No scaffolding for self-explanation
- ❌ Doesn't connect to selected goal
- ❌ No monitoring prompts during writing
- ❌ Missing intermediate checks ("Does this make sense?")
- ❌ Immediate reflection (research shows delayed is better)

**Research Evidence:**
> "Monitoring: Do I have a clear understanding of what I am doing? Does the task make sense? Am I reaching my goals? Do I need to make changes to my plan?" (articleOnMetacognition.txt, lines 37-41)

> "Self-assessment is prone to error and bias... judgments of learning following a delayed retrieval attempt from memory will lead to more accurate monitoring" (articleOnMetacognition.txt, lines 83-85)

**Impact:** Students don't develop accurate self-monitoring skills.

---

### 3. **EVALUATE Phase is Too Superficial**

**Current Flow:**
```
1. Show feedback (correct/missing points)
2. Binary: "Did strategy help?" Yes/No
3. Select one adjustment: "Next time I'll..."
4. Calibration feedback
5. Next chunk
```

**Problems:**
- ❌ Binary feedback doesn't capture nuance
- ❌ No reflection on WHY strategy worked/didn't work
- ❌ Doesn't connect performance to goal
- ❌ Missing deep evaluation prompts
- ❌ evaluationPrompt field designed but NOT USED
- ❌ No attribution to effort vs. external factors

**Research Evidence:**
> "Evaluate: Think about both the outcome on the assignment/assessment and the effectiveness of the strategies used, while attributing performance to effort/strategies rather than external influences." (articleOnSelfRegulation.txt, line 7)

> "Evaluating: Have I reached my goal? What worked? What didn't work? What would I do differently next time?" (articleOnMetacognition.txt, lines 42-46)

**Impact:** No deep reflection means no learning from the process.

---

### 4. **Missing Critical Features from Chunk Design**

You designed these fields in `chunkGenerationPrompt.js` but DON'T USE them:

| Field | Purpose | Currently Used? |
|-------|---------|----------------|
| `planPrompt` | Activate prior knowledge | ❌ NO |
| `evaluationPrompt` | Guide reflection | ❌ NO |
| `hints` | Progressive scaffolding | ❌ NO |
| `prerequisites` | Show connections | ❌ NO |

**Impact:** Your prompt engineering is excellent, but implementation doesn't match the design.

---

### 5. **Goal Setting is Non-Functional**

**Current Goals:**
- 📋 Get the gist
- 💡 Be able to explain
- 🛠️ Apply to a problem

**What happens with goals?**
- User selects one → stored in state
- Question is THE SAME regardless of goal
- Feedback is THE SAME regardless of goal
- No evaluation of whether goal was met

**Research Evidence:**
> "Different goals require different strategies" (METACOGNITION_EXPLAINED.md, line 38)

**Impact:** Goal-setting becomes meaningless clicking.

---

### 6. **Strategy Selection Lacks Follow-Through**

**Current Strategies:**
- 💬 Self-explain
- ✏️ Draw a diagram
- 📝 Work an example

**What happens with strategies?**
- User selects one → stored in state
- UI shows a badge "Strategy: 💬"
- That's it. No guidance on HOW to use the strategy
- No structured support for the chosen strategy

**Example Missing Support:**
- If "Draw a diagram" → should provide drawing canvas
- If "Work an example" → should provide example workspace
- If "Self-explain" → should provide sentence starters

**Impact:** Strategy selection is performative, not functional.

---

### 7. **No Calibration Tracking Over Time**

**Current Calibration:**
```javascript
You were 80% confident → Actually got it 60% right!
Calibration: -20% (overconfident)
Keep practicing to improve calibration 📊
```

**What's Missing:**
- No historical tracking of calibration
- No visualization of improvement
- No analysis by topic/difficulty
- No personalized feedback based on patterns

**Research Evidence:**
> "Poor calibration is a sign of the Dunning-Kruger effect (overconfidence in beginners). Good learners know what they don't know" (METACOGNITION_EXPLAINED.md, lines 72-73)

**Impact:** Can't develop accurate self-assessment over time.

---

### 8. **No Strategy Effectiveness Tracking**

**Current State:**
- "Did your strategy help?" → Yes/No
- Data is captured but never analyzed
- No feedback like "Self-explain works best for you on code topics"

**Research Evidence:**
> "Over time, enables personalized strategy recommendations" (METACOGNITION_EXPLAINED.md, line 110)

**Impact:** Users don't learn which strategies work for THEM.

---

## Research-Based Requirements {#research-requirements}

Based on the literature (articleOnMetacognition.txt, articleOnSelfRegulation.txt), here's what the application MUST do:

### A. Activate Prior Knowledge (PLAN)

**From Research:**
> "Pre-assessments that help students understand their existing knowledge about a topic can help them plan their learning approach." (articleOnMetacognition.txt)

**Requirements:**
1. ✅ Ask what user already knows BEFORE showing content
2. ✅ Let user predict what they'll learn
3. ✅ Connect new learning to existing knowledge
4. ✅ Set explicit goals matched to the content

---

### B. Provide Metacognitive Scaffolding (MONITOR)

**From Research:**
> "Regulatory checklists: An explicit list of prompts about planning, monitoring, and evaluating can help students better regulate their learning" (articleOnMetacognition.txt, lines 28-30)

**Requirements:**
1. ✅ Prompt monitoring questions during learning
2. ✅ Provide strategy-specific guidance
3. ✅ Check understanding incrementally
4. ✅ Allow course correction mid-chunk

---

### C. Enable Deep Reflection (EVALUATE)

**From Research:**
> "Self-regulated learners will reflect on their learning strategies and their resultant performance to better inform their approach to future learning experiences." (articleOnMetacognition.txt, lines 49-51)

**Requirements:**
1. ✅ Connect outcome to goal
2. ✅ Reflect on strategy effectiveness (WHY it worked/didn't)
3. ✅ Attribute performance to effort/strategy (not external factors)
4. ✅ Make concrete plans for adjustment

---

### D. Support Accurate Self-Assessment

**From Research:**
> "Students should be informed of conditions and practices that may lead to more accurate judgments of learning" (articleOnMetacognition.txt, lines 84-85)

**Requirements:**
1. ✅ Track calibration over time
2. ✅ Warn about familiarity bias
3. ✅ Encourage delayed retrieval practice
4. ✅ Show calibration trends and patterns

---

### E. Provide Progressive Hints

**From Research:**
> "Novices are not as good at self-evaluating their comprehension, so build in opportunities for formative assessment." (articleOnMetacognition.txt, lines 98-99)

**Requirements:**
1. ✅ Offer hints when user struggles
2. ✅ Make hints progressive (don't give away answer)
3. ✅ Track hint usage patterns
4. ✅ Use hints to identify knowledge gaps

---

### F. Enable Strategy Development

**From Research:**
> "Students with more metacognitive knowledge learn better than those with less metacognitive knowledge." (articleOnMetacognition.txt, lines 10-11)

**Requirements:**
1. ✅ Track which strategies work for which content
2. ✅ Provide personalized strategy recommendations
3. ✅ Teach WHEN and WHY to use each strategy
4. ✅ Show strategy effectiveness over time

---

## Detailed Phase-by-Phase Redesign {#phase-redesign}

### **NEW PLAN Phase Flow**

#### Step 1: Prior Knowledge Activation (NEW)
```
┌─────────────────────────────────────────────────────────┐
│ 📖 Topic: Java == vs .equals()                         │
│                                                          │
│ Before we begin, take a moment to think:                │
│                                                          │
│ planPrompt: "If you create two separate Integer         │
│ objects both storing 42, what happens when you          │
│ compare them with ==?"                                  │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Your initial thoughts (optional):                   │ │
│ │ [                                              ]    │ │
│ │                                                     │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ [ ] I have no prior knowledge of this topic            │
│     (That's totally fine! This helps us understand     │
│      where you're starting from.)                      │
│                                                          │
│ ℹ️  This helps activate what you already know! 🧠        │
│                                                          │
│                               [Continue →]              │
└─────────────────────────────────────────────────────────┘
```

**Purpose:** Prime the brain for learning by accessing prior knowledge.

**Research Support:**
- Activates relevant neural networks
- Makes connections to existing knowledge
- Improves encoding of new information

---

#### Step 2: Goal Setting (UPDATED)
```
┌─────────────────────────────────────────────────────────┐
│ 🎯 What's your learning goal for this chunk?           │
│                                                          │
│ Choose based on your needs:                             │
│                                                          │
│ ┌─────────────────┐  ┌─────────────────┐              │
│ │ 📋 Get the gist │  │ 💡 Explain it   │              │
│ │                 │  │                 │              │
│ │ • Quick scan    │  │ • Deep dive     │              │
│ │ • Main ideas    │  │ • Teach others  │              │
│ └─────────────────┘  └─────────────────┘              │
│                                                          │
│ ┌─────────────────┐                                     │
│ │ 🛠️ Apply it     │                                     │
│ │                 │                                     │
│ │ • Solve problems│                                     │
│ │ • Use in projects│                                    │
│ └─────────────────┘                                     │
│                                                          │
│ ℹ️  Your goal will shape the question you get          │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Key Changes:**
- Explain WHAT each goal means
- Make it clear goals have consequences
- Show goal selection BEFORE seeing content

---

#### Step 3: Strategy Selection (UPDATED)
```
┌─────────────────────────────────────────────────────────┐
│ 🧭 What strategy will you try?                          │
│                                                          │
│ Your goal: "Be able to explain" 💡                      │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 💬 Self-explain (Recommended for your goal)        │ │
│ │                                                     │ │
│ │ Describe the concept in your own words as if       │ │
│ │ teaching someone else.                             │ │
│ │                                                     │ │
│ │ ✅ Your success rate: 85%                          │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ✏️ Draw a diagram                                   │ │
│ │                                                     │ │
│ │ Create a visual representation to organize ideas.  │ │
│ │                                                     │ │
│ │ ✅ Your success rate: 70%                          │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 📝 Work an example                                  │ │
│ │                                                     │ │
│ │ Practice with a concrete case to test understanding│ │
│ │                                                     │ │
│ │ ✅ Your success rate: 65%                          │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│                                     [Ready to Learn →]  │
└─────────────────────────────────────────────────────────┘
```

**Key Changes:**
- Explain HOW to use each strategy
- Show personalized success rates
- Recommend strategy based on goal
- Make selection meaningful

---

#### Step 4: Show Content (MOVED HERE)
```
┌─────────────────────────────────────────────────────────┐
│ 📖 Mini-Teach: Java == vs .equals()                    │
│                                                          │
│ Strategy reminder: 💬 Self-explain as you read          │
│ Goal reminder: 💡 You want to be able to explain this   │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │                                                     │ │
│ │ [miniTeach content here - 100-150 words]           │ │
│ │                                                     │ │
│ │ In Java, == compares object identity (are they     │ │
│ │ the same object in memory?), not values...         │ │
│ │                                                     │ │
│ │ [... rest of content ...]                          │ │
│ │                                                     │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ ⏱️  Estimated reading time: 30-40 seconds               │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ✓ I've read and understood this                    │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│                        [Continue to Question →]         │
└─────────────────────────────────────────────────────────┘
```

**Key Changes:**
- Content shown AFTER planning
- Reminders of goal and strategy
- Checkbox to confirm reading
- Time estimate to set expectations

---

### **NEW MONITOR Phase Flow**

#### Step 1: Goal-Specific Question (UPDATED)
```
┌─────────────────────────────────────────────────────────┐
│ 💭 Reflection Question                                  │
│                                                          │
│ Your goal: 💡 Be able to explain                        │
│ Your strategy: 💬 Self-explain                          │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Explain why two Integer objects with the same      │ │
│ │ value return false with == but true with .equals().│ │
│ │ When would this cause bugs?                        │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ 💡 Strategy tip: Describe it as if teaching a friend   │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Your explanation:                                   │ │
│ │                                                     │ │
│ │ [                                              ]    │ │
│ │ [                                              ]    │ │
│ │ [                                              ]    │ │
│ │ [                                              ]    │ │
│ │                                                     │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ 📝 256 characters                                       │
│                                                          │
│ [ ] I'm stuck - show me a hint                         │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Key Changes:**
- Show goal and strategy context
- Provide strategy-specific tips
- Allow requesting hints
- Question tailored to goal (future enhancement)

---

#### Step 2: Progressive Hints (NEW)
```
┌─────────────────────────────────────────────────────────┐
│ 💡 Hint 1 of 3                                          │
│                                                          │
│ Think about what == means for objects versus            │
│ primitives.                                             │
│                                                          │
│                        [Try again] [Need another hint] │
└─────────────────────────────────────────────────────────┘

[If user requests another hint...]

┌─────────────────────────────────────────────────────────┐
│ 💡 Hint 2 of 3                                          │
│                                                          │
│ Consider: new Integer(42) creates a new object each     │
│ time—what does that mean for ==?                        │
│                                                          │
│                        [Try again] [Need final hint]   │
└─────────────────────────────────────────────────────────┘

[If user requests final hint...]

┌─────────────────────────────────────────────────────────┐
│ 💡 Hint 3 of 3 (Almost there!)                          │
│                                                          │
│ Remember: objects in memory are like houses; ==         │
│ asks 'same house?' while .equals() asks 'same           │
│ contents?'                                              │
│                                                          │
│                                    [I understand now]   │
└─────────────────────────────────────────────────────────┘
```

**Key Changes:**
- Use the hints field from chunk data
- Make hints progressive
- Track hint usage for analytics
- Don't give away the answer

---

#### Step 3: Monitoring Checklist (NEW)
```
┌─────────────────────────────────────────────────────────┐
│ 🔍 Before you continue, quick self-check:               │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ □ I can explain this concept clearly               │ │
│ │                                                     │ │
│ │ □ This matches what I expected                     │ │
│ │                                                     │ │
│ │ □ I can give an example                            │ │
│ │                                                     │ │
│ │ □ I understand when/why this matters               │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ Checked all boxes? Great! → [Continue]                  │
│ Need to review? → [Show miniTeach again]                │
└─────────────────────────────────────────────────────────┘
```

**Purpose:** Explicit monitoring prompts from research.

**Research Support:**
> "Regulatory checklists can help students better regulate their learning" (articleOnMetacognition.txt)

---

#### Step 4: Confidence & Muddiest Point (UPDATED)
```
┌─────────────────────────────────────────────────────────┐
│ 📊 How confident are you in your explanation?           │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │                                                     │ │
│ │  0%  ════●═════════════════════════════  100%      │ │
│ │     Just      Somewhat    Pretty     Very          │ │
│ │   guessing     unsure     confident  confident     │ │
│ │                                                     │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ You selected: 75% - Pretty confident                    │
│                                                          │
│ ℹ️  Research shows beginners tend to be overconfident.  │
│    Let's see how well-calibrated you are!               │
│                                                          │
│ ────────────────────────────────────────────────────────│
│                                                          │
│ 🤔 What's still muddy? (optional)                       │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ What specific part is still unclear to you?        │ │
│ │ [                                              ]    │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ This helps us identify common sticking points! 📌       │
│                                                          │
│                              [Check My Thinking →]      │
└─────────────────────────────────────────────────────────┘
```

**Key Changes:**
- Better confidence scale with labels
- Education about calibration
- More specific muddy point prompt
- Explain why we ask

---

### **NEW EVALUATE Phase Flow**

#### Step 1: Performance Feedback (UPDATED)
```
┌─────────────────────────────────────────────────────────┐
│ ✅ Your Performance                                     │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │                    75% Accuracy                     │ │
│ │         ████████████████████░░░░░░░░                │ │
│ │                                                     │ │
│ │ You captured 3 of 4 key concepts!                  │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ ✅ What you got right:                                  │
│                                                          │
│ • == checks object identity, not value equality ✓       │
│ • .equals() compares the actual numeric values ✓        │
│ • Bug occurs when expecting value comparison ✓          │
│                                                          │
│ 💡 What to add to your thinking:                        │
│                                                          │
│ • Autoboxing can hide this—Integer variables look like  │
│   primitives but behave as objects                      │
│                                                          │
│ 📚 Example from the miniTeach:                          │
│ Integer x = 42; // looks primitive, but is boxed!       │
│                                                          │
│                                    [Continue →]         │
└─────────────────────────────────────────────────────────┘
```

**Key Changes:**
- Visual accuracy display
- Clear separation of correct vs. missing
- Pull relevant examples from chunk data
- Positive framing

---

#### Step 2: Calibration Feedback (UPDATED)
```
┌─────────────────────────────────────────────────────────┐
│ 🎯 Calibration Check                                    │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │                                                     │ │
│ │  Your Confidence:   75% ●                          │ │
│ │  Actual Accuracy:   75%     ●                      │ │
│ │                                                     │ │
│ │  Calibration: Perfect! 🎉                          │ │
│ │                                                     │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ Your calibration over time:                             │
│                                                          │
│  100% ┤                                                 │
│   75% ┤     ●────●────●  ← Getting better!              │
│   50% ┤   ●                                             │
│   25% ┤                                                 │
│    0% └─────────────────────                            │
│       Chunk 1  2   3   4                                │
│                                                          │
│ 💡 Well-calibrated learners know what they don't know!  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Key Changes:**
- Visual calibration comparison
- Historical calibration trend
- Educational messages about calibration
- Track over time

---

#### Step 3: Goal Evaluation (NEW)
```
┌─────────────────────────────────────────────────────────┐
│ 🎯 Did you meet your goal?                              │
│                                                          │
│ Your goal was: 💡 Be able to explain this               │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Based on your explanation, you successfully:        │ │
│ │                                                     │ │
│ │ ✅ Identified key differences between == & .equals │ │
│ │ ✅ Explained the underlying concept                │ │
│ │ ⚠️  Could strengthen: When bugs occur              │ │
│ │                                                     │ │
│ │ Goal achievement: 75% ████████████████░░░░░        │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ Would you say you met your goal?                        │
│                                                          │
│ [Yes, completely] [Mostly] [Partially] [Not really]    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Purpose:** Connect performance back to original goal.

**Research Support:** Goals must be evaluated, not just set.

---

#### Step 4: Strategy Reflection (UPDATED)
```
┌─────────────────────────────────────────────────────────┐
│ 🧭 Strategy Effectiveness                               │
│                                                          │
│ You chose: 💬 Self-explain                              │
│                                                          │
│ Reflect on your strategy:                               │
│                                                          │
│ 1️⃣ Did this strategy help you learn?                   │
│                                                          │
│    [Helped a lot] [Somewhat helped] [Didn't help]      │
│                                                          │
│ 2️⃣ What specifically helped (or didn't)?                │
│                                                          │
│    ┌─────────────────────────────────────────────────┐  │
│    │ e.g., "Putting it in my own words made me      │  │
│    │ realize what I didn't understand"              │  │
│    │ [                                          ]    │  │
│    └─────────────────────────────────────────────────┘  │
│                                                          │
│ 3️⃣ How much effort did you put in?                      │
│                                                          │
│    [Low effort] [Medium effort] [High effort]          │
│                                                          │
│ ℹ️  We'll use this to recommend strategies for you!     │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Key Changes:**
- Not binary - nuanced reflection
- Ask WHY (critical for metacognition)
- Capture effort attribution
- Explain how data will be used

---

#### Step 5: Custom Evaluation Prompt (NEW)
```
┌─────────────────────────────────────────────────────────┐
│ 🤔 Deeper Reflection                                    │
│                                                          │
│ evaluationPrompt from chunk:                            │
│                                                          │
│ "How confident are you in distinguishing identity vs    │
│ value comparison (1-5)? What example would help you     │
│ remember this?"                                         │
│                                                          │
│ Confidence (1-5): [1] [2] [3] [4] [5]                  │
│                                                          │
│ Your memory aid:                                        │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ e.g., "== is like comparing house addresses,       │ │
│ │ .equals() is like comparing what's inside"         │ │
│ │ [                                              ]    │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ This helps you retain the concept long-term! 🧠         │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Purpose:** Use the chunk-specific evaluationPrompt field.

**Research Support:** Custom reflection prompts deepen learning.

---

#### Step 6: Planning Next Steps (UPDATED)
```
┌─────────────────────────────────────────────────────────┐
│ 📝 Planning Your Next Chunk                             │
│                                                          │
│ Based on your performance:                              │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Accuracy: 75% - Pretty good!                        │ │
│ │ Calibration: Perfect                                │ │
│ │ Strategy: Self-explain worked well                 │ │
│ │ Effort: Medium                                      │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ What will you do differently next time?                 │
│                                                          │
│ [ ] Keep using self-explain - it's working!             │
│ [ ] Try a different strategy to build versatility       │
│ [ ] Spend more time on the miniTeach                    │
│ [ ] Use the monitoring checklist more carefully         │
│ [ ] Request hints earlier when stuck                    │
│ [ ] Other: _____________________________________        │
│                                                          │
│ ✅ I've reflected on my process                         │
│                                                          │
│                              [Next Chunk →]             │
│                                                          │
│ ────────────────────────────────────────────────────────│
│                                                          │
│ Progress: ████████████░░░░░░░░  4/8 chunks (50%)        │
│ Streak: 🔥 4    Avg Accuracy: 78%                       │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Key Changes:**
- Specific, actionable adjustments
- Connected to performance data
- Multiple options (not just one)
- Show progress and motivation

---

## Frontend Component Changes {#frontend-changes}

### 1. **New Components to Create**

#### `PriorKnowledgePrompt.jsx`
```jsx
/**
 * Displays the planPrompt and collects user's prior knowledge
 *
 * Props:
 * - planPrompt: string
 * - onContinue: (priorKnowledge: string) => void
 */
```

#### `GoalSelector.jsx`
```jsx
/**
 * Enhanced goal selection with descriptions and consequences
 *
 * Props:
 * - goals: array
 * - selectedGoal: string
 * - onSelect: (goalId: string) => void
 */
```

#### `StrategySelector.jsx`
```jsx
/**
 * Strategy selection with personalized recommendations
 *
 * Props:
 * - strategies: array
 * - selectedStrategy: string
 * - selectedGoal: string
 * - userStats: object (strategy success rates)
 * - onSelect: (strategyId: string) => void
 */
```

#### `HintSystem.jsx`
```jsx
/**
 * Progressive hint display
 *
 * Props:
 * - hints: array
 * - onHintRequest: (hintIndex: number) => void
 * - hintsUsed: number
 */
```

#### `MonitoringChecklist.jsx`
```jsx
/**
 * Self-monitoring checklist based on research
 *
 * Props:
 * - onComplete: (checkedItems: array) => void
 * - onReview: () => void (shows miniTeach again)
 */
```

#### `CalibrationVisual.jsx`
```jsx
/**
 * Visual calibration comparison with historical data
 *
 * Props:
 * - predicted: number (0-100)
 * - actual: number (0-100)
 * - history: array of {chunk, calibration}
 */
```

#### `GoalEvaluation.jsx`
```jsx
/**
 * Evaluates if user met their stated goal
 *
 * Props:
 * - goal: string
 * - performance: object
 * - onEvaluate: (metGoal: boolean) => void
 */
```

#### `StrategyReflection.jsx`
```jsx
/**
 * Deep reflection on strategy effectiveness
 *
 * Props:
 * - strategy: string
 * - onReflect: (reflection: object) => void
 */
```

#### `CustomEvaluationPrompt.jsx`
```jsx
/**
 * Displays chunk-specific evaluationPrompt
 *
 * Props:
 * - evaluationPrompt: string
 * - onComplete: (response: object) => void
 */
```

---

### 2. **Modified Components**

#### `LearningLoopPage.jsx` - Complete Restructure

**Current file:** 412 lines
**Estimated new size:** ~600-700 lines (more sub-phases)

**New Phase Structure:**
```javascript
const PHASES = {
  // PLAN PHASE (4 sub-steps)
  PLAN_PRIOR_KNOWLEDGE: 'plan_prior_knowledge',
  PLAN_GOAL: 'plan_goal',
  PLAN_STRATEGY: 'plan_strategy',
  PLAN_SHOW_CONTENT: 'plan_show_content',

  // MONITOR PHASE (3 sub-steps)
  MONITOR_QUESTION: 'monitor_question',
  MONITOR_CHECKLIST: 'monitor_checklist',
  MONITOR_CONFIDENCE: 'monitor_confidence',

  // EVALUATE PHASE (5 sub-steps)
  EVALUATE_FEEDBACK: 'evaluate_feedback',
  EVALUATE_CALIBRATION: 'evaluate_calibration',
  EVALUATE_GOAL: 'evaluate_goal',
  EVALUATE_STRATEGY: 'evaluate_strategy',
  EVALUATE_CUSTOM_PROMPT: 'evaluate_custom_prompt',
  EVALUATE_NEXT_STEPS: 'evaluate_next_steps',
};
```

**New State Variables:**
```javascript
// PLAN phase
const [priorKnowledge, setPriorKnowledge] = useState('');

// MONITOR phase
const [hintsUsed, setHintsUsed] = useState(0);
const [monitoringChecks, setMonitoringChecks] = useState([]);
const [contentReviewed, setContentReviewed] = useState(false);

// EVALUATE phase
const [strategyEffectiveness, setStrategyEffectiveness] = useState(null);
const [strategyReflection, setStrategyReflection] = useState('');
const [effortLevel, setEffortLevel] = useState(null);
const [metGoal, setMetGoal] = useState(null);
const [customEvalResponse, setCustomEvalResponse] = useState(null);
const [nextChunkAdjustments, setNextChunkAdjustments] = useState([]);

// Analytics
const [calibrationHistory, setCalibrationHistory] = useState([]);
const [strategyHistory, setStrategyHistory] = useState([]);
```

---

### 3. **New Helper Functions**

#### Calculate Calibration
```javascript
/**
 * Calculate calibration error and provide feedback
 */
function calculateCalibration(predicted, actual) {
  const error = Math.abs(predicted - actual);

  let feedback = '';
  if (error < 10) {
    feedback = 'Excellent calibration! You know what you know. 🎯';
  } else if (error < 20) {
    feedback = 'Good calibration. Keep practicing! 📊';
  } else if (predicted > actual) {
    feedback = 'You were overconfident. Watch for familiarity bias! ⚠️';
  } else {
    feedback = 'You underestimated yourself. Trust your knowledge! 💪';
  }

  return {
    error,
    direction: predicted > actual ? 'overconfident' : 'underconfident',
    feedback,
  };
}
```

#### Recommend Strategy
```javascript
/**
 * Recommend strategy based on user history and goal
 */
function recommendStrategy(goal, userHistory) {
  // Filter strategies by goal compatibility
  const compatibleStrategies = {
    gist: ['self-explain', 'diagram'],
    explain: ['self-explain'],
    apply: ['example', 'self-explain'],
  };

  const relevant = compatibleStrategies[goal];

  // Sort by user's success rate
  const sorted = relevant.sort((a, b) => {
    const aRate = userHistory[a]?.avgAccuracy || 0;
    const bRate = userHistory[b]?.avgAccuracy || 0;
    return bRate - aRate;
  });

  return sorted[0];
}
```

---

### 4. **Updated API Calls**

#### Submit Chunk - Enhanced Payload
```javascript
async function submitChunk({
  chunkId,

  // PLAN data
  priorKnowledge,
  goal,
  strategy,

  // MONITOR data
  explanation,
  confidence,
  muddiestPoint,
  hintsUsed,
  monitoringChecks,

  // EVALUATE data (to be submitted after evaluation)
  strategyEffectiveness,
  strategyReflection,
  effortLevel,
  metGoal,
  customEvalResponse,
  nextChunkAdjustments,
}) {
  // Send to backend
}
```

---

## Backend/Data Structure Changes {#backend-changes}

### 1. **Database Schema Updates**

#### `chunks` Collection - Add Missing Fields
```javascript
{
  // Existing fields
  topic: String,
  miniTeach: String,
  question: String,
  expectedPoints: [String],
  difficulty: String,
  example: String,

  // NEW FIELDS (from prompt but not in DB)
  planPrompt: String,           // ← ADD THIS
  evaluationPrompt: String,     // ← ADD THIS
  hints: [String],              // ← ADD THIS
  prerequisites: [String],      // ← ADD THIS
}
```

#### `userResponses` Collection - Enhanced Tracking
```javascript
{
  userId: ObjectId,
  chunkId: ObjectId,
  sessionId: ObjectId,
  timestamp: Date,

  // PLAN phase data
  planPhase: {
    priorKnowledge: String,
    goal: String,              // 'gist', 'explain', 'apply'
    strategy: String,          // 'self-explain', 'diagram', 'example'
    timeSpent: Number,         // milliseconds
  },

  // MONITOR phase data
  monitorPhase: {
    explanation: String,
    confidence: Number,        // 0-100
    muddiestPoint: String,
    hintsUsed: Number,
    hintsRequested: [Number],  // which hints were used
    monitoringChecks: [String],
    timeSpent: Number,
  },

  // EVALUATE phase data
  evaluatePhase: {
    accuracy: Number,          // 0-100 (calculated)
    correctPoints: [String],
    missingPoints: [String],
    calibrationError: Number,
    calibrationDirection: String, // 'overconfident', 'underconfident', 'accurate'

    // Strategy reflection
    strategyEffectiveness: String,  // 'helped-a-lot', 'somewhat', 'didnt-help'
    strategyReflection: String,     // Why it helped/didn't
    effortLevel: String,            // 'low', 'medium', 'high'

    // Goal evaluation
    metGoal: String,                // 'completely', 'mostly', 'partially', 'not-really'

    // Custom evaluation
    customEvalResponse: Object,     // Free-form based on evaluationPrompt

    // Next steps
    nextChunkAdjustments: [String],

    timeSpent: Number,
  },

  // Overall
  totalTimeSpent: Number,
  completed: Boolean,
}
```

#### `userStats` Collection - Personalization Data
```javascript
{
  userId: ObjectId,

  // Strategy effectiveness by user
  strategyStats: {
    'self-explain': {
      timesUsed: Number,
      avgAccuracy: Number,
      avgConfidence: Number,
      avgCalibration: Number,
      worksWellFor: [String],      // ['code', 'concepts']
    },
    'diagram': { /* same */ },
    'example': { /* same */ },
  },

  // Calibration tracking
  calibration: {
    overall: Number,               // avg calibration error
    trend: String,                 // 'improving', 'stable', 'declining'
    history: [{
      chunkId: ObjectId,
      predicted: Number,
      actual: Number,
      error: Number,
    }],
  },

  // Goal achievement
  goals: {
    'gist': { achieved: Number, total: Number },
    'explain': { achieved: Number, total: Number },
    'apply': { achieved: Number, total: Number },
  },

  // Learning patterns
  patterns: {
    hintsPerChunk: Number,
    avgTimePerChunk: Number,
    preferredStrategy: String,
    strongTopics: [String],
    weakTopics: [String],
  },

  // Last updated
  updatedAt: Date,
}
```

---

### 2. **New API Endpoints**

#### `GET /api/user/stats`
```javascript
/**
 * Get user's personalization data
 *
 * Returns:
 * - Strategy effectiveness
 * - Calibration history
 * - Goal achievement rates
 * - Learning patterns
 */
```

#### `GET /api/user/recommendations`
```javascript
/**
 * Get personalized recommendations
 *
 * Query params:
 * - goal: string
 * - topic: string
 *
 * Returns:
 * - Recommended strategy
 * - Reasoning
 * - Expected success rate
 */
```

#### `POST /api/chunks/:chunkId/feedback`
```javascript
/**
 * Submit comprehensive chunk feedback
 *
 * Body: All plan/monitor/evaluate data
 *
 * Returns:
 * - Performance analysis
 * - Updated user stats
 * - Next chunk recommendations
 */
```

---

### 3. **Analytics & Insights**

#### Track Over Time
```javascript
{
  userId: ObjectId,
  sessionId: ObjectId,

  // Session-level analytics
  sessionStats: {
    chunksCompleted: Number,
    avgAccuracy: Number,
    avgCalibration: Number,
    strategiesUsed: Object,
    totalHintsUsed: Number,
    totalTime: Number,
    streak: Number,
  },

  // Historical trends
  trends: {
    accuracyTrend: [{ session: Number, accuracy: Number }],
    calibrationTrend: [{ session: Number, calibration: Number }],
    strategyEvolution: [{ session: Number, strategy: String }],
  },
}
```

---

## User Experience Improvements {#ux-improvements}

### 1. **Progressive Disclosure**

**Problem:** Current UI shows everything at once.

**Solution:** Show information progressively.

**Example:**
```
Step 1: Show planPrompt → Continue
Step 2: Show goal selection → Continue
Step 3: Show strategy selection → Continue
Step 4: Show content → Continue
Step 5: Show question → Answer
Step 6: Show feedback → Reflect
Step 7: Show evaluation → Plan next
```

**Benefits:**
- Reduces cognitive load
- Focuses attention on one task at a time
- Makes the process feel structured

---

### 2. **Contextual Help**

**Problem:** Users don't know what strategies mean.

**Solution:** Add contextual help tooltips.

**Example:**
```
💬 Self-explain (i)
   └─> [Hover] "Describe the concept in your own words as if
       teaching someone else. This helps identify gaps in
       understanding."
```

---

### 3. **Visual Progress**

**Problem:** Users don't know where they are in the process.

**Solution:** Show phase progress.

**Example:**
```
┌─────────────────────────────────────────────┐
│ PLAN ████ → MONITOR ░░░░ → EVALUATE ░░░░   │
│ Step 2 of 4: Select your strategy           │
└─────────────────────────────────────────────┘
```

---

### 4. **Keyboard Navigation**

**Problem:** Must click for everything.

**Solution:** Add keyboard shortcuts.

**Example:**
- `Enter` → Continue/Submit
- `Tab` → Next field
- `1-3` → Quick select goals/strategies
- `Cmd+R` → Review content
- `?` → Show help

---

### 5. **Animations & Transitions**

**Problem:** Jarring jumps between phases.

**Solution:** Smooth transitions.

**Example:**
```javascript
// Fade out old phase, fade in new phase
transition: 'all 0.3s ease-in-out'
```

---

### 6. **Mobile Optimization**

**Problem:** Current UI may not work well on mobile.

**Solution:** Responsive design considerations.

**Changes:**
- Stack goal/strategy cards vertically on mobile
- Larger touch targets (48px minimum)
- Swipe gestures for navigation
- Collapsible sections for long content

---

### 7. **Accessibility**

**Problem:** May not be accessible.

**Solution:** ARIA labels and semantic HTML.

**Changes:**
- Proper heading hierarchy
- Alt text for icons
- Focus management between phases
- Screen reader announcements

---

### 8. **Data Persistence**

**Problem:** Lose progress if browser closes.

**Solution:** Auto-save progress.

**Implementation:**
```javascript
// Save to localStorage after each phase
useEffect(() => {
  localStorage.setItem('currentSession', JSON.stringify({
    chunkIndex: currentChunk,
    phase: currentPhase,
    responses: { /* all user inputs */ },
  }));
}, [currentChunk, currentPhase, /* responses */]);

// Restore on load
useEffect(() => {
  const saved = localStorage.getItem('currentSession');
  if (saved) {
    // Show "Continue where you left off?" prompt
  }
}, []);
```

---

### 9. **Feedback Timing**

**Problem:** Immediate feedback may not be optimal.

**Research Finding:**
> "Judgments of learning following a delayed retrieval attempt from memory will lead to more accurate monitoring" (articleOnMetacognition.txt)

**Solution:** Optional delayed mode.

**Implementation:**
```
┌─────────────────────────────────────────────┐
│ Mode: Immediate ▼                           │
│                                             │
│ [ ] Use delayed retrieval (recommended)    │
│     Answer all chunks, then review         │
└─────────────────────────────────────────────┘
```

---

### 10. **Gamification (Optional)**

**Elements to Consider:**
- ✅ Streak tracking (already have: 🔥 5)
- ✅ Accuracy badges
- ✅ Calibration achievements
- ✅ Strategy mastery levels
- ❌ Avoid: Points/scores (can reduce intrinsic motivation)

**Research-Backed:**
- Focus on mastery, not performance
- Emphasize growth over competition
- Celebrate process, not just outcomes

---

## Implementation Roadmap {#roadmap}

### Phase 1: Core Metacognitive Flow (2-3 weeks)

**Goal:** Fix the fundamental flow issues.

**Tasks:**
1. ✅ Restructure PLAN phase
   - Add PriorKnowledgePrompt component
   - Move content AFTER planning
   - Enhance goal selection
   - Enhance strategy selection

2. ✅ Enhance MONITOR phase
   - Add HintSystem component
   - Add MonitoringChecklist component
   - Improve confidence calibration UI

3. ✅ Deepen EVALUATE phase
   - Add CalibrationVisual component
   - Add GoalEvaluation component
   - Add StrategyReflection component
   - Add CustomEvaluationPrompt component

**Testing:**
- User can complete full cycle
- Data is captured correctly
- Flow feels natural

---

### Phase 2: Data & Personalization (2-3 weeks)

**Goal:** Track user data and provide personalized recommendations.

**Tasks:**
1. ✅ Update database schemas
   - Add missing chunk fields
   - Enhance userResponses schema
   - Create userStats collection

2. ✅ Build analytics backend
   - Calculate strategy effectiveness
   - Track calibration trends
   - Identify patterns

3. ✅ Implement recommendation engine
   - Recommend strategies based on history
   - Suggest adjustments based on patterns
   - Personalize feedback

**Testing:**
- Recommendations improve over time
- Data accurately reflects user behavior
- Privacy is maintained

---

### Phase 3: Polish & UX (1-2 weeks)

**Goal:** Make the experience smooth and delightful.

**Tasks:**
1. ✅ Add animations and transitions
2. ✅ Implement keyboard navigation
3. ✅ Add contextual help
4. ✅ Optimize for mobile
5. ✅ Ensure accessibility
6. ✅ Add data persistence

**Testing:**
- Smooth, polished experience
- Works on all devices
- Accessible to all users

---

### Phase 4: Insights & Visualization (1-2 weeks)

**Goal:** Help users understand their learning patterns.

**Tasks:**
1. ✅ Build InsightsPage with real data
   - Calibration trends
   - Strategy effectiveness
   - Goal achievement
   - Learning patterns

2. ✅ Add visualizations
   - Charts for trends
   - Heat maps for topics
   - Progress timelines

3. ✅ Provide actionable recommendations
   - "Try this strategy more"
   - "You're overconfident on X topics"
   - "Your calibration is improving!"

**Testing:**
- Insights are accurate
- Visualizations are clear
- Recommendations are helpful

---

### Phase 5: Research Validation (Ongoing)

**Goal:** Ensure the app actually promotes metacognition.

**Tasks:**
1. ✅ User testing with students
2. ✅ A/B testing variations
3. ✅ Collect qualitative feedback
4. ✅ Measure learning outcomes
5. ✅ Iterate based on findings

**Metrics to Track:**
- Calibration improvement over time
- Strategy diversification
- Goal achievement rates
- User engagement/retention
- Self-reported metacognitive awareness

---

## Success Metrics {#metrics}

### Quantitative Metrics

#### 1. **Calibration Improvement**
- **Measure:** Average calibration error over time
- **Goal:** Decrease by 20% after 10 chunks
- **Research:** "Good learners know what they don't know"

#### 2. **Strategy Effectiveness**
- **Measure:** Variance in strategy selection
- **Goal:** Users try all strategies at least 3 times
- **Research:** Metacognitive flexibility

#### 3. **Goal Achievement**
- **Measure:** Self-reported goal met rate
- **Goal:** >70% report meeting goal
- **Research:** Planning → better outcomes

#### 4. **Hint Usage Patterns**
- **Measure:** Hints requested per chunk
- **Goal:** Decreases over time (users improving)
- **Research:** Scaffolding withdrawal

#### 5. **Time on Task**
- **Measure:** Average time per chunk
- **Goal:** 60-90 seconds (as designed)
- **Research:** Optimal learning duration

#### 6. **Reflection Depth**
- **Measure:** Length/quality of strategy reflections
- **Goal:** Increase in specificity over time
- **Research:** Deeper reflection → better learning

---

### Qualitative Metrics

#### 1. **User Interviews**
**Questions:**
- "Do you think about your thinking more after using this?"
- "Can you describe your learning strategy?"
- "How do you know when you understand something?"

#### 2. **Self-Report Surveys**
**Metacognitive Awareness Inventory (MAI):**
- Before/after comparisons
- Subscales: knowledge, regulation

#### 3. **Think-Aloud Protocols**
**Observation:**
- Watch users complete chunks
- Note metacognitive talk ("Hmm, I'm not sure about this")
- Identify confusion points

---

### Behavioral Metrics

#### 1. **Phase Completion Rates**
- % who complete PLAN fully
- % who use monitoring checklist
- % who provide strategy reflection

#### 2. **Adjustment Implementation**
- Do users actually try different strategies?
- Do they follow through on "next time" plans?

#### 3. **Return Rate**
- Do users come back for more sessions?
- Indicator of perceived value

---

## Research Alignment Checklist

### From articleOnMetacognition.txt

- [x] **Pre-assessments** → planPrompt activates prior knowledge
- [x] **Regulatory checklists** → MonitoringChecklist component
- [x] **Reflecting on learning** → Multiple evaluation prompts
- [x] **Delayed retrieval** → Optional delayed mode
- [x] **Exam wrappers** → Post-chunk questionnaire (EVALUATE phase)
- [x] **Accurate judgments** → Calibration tracking with education
- [x] **Formative assessment** → Progressive hints

### From articleOnSelfRegulation.txt

- [x] **Plan sub-goals** → Explicit goal setting
- [x] **Monitor strategies** → Strategy effectiveness tracking
- [x] **Evaluate outcome** → Performance + process evaluation
- [x] **Attribute to effort** → Effort level tracking
- [x] **Course correct** → Next chunk adjustments
- [x] **Model goal-oriented behavior** → Structured process
- [x] **Discourse about self-regulation** → Educational messages throughout

### From METACOGNITION_EXPLAINED.md

- [x] **Set goal** → Goal selection
- [x] **Choose strategy** → Strategy selection with recommendations
- [x] **Monitor understanding** → Checklist + confidence
- [x] **Evaluate accuracy** → Feedback with calibration
- [x] **Reflect on process** → Strategy reflection
- [x] **Adjust** → Next chunk planning
- [x] **Track over time** → userStats collection

---

## Open Questions & Decisions Needed

### 1. **Goal-Specific Questions**

**Question:** Should different goals get different questions?

**Options:**
- A) Same question, different evaluation criteria
- B) Different questions per goal
- C) User can choose question difficulty

**Recommendation:** Start with A, consider B later.

---

### 2. **Strategy Support**

**Question:** How much support for each strategy?

**Options:**
- A) Just instructions
- B) Tools (drawing canvas for diagram)
- C) Structured templates

**Recommendation:** Start with A, add B for "diagram" strategy.

---

### 3. **Delayed vs. Immediate Feedback**

**Question:** Should we default to delayed or immediate?

**Research:** Delayed is better for calibration.

**UX Concern:** Users want immediate feedback.

**Recommendation:**
- Default: Immediate
- Option: Delayed mode for advanced users
- Educate about benefits of delayed

---

### 4. **Hint Penalties**

**Question:** Should hints affect the score?

**Research:** Scaffolding should support, not penalize.

**Recommendation:**
- Don't penalize accuracy score
- Track for analytics (users who need many hints might need different content)

---

### 5. **Social Features**

**Question:** Add collaborative learning?

**Options:**
- A) Share reflections with peers
- B) Study groups work chunks together
- C) Keep it solo

**Recommendation:** Start with C (solo), research shows metacognition is personal.

---

### 6. **Content Review**

**Question:** Can users re-read miniTeach during MONITOR?

**Research:** Mixed evidence.

**Recommendation:**
- Allow review (checkbox "Show miniTeach again")
- Track review frequency
- Don't make it too easy (requires conscious choice)

---

### 7. **Adaptive Difficulty**

**Question:** Adjust chunk difficulty based on performance?

**Options:**
- A) Fixed progression
- B) Skip chunks user knows
- C) Add remedial chunks for struggles

**Recommendation:** Start with A, add B later with testing.

---

## Technical Considerations

### 1. **State Management**

**Current:** useState in LearningLoopPage

**Problem:** Getting complex with many sub-phases.

**Solution:** Consider using useReducer or state management library.

**Example:**
```javascript
const [state, dispatch] = useReducer(learningLoopReducer, initialState);

// Actions
dispatch({ type: 'SUBMIT_PRIOR_KNOWLEDGE', payload: priorKnowledge });
dispatch({ type: 'SELECT_GOAL', payload: goalId });
dispatch({ type: 'SELECT_STRATEGY', payload: strategyId });
// etc.
```

---

### 2. **Performance**

**Consideration:** Lots of data being tracked.

**Solutions:**
- Debounce text inputs
- Batch analytics updates
- Index database queries
- Lazy load components

---

### 3. **Testing**

**Unit Tests:**
- Component rendering
- State transitions
- Calculation functions (calibration, recommendations)

**Integration Tests:**
- Full flow completion
- Data persistence
- API interactions

**E2E Tests:**
- User can complete a session
- Data is saved correctly
- Analytics are accurate

---

### 4. **Error Handling**

**Scenarios:**
- API failures
- Malformed chunk data
- Missing fields in old chunks
- Browser storage full

**Solutions:**
- Graceful degradation
- Clear error messages
- Fallback to defaults
- Offline mode

---

## Migration Plan

### Handling Existing Data

**Problem:** Old chunks don't have new fields (planPrompt, evaluationPrompt, hints).

**Solution:**

#### Option A: Generate for Existing Chunks
```javascript
// Migration script
for (const chunk of oldChunks) {
  if (!chunk.planPrompt) {
    // Use AI to generate planPrompt based on topic
    chunk.planPrompt = await generatePlanPrompt(chunk);
  }
  if (!chunk.evaluationPrompt) {
    chunk.evaluationPrompt = `How confident are you in understanding ${chunk.topic}? What helped you learn this?`;
  }
  if (!chunk.hints) {
    chunk.hints = await generateHints(chunk);
  }
}
```

#### Option B: Graceful Fallback
```javascript
// In frontend
const planPrompt = chunk.planPrompt || `What do you already know about ${chunk.topic}?`;
const evaluationPrompt = chunk.evaluationPrompt || 'How confident are you in your understanding?';
const hints = chunk.hints || [];
```

**Recommendation:** Use Option B initially, then Option A for key materials.

---

## Documentation Needs

### 1. **User Guide**

**Sections:**
- What is metacognition?
- How to use each phase
- Understanding your insights
- Tips for effective learning

### 2. **Developer Docs**

**Sections:**
- Architecture overview
- Component documentation
- API documentation
- Database schemas

### 3. **Research Documentation**

**Sections:**
- Literature review
- Design rationale
- Validation studies
- Future research directions

---

## Conclusion

This redesign will transform your application from having the **structure** of metacognition to actually **provoking metacognitive thinking**.

### Key Takeaways

1. **PLAN before content** - This is non-negotiable for genuine planning
2. **Use the fields you designed** - planPrompt, evaluationPrompt, hints
3. **Track and personalize** - Use data to improve recommendations
4. **Deep reflection, not shallow clicks** - Ask WHY, not just yes/no
5. **Research-backed, not intuition** - Every feature maps to literature

### Next Steps

1. Review this document
2. Prioritize phases
3. Set timeline
4. Build incrementally
5. Test with real users
6. Iterate based on data

**Remember:** The goal is not just to teach content, but to teach students **how to learn**. That's the promise of metacognition.

---

## Appendix: Research References

### Core Papers on Metacognition

1. **Schraw, G. (1998).** Promoting general metacognitive awareness. *Instructional Science, 26*, 113-125.

2. **Pintrich, P. R. (2002).** The role of metacognitive knowledge in learning, teaching, and assessing. *Theory Into Practice, 41*(4), 219-225.

3. **Zimmerman, B. J., & Schunk, D. H. (2011).** *Handbook of self-regulation of learning and performance.* Routledge.

4. **Dunlosky, J., et al. (2013).** Improving students' learning with effective learning techniques: Promising directions from cognitive and educational psychology. *Psychological Science in the Public Interest, 14*(1), 4-58.

### Specific Techniques

5. **Tanner, K. D. (2012).** Promoting student metacognition. *CBE—Life Sciences Education, 11*(2), 113-120.

6. **Lovett, M. C. (2013).** Make exams worth more than the grade: Use exam wrappers to promote metacognition. *Using Reflection and Metacognition to Improve Student Learning*, 18-52.

7. **Chen, P., et al. (2017).** Strategic resource use for learning: A self-administered intervention that guides self-reflection on effective resource use enhances academic performance. *Psychological Science, 28*(6), 774-785.

### Calibration & Self-Assessment

8. **Koriat, A., & Bjork, R. A. (2005).** Illusions of competence in monitoring one's knowledge during study. *Journal of Experimental Psychology: Learning, Memory, and Cognition, 31*(2), 187.

9. **Dunlosky, J., & Nelson, T. O. (1992).** Importance of the kind of cue for judgments of learning (JOL) and the delayed-JOL effect. *Memory & Cognition, 20*(4), 374-380.

10. **Serra, M. J., & Metcalfe, J. (2009).** Effective implementation of metacognition. *Handbook of Metacognition in Education*, 278-298.

---

**Document Version:** 1.0
**Created:** [Current Date]
**Author:** Claude (AI Assistant) based on research literature and application analysis
**Status:** Ready for Review
**Next Review:** After Phase 1 completion

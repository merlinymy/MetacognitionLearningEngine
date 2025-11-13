# UI/UX Design Document
## Metacognition Learning Engine

**Version:** 1.0
**Date:** 2025-11-06
**Status:** Draft for MVP Development

---

## Table of Contents
1. [Product Overview](#product-overview)
2. [Design Philosophy](#design-philosophy)
3. [User Journey](#user-journey)
4. [Core Screens & Flows](#core-screens--flows)
5. [Component Specifications](#component-specifications)
6. [Visual Design System](#visual-design-system)
7. [Interaction Patterns](#interaction-patterns)
8. [Responsive Design](#responsive-design)
9. [Accessibility](#accessibility)
10. [Open Questions](#open-questions)

---

## Product Overview

### Purpose
The Metacognition Learning Engine transforms learner-uploaded content into interactive 90-second reflection loops that teach both the material AND metacognitive skills (planning, monitoring, evaluating learning strategies).

### Core Value Proposition
- **Personalized**: Users learn from THEIR OWN uploaded materials (notes, PDFs, articles)
- **Fast**: Each learning loop takes ≤90 seconds
- **Reflective**: Develops metacognitive awareness alongside content mastery
- **Insightful**: Reveals personal learning patterns and optimal strategies

### Target Users (MVP)
- College students studying from lecture notes, textbooks, and papers
- Self-directed learners working through tutorials and documentation
- High school students preparing for exams with their own study materials

---

## Design Philosophy

### Core Principles

**1. Frictionless Flow**
- 90-second constraint means ZERO tolerance for slow loading, confusing UI, or unnecessary clicks
- Single-page app feel with smooth transitions
- Pre-load everything; instant feedback

**2. Transparency & Trust**
- Always show what the LLM is doing with user content
- Give users control to edit/adjust generated material
- Privacy-first messaging

**3. Calm Focus**
- Minimize distractions during learning loops
- Use subtle gamification (not aggressive/manipulative)
- Design for concentration, not dopamine hits

**4. Progressive Disclosure**
- Show only what's needed for current step
- Advanced features revealed as users progress
- No overwhelming initial screens

**5. Pattern Recognition**
- Make insights feel like personal discoveries
- Use data visualization to reveal learning patterns
- Feedback always references THEIR content and THEIR strategies

---

## User Journey

### High-Level Flow

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐      ┌──────────────┐
│   Upload    │  →   │   Process    │  →   │    Learn    │  →   │   Insights   │
│   Content   │      │ & Generate   │      │  (90s Loop) │      │  & Reflect   │
└─────────────┘      └──────────────┘      └─────────────┘      └──────────────┘
```

### Detailed User Journey

**First-Time User:**
1. Landing page with demo/preview of one learning loop
2. Sign up / authentication
3. Onboarding: "Upload your first learning material"
4. Upload → Processing visualization → Review generated chunks
5. Pre-session setup (goals, length)
6. Experience first 90-second loop
7. Complete session → See first insights
8. Return to library

**Returning User:**
1. Dashboard with uploaded materials
2. Select material or upload new one
3. Choose session parameters
4. Learning loops
5. Session complete → Insights update
6. View progress dashboard

---

## Core Screens & Flows

### 1. Landing Page (First Visit)

**Purpose:** Communicate value prop and demonstrate the experience

**Layout:**
```
┌────────────────────────────────────────────────────────────┐
│  [Logo] Metacognition Learning Engine        [Sign In]    │
├────────────────────────────────────────────────────────────┤
│                                                            │
│               Learn Your Own Material                      │
│               Through Reflection                           │
│                                                            │
│   Upload notes, PDFs, or articles. We'll transform        │
│   them into 90-second learning loops that teach you        │
│   the content AND how you learn best.                     │
│                                                            │
│              [Try a Demo Loop] [Get Started]               │
│                                                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ 📤 Upload    │  │ 🧠 Practice  │  │ 📊 Discover  │   │
│  │ Your Content │  │ Metacognition│  │ Your Patterns│   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                            │
│  [Visual: Animated demo of the 90s loop]                  │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Key Elements:**
- Hero section with clear value prop
- "Try Demo Loop" button shows real experience with sample content
- Visual demonstration of the loop cycle
- Simple, focused messaging

---

### 2. Upload & Processing Screen

**Purpose:** Content upload + LLM processing + chunk review

**2a. Upload Interface**

```
┌─────────────────────────────────────────────────────────┐
│  ← Back to Library                           [Profile] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                Upload Learning Material                  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │                                                   │ │
│  │         📤                                        │ │
│  │                                                   │ │
│  │    Drop your files here or click to browse      │ │
│  │                                                   │ │
│  │    Supported: PDF, DOCX, TXT, MD, Images        │ │
│  │                                                   │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│              Or paste text directly:                    │
│  ┌───────────────────────────────────────────────────┐ │
│  │                                                   │ │
│  │                                                   │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│                      [Upload]                           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**2b. Processing Visualization**

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│              Processing Your Content                     │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │                                                 │  │
│  │  🧠 Reading your content...             ✓      │  │
│  │                                                 │  │
│  │  ✂️  Breaking into learnable chunks...  ⏳     │  │
│  │                                                 │  │
│  │  💡 Generating reflection questions...         │  │
│  │                                                 │  │
│  │  ✨ Creating feedback scenarios...             │  │
│  │                                                 │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│              [Progress bar: 67%]                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**2c. Content Review & Confirmation**

```
┌─────────────────────────────────────────────────────────┐
│  ← Back                                      [Profile]  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ✅ Content Ready!                                      │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │  Title: React Hooks - Chapter 3                │  │
│  │  Topics detected: useState, useEffect,         │  │
│  │                   custom hooks, rules          │  │
│  │                                                 │  │
│  │  Learning loops created: 12                    │  │
│  │  Estimated time: ~18 minutes                   │  │
│  │  Difficulty: Intermediate                      │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  Preview Chunks: (Expandable list)                     │
│  ┌─────────────────────────────────────────────────┐  │
│  │ 1. What is useState? (Basic)            [Edit] │  │
│  │ 2. When to use useEffect (Intermediate) [Edit] │  │
│  │ 3. Custom hook patterns (Advanced)      [Edit] │  │
│  │ ...                                             │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  [⚙️ Adjust Chunk Size] [🗑️ Delete] [Start Learning →]│
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Key Elements:**
- Large drop zone for easy file upload
- Real-time processing feedback with status indicators
- Summary card showing what was generated
- Preview/edit capability before starting
- Clear privacy note: "Your content is private and only used for your learning"

**Interaction Notes:**
- Drag-and-drop support
- Paste support (Cmd/Ctrl+V)
- Show file preview on hover
- Allow editing individual chunks if LLM missed something
- "Re-process with different settings" option

---

### 3. Library / Dashboard (Home)

**Purpose:** View all uploaded materials, track progress, quick start learning

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]  My Library    Insights    Profile        [+Upload] │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Welcome back, Alex! 🔥 5-day streak                        │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Quick Continue                                    │    │
│  │  React Hooks - 8/12 chunks complete               │    │
│  │  [Continue Learning →]                             │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  Your Materials                         [Grid] [List] [🔍] │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ React Hooks  │  │ Calculus 3   │  │ Psychology   │     │
│  │ ▓▓▓▓▓▓▓▓░░░  │  │ ▓▓▓▓▓▓▓▓▓▓▓  │  │ ▓▓░░░░░░░░░  │     │
│  │ 8/12 chunks  │  │ 15/15 chunks │  │ 2/10 chunks  │     │
│  │              │  │              │  │              │     │
│  │ 📊 73% acc   │  │ ✅ Mastered  │  │ 🆕 New       │     │
│  │ 🔥 3 days    │  │ 📈 89% acc   │  │ 🕐 6d ago    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │ Linear Alg.  │  │ JavaScript   │      [+ Upload More]   │
│  │ ▓▓▓▓▓░░░░░░  │  │ ▓▓▓▓▓▓▓▓▓░░  │                        │
│  │ 5/12 chunks  │  │ 9/10 chunks  │                        │
│  │ ⚠️ Review    │  │ 📅 Due soon  │                        │
│  └──────────────┘  └──────────────┘                        │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Key Elements:**
- "Quick Continue" card for most recent material
- Card grid showing all uploaded materials
- Progress bars and status badges
- Stats preview (accuracy, streak)
- Search and filter options
- Large "Upload" button always visible

**Card States:**
- 🆕 New (never started)
- 🔥 In Progress (with streak)
- ✅ Mastered (100% complete, high accuracy)
- ⚠️ Needs Review (low accuracy or long time since last session)
- 📅 Tagged for specific goal (e.g., "Exam Monday")

**Interaction Notes:**
- Click card to see details/start session
- Hover to see quick actions (Edit, Delete, Share)
- Drag to reorder/organize
- Right-click for context menu

---

### 4. Pre-Session Setup

**Purpose:** Configure session parameters before starting learning loops

```
┌─────────────────────────────────────────────────────────┐
│  ← Library                                              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│              React Hooks - Chapter 3                    │
│              8/12 chunks complete                       │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │  How long do you want to study?                │  │
│  │                                                 │  │
│  │  [  Quick Review  ]         ~7 min (5 chunks)  │  │
│  │  [  Normal Session  ] ◄     ~15 min (10)       │  │
│  │  [  Deep Dive  ]            ~30 min (20)       │  │
│  │  [  Custom  ]               Choose chunks       │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │  What would you like to focus on?              │  │
│  │                                                 │  │
│  │  [  Continue from Chunk 9  ] ◄                 │  │
│  │  [  Review mistakes  ]                         │  │
│  │  [  Random reinforcement  ]                    │  │
│  │  [  Specific topics...  ]                      │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │  Today's goal: (optional)                      │  │
│  │  [ Study for tomorrow's quiz                ]  │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│                  [Start Session →]                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Key Elements:**
- Duration selector with time estimates
- Focus mode selector
- Optional goal setting
- Smart defaults based on user's history
- "Remember my preferences" option

**Interaction Notes:**
- Default to last-used settings
- Show "Recommended" badge on suggested mode
- Custom mode opens detailed chunk selector

---

### 5. Learning Loop Interface (Core Experience)

**Purpose:** The 90-second metacognitive cycle (Plan → Monitor → Evaluate)

**Layout Structure:**

```
┌────────────────────────────────────────────────────────┐
│  [Progress 3/10] 🔥 Streak: 5      [Pause] [⚙️ Menu] │
├────────────────────────────────────────────────────────┤
│                                                        │
│                                                        │
│  ┌──────────────────────────────────────────────┐    │
│  │                                              │    │
│  │                                              │    │
│  │         [CURRENT PHASE CONTENT]             │    │
│  │                                              │    │
│  │         (Smoothly transitions between)       │    │
│  │         (Plan → Monitor → Evaluate)          │    │
│  │                                              │    │
│  │                                              │    │
│  │                                              │    │
│  └──────────────────────────────────────────────┘    │
│                                                        │
│                                                        │
│              [Primary Action Button]                   │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

#### 5a. PLAN Phase (≈10 seconds)

```
┌────────────────────────────────────────────────────────┐
│  Chunk 3/10: Custom Hooks                              │
├────────────────────────────────────────────────────────┤
│                                                        │
│  📖 Mini-Teach                                         │
│  ┌──────────────────────────────────────────────┐    │
│  │                                              │    │
│  │  In React, custom hooks are functions that  │    │
│  │  let you extract component logic into       │    │
│  │  reusable pieces. They must start with      │    │
│  │  "use" and can call other hooks inside.     │    │
│  │                                              │    │
│  └──────────────────────────────────────────────┘    │
│                                                        │
│  ─────────────────────────────────────────────────    │
│                                                        │
│  🎯 What's your learning goal for this chunk?         │
│                                                        │
│  ┌─────────────────┐  ┌──────────────────┐           │
│  │  📋 Get the gist│  │ 💡 Be able to    │           │
│  │                 │  │    explain it    │           │
│  └─────────────────┘  └──────────────────┘           │
│                                                        │
│  ┌─────────────────┐                                  │
│  │ 🛠️  Apply it to │  ◄ Selected                     │
│  │    a problem    │                                  │
│  └─────────────────┘                                  │
│                                                        │
│  ─────────────────────────────────────────────────    │
│                                                        │
│  🧭 What strategy will you try?                       │
│                                                        │
│  ┌──────────────┐ ┌──────────────┐ ┌─────────────┐  │
│  │ 💬 Self-     │ │ ✏️  Draw a    │ │ 📝 Work an  │  │
│  │    explain   │ │    diagram   │ │    example  │  │
│  └──────────────┘ └──────────────┘ └─────────────┘  │
│                                                        │
│  💡 Last time "Self-explain" gave you 85% accuracy    │
│                                                        │
│                  [Let's Learn →]                       │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**Key Elements:**
- Mini-teach from THEIR uploaded content (≤80 words)
- Two quick selections: Goal + Strategy
- Visual card-based selection (large touch targets)
- Personalized suggestion based on past performance
- Smooth transition to Monitor phase

**Interaction Notes:**
- Single click to select (no confirmation needed)
- Keyboard shortcuts: 1-3 for goals, A-C for strategies
- Auto-advance after strategy selection (or manual button)
- Subtle hint: "Recommended for you" badge

---

#### 5b. MONITOR Phase (≈40-50 seconds)

```
┌────────────────────────────────────────────────────────┐
│  Chunk 3/10: Custom Hooks                 Strategy: 📝 │
├────────────────────────────────────────────────────────┤
│                                                        │
│  💭 Question                                           │
│  ┌──────────────────────────────────────────────┐    │
│  │  Why would you create a custom hook instead │    │
│  │  of just writing the logic directly in your  │    │
│  │  component?                                   │    │
│  └──────────────────────────────────────────────┘    │
│                                                        │
│  ✍️  Your explanation:                                │
│  ┌──────────────────────────────────────────────┐    │
│  │  Because you can reuse the logic across     │    │
│  │  multiple components without copying code.   │    │
│  │  It also makes the component cleaner...      │    │
│  │                                              │    │
│  │                                              │    │
│  └──────────────────────────────────────────────┘    │
│  150 characters (keep it brief!)                      │
│                                                        │
│  ─────────────────────────────────────────────────    │
│                                                        │
│  💪 How confident are you?                            │
│  ┌──────────────────────────────────────────────┐    │
│  │   Not sure        ●────────●────    Very sure│    │
│  │       0       25       50  ▲72        100    │    │
│  └──────────────────────────────────────────────┘    │
│                                                        │
│  ─────────────────────────────────────────────────    │
│                                                        │
│  🤔 What's muddiest? (optional)                       │
│  ┌──────────────────────────────────────────────┐    │
│  │  When do you use a hook vs a regular         │    │
│  │  function?                                    │    │
│  └──────────────────────────────────────────────┘    │
│                                                        │
│              [Check My Thinking →]                     │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**Key Elements:**
- Question generated from THEIR content
- Text area for self-explanation (with character guidance)
- Confidence slider with visual feedback
- Optional "muddiest point" field
- Mini-teach still accessible (collapse/expand option)

**Interaction Notes:**
- Auto-resize text area as user types
- Voice input icon for mobile
- Confidence slider:
  - Red zone (0-33): "Unsure"
  - Yellow zone (34-66): "Somewhat confident"
  - Green zone (67-100): "Very confident"
- Can skip muddiest point
- Button disabled until explanation has content

---

#### 5c. EVALUATE Phase (≈15-20 seconds)

```
┌────────────────────────────────────────────────────────┐
│  Chunk 3/10: Custom Hooks                              │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ✅ What you got right:                                │
│  ┌──────────────────────────────────────────────┐    │
│  │  • Reusability across components  ✓          │    │
│  │  • Cleaner component code  ✓                 │    │
│  │  • Good understanding of the main benefit    │    │
│  └──────────────────────────────────────────────┘    │
│                                                        │
│  💡 What to add to your thinking:                     │
│  ┌──────────────────────────────────────────────┐    │
│  │  Custom hooks also help you separate         │    │
│  │  concerns - keeping stateful logic separate  │    │
│  │  from UI rendering. Plus, they're easier to │    │
│  │  test in isolation!                          │    │
│  └──────────────────────────────────────────────┘    │
│                                                        │
│  📚 Example from your content:                        │
│  ┌──────────────────────────────────────────────┐    │
│  │  // Instead of this in every component:     │    │
│  │  const [data, setData] = useState(null)     │    │
│  │  useEffect(() => { fetch... }, [])          │    │
│  │                                              │    │
│  │  // Create once, use everywhere:            │    │
│  │  const data = useCustomFetch(url)           │    │
│  └──────────────────────────────────────────────┘    │
│                                                        │
│  ─────────────────────────────────────────────────    │
│                                                        │
│  🧭 Did your strategy help?        [👍 Yes] [👎 No]  │
│                                                        │
│  📝 Next time, I'll:                                  │
│  [ Try different strategy ] [ Slow down more ]        │
│  [ Do example first ] ◄ Selected                      │
│                                                        │
│  ─────────────────────────────────────────────────    │
│                                                        │
│  You were 72% confident → Actually got it 85% right!  │
│  Your calibration is improving 📈                     │
│                                                        │
│                  [Next Chunk →]                        │
│                    (or press Enter)                    │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**Key Elements:**
- Positive feedback first (what was correct)
- Constructive additions (not "wrong" but "to add")
- Example/analogy from THEIR uploaded content
- Two quick self-evaluation prompts
- Calibration insight (confidence vs. reality)
- Clear path to continue

**Interaction Notes:**
- Green highlights on correct parts
- Yellow highlights on additions
- Code blocks formatted properly
- Keyboard shortcut to continue (Enter/Space)
- Brief pause (2s) before allowing continue (reflection time)
- Smooth slide transition to next chunk's Plan phase

---

### 6. Session Complete / Summary

**Purpose:** Celebrate completion, show immediate insights, encourage continuation

```
┌────────────────────────────────────────────────────────┐
│                                                        │
│                  🎉 Session Complete!                  │
│                                                        │
│  ┌──────────────────────────────────────────────┐    │
│  │                                              │    │
│  │  React Hooks - Chapter 3                    │    │
│  │  10 chunks completed                         │    │
│  │  ~14 minutes                                 │    │
│  │                                              │    │
│  └──────────────────────────────────────────────┘    │
│                                                        │
│  📊 Today's Performance                                │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │ Accuracy     │  │ Avg Conf.    │  │ Calibrate │  │
│  │              │  │              │  │           │  │
│  │   8/10       │  │    65%       │  │   -8%     │  │
│  │   80% ✓      │  │              │  │ Slightly  │  │
│  │              │  │              │  │ under-    │  │
│  │              │  │              │  │ confident │  │
│  └──────────────┘  └──────────────┘  └───────────┘  │
│                                                        │
│  ✨ New Insight Unlocked!                             │
│  ┌──────────────────────────────────────────────┐    │
│  │  💡 Pattern Discovered                       │    │
│  │                                              │    │
│  │  When you noted a "muddiest point," your    │    │
│  │  next chunk accuracy jumped 15%. Naming     │    │
│  │  confusion helps you learn faster!          │    │
│  │                                              │    │
│  │  [View All Insights →]                      │    │
│  └──────────────────────────────────────────────┘    │
│                                                        │
│  🔥 5-day streak • +250 XP • Level 3 → 4 (87%)       │
│                                                        │
│  ┌────────────────────┐  ┌──────────────────────┐    │
│  │ Continue Learning  │  │  View Full Progress  │    │
│  │  (2 chunks left)   │  │     Dashboard        │    │
│  └────────────────────┘  └──────────────────────┘    │
│                                                        │
│                    [← Back to Library]                 │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**Key Elements:**
- Celebration header
- Session stats (accuracy, confidence, calibration)
- Featured insight card (one per session)
- XP/gamification elements (subtle)
- Clear next actions
- Option to continue or return to library

**Interaction Notes:**
- Confetti animation on load (brief, not annoying)
- Insight card is dismissible/shareable
- Progress bar showing level progression
- "Share achievement" option (optional social)

---

### 7. Insights Dashboard

**Purpose:** Reveal learning patterns, metacognitive awareness, progress tracking

```
┌─────────────────────────────────────────────────────────┐
│  Library    [Insights]    Profile                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Your Learning Profile                                  │
│  [All Materials ▾]  [Last 30 Days ▾]                   │
│                                                         │
│  ┌────────────────────────────────────────────────┐   │
│  │  📊 Overview                                   │   │
│  │                                                │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐      │   │
│  │  │ 🎯 Avg   │ │ 🧭 Best  │ │ 📈 Calib │      │   │
│  │  │ Accuracy │ │ Strategy │ │ Rating   │      │   │
│  │  │          │ │          │ │          │      │   │
│  │  │   73%    │ │Self-     │ │Improving │      │   │
│  │  │   ↑ 12%  │ │explain   │ │ (gap:-8%)│      │   │
│  │  └──────────┘ └──────────┘ └──────────┘      │   │
│  └────────────────────────────────────────────────┘   │
│                                                         │
│  📈 Confidence vs Accuracy Over Time                   │
│  ┌────────────────────────────────────────────────┐   │
│  │     [Interactive line chart]                   │   │
│  │  100│         ●                                │   │
│  │     │      ●     ●  ← Confidence              │   │
│  │   75│   ●           ●                          │   │
│  │     │              ■ ■ ← Actual Accuracy      │   │
│  │   50│        ■ ■                               │   │
│  │     │   ■                                      │   │
│  │   25│                                          │   │
│  │     └────────────────────────────              │   │
│  │      Week 1  Week 2  Week 3  Week 4           │   │
│  │                                                │   │
│  │  💡 Your confidence is catching up to reality!│   │
│  └────────────────────────────────────────────────┘   │
│                                                         │
│  🎓 Strategy Performance                               │
│  ┌────────────────────────────────────────────────┐   │
│  │  Self-explain    ████████░░  85% (40 chunks)  │   │
│  │  Work example    ███████░░░  70% (25 chunks)  │   │
│  │  Draw diagram    ██████░░░░  60% (15 chunks)  │   │
│  │                                                │   │
│  │  💡 You learn best when you self-explain!     │   │
│  └────────────────────────────────────────────────┘   │
│                                                         │
│  💬 Your Learning Patterns                             │
│  ┌────────────────────────────────────────────────┐   │
│  │  • You grasp concepts 20% faster than          │   │
│  │    applications - spend more time on examples  │   │
│  │                                                │   │
│  │  • Morning sessions (7-10am) have 15% higher  │   │
│  │    accuracy than evening                       │   │
│  │                                                │   │
│  │  • When confidence < 50%, you're actually     │   │
│  │    right 65% of the time - trust yourself more│   │
│  │                                                │   │
│  │  • Noting "muddiest points" correlates with   │   │
│  │    15% better performance on next chunk        │   │
│  └────────────────────────────────────────────────┘   │
│                                                         │
│  🎯 Concept Mastery: React Hooks                       │
│  ┌────────────────────────────────────────────────┐   │
│  │  ✅ useState           (95% accuracy, 12 reps) │   │
│  │  ✅ useEffect          (88% accuracy, 10 reps) │   │
│  │  ⚠️  Custom hooks      (60% accuracy, 5 reps)  │   │
│  │  ❌ useCallback        (45% accuracy, 3 reps)  │   │
│  │                                                │   │
│  │  [Focus session on weak areas →]              │   │
│  └────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Key Elements:**
- Overview cards with key metrics
- Interactive charts showing calibration over time
- Strategy performance breakdown
- Personalized learning patterns (narrative format)
- Concept-level mastery tracking
- Actionable recommendations

**Interaction Notes:**
- Filterable by material, date range, topic
- Hoverable tooltips for detailed stats
- Downloadable/printable reports
- "Create focus session" from weak areas
- Shareable insights (optional)

**Insight Types:**
1. **Calibration**: Confidence vs. actual accuracy
2. **Strategy effectiveness**: Which approaches work best
3. **Temporal patterns**: Time of day, session length effects
4. **Concept mastery**: Topic-level performance
5. **Meta-learning**: "You improve faster when you X"

---

## Component Specifications

### Button Styles

**Primary Action Button:**
- Large, full-width on mobile
- High contrast background
- Clear text: action verbs
- Examples: "Start Learning →", "Check My Thinking →", "Next Chunk →"

**Secondary Action Button:**
- Outlined style
- Less prominent
- Used for alternative paths
- Examples: "Back to Library", "Skip for Now"

**Selection Cards:**
- Large touch targets (min 44px height)
- Visual feedback on hover/tap
- Clear selected state
- Icons + text labels

### Input Components

**Text Area (Self-Explanation):**
- Auto-resize as user types
- Character counter
- Placeholder with examples
- Optional voice input button (mobile)
- Spell-check enabled

**Confidence Slider:**
- Visual gradient (red → yellow → green)
- Large touch target for thumb
- Current value displayed
- Snaps to increments of 5

**Muddiest Point Field:**
- Single-line text input
- Clearly marked as optional
- Placeholder: "What's least clear to you?"
- Can be skipped

### Progress Indicators

**Session Progress:**
- "Chunk 3/10" in header
- Linear progress bar
- Subtle, not distracting

**XP/Level Bar:**
- Shown on completion screen
- Animated fill on level up
- Clear numerical progress "87% to Level 4"

**Streak Counter:**
- Fire emoji + number
- Shown in header and completion screen
- Subtle celebration on milestone streaks (7, 30, 100 days)

---

## Visual Design System

### Color Palette (Suggested)

**Option A: Calm & Focused**
```
Primary:    #3B82F6 (Blue)
Secondary:  #8B5CF6 (Purple)
Success:    #10B981 (Green)
Warning:    #F59E0B (Amber)
Error:      #EF4444 (Red)
Neutral:    #64748B (Slate)

Background: #FFFFFF (White)
Surface:    #F8FAFC (Light Gray)
Text:       #0F172A (Dark Slate)
```

**Option B: Energetic & Engaging**
```
Primary:    #8B5CF6 (Purple)
Secondary:  #06B6D4 (Cyan)
Success:    #10B981 (Green)
Warning:    #F59E0B (Amber)
Error:      #EF4444 (Red)
Neutral:    #6B7280 (Gray)

Background: #FFFFFF (White)
Surface:    #F3F4F6 (Light Gray)
Text:       #111827 (Dark Gray)
```

### Typography

**Font Stack:**
- **Content/Body**: System font stack for performance
  - `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- **Headings**: Same as body (clean, focused)
- **Code**: `"SF Mono", Monaco, "Cascadia Code", monospace`

**Scale:**
- H1: 2rem (32px) - Page titles
- H2: 1.5rem (24px) - Section headers
- H3: 1.25rem (20px) - Card titles
- Body: 1rem (16px) - Main text
- Small: 0.875rem (14px) - Metadata, captions

**Line Height:**
- Headings: 1.2
- Body: 1.6 (for readability)
- Code: 1.4

### Spacing System

Use 8px base unit:
- xs: 4px (0.25rem)
- sm: 8px (0.5rem)
- md: 16px (1rem)
- lg: 24px (1.5rem)
- xl: 32px (2rem)
- 2xl: 48px (3rem)

### Shadows & Elevation

```
sm:  0 1px 2px rgba(0, 0, 0, 0.05)
md:  0 4px 6px rgba(0, 0, 0, 0.1)
lg:  0 10px 15px rgba(0, 0, 0, 0.1)
xl:  0 20px 25px rgba(0, 0, 0, 0.15)
```

Use sparingly - only for cards and modals.

### Border Radius

- Small elements (buttons, chips): 6px
- Cards: 12px
- Modals: 16px

---

## Interaction Patterns

### Transitions

**Between Loop Phases:**
- Smooth slide animation (300ms ease-in-out)
- Content fades out → new content fades in
- No jarring page reloads

**Card Interactions:**
- Hover: Subtle lift (2px translate + shadow increase)
- Click: Brief scale down (0.98) for tactile feedback
- Transition: 150ms ease

**Success States:**
- Brief green highlight on correct answers
- Subtle checkmark animation
- Optional haptic feedback (mobile)

### Loading States

**LLM Processing:**
- Skeleton screens (not spinners)
- Progressive status updates
- "Smart" estimations: "This usually takes ~30 seconds"

**Content Loading:**
- Pre-load next chunk during current chunk
- Instant transitions (no loading screens mid-session)
- Background sync for insights

### Error States

**Upload Errors:**
- Clear error message
- Suggested fixes
- "Try again" or "Choose different file"

**Processing Errors:**
- "We couldn't understand this content" with reasons
- Option to re-upload or adjust settings
- Contact support link

**Network Errors:**
- "Connection lost - your progress is saved"
- Retry button
- Offline mode indication

---

## Responsive Design

### Breakpoints

```
Mobile:  < 640px
Tablet:  640px - 1024px
Desktop: > 1024px
```

### Mobile Considerations

**Layout:**
- Single column
- Full-width cards
- Bottom navigation for main actions
- Collapsible sections

**Touch Targets:**
- Minimum 44×44px for all interactive elements
- Increased padding around buttons
- Larger text inputs

**Gestures:**
- Swipe between chunks (optional power user feature)
- Pull-to-refresh on library
- Tap to expand/collapse sections

**Performance:**
- Optimize for 3G networks
- Compress images
- Lazy load non-critical content
- Service worker for offline capability

### Desktop Enhancements

**Layout:**
- Two-column where appropriate (mini-teach + interaction)
- Sidebar navigation
- Hover states for additional info
- Keyboard shortcuts prominent

**Power User Features:**
- Keyboard navigation (Tab, Enter, number keys)
- Command palette (Cmd/Ctrl + K)
- Batch operations in library
- Advanced filtering and search

---

## Accessibility

### WCAG 2.1 AA Compliance

**Color Contrast:**
- Text: Minimum 4.5:1 ratio
- Large text (18pt+): Minimum 3:1 ratio
- UI components: Minimum 3:1 ratio

**Keyboard Navigation:**
- All interactive elements focusable
- Visible focus indicators
- Logical tab order
- Skip links for main content

**Screen Readers:**
- Semantic HTML (headings, landmarks, lists)
- ARIA labels where needed
- Alt text for all images
- Status announcements for dynamic content

**Motion:**
- Respect `prefers-reduced-motion`
- Option to disable animations
- No auto-playing videos

**Text:**
- Resizable up to 200% without loss of functionality
- No text in images (except logos)
- Clear, plain language

### Inclusive Design

**Cognitive Load:**
- One task at a time (90-second constraint helps)
- Clear progress indicators
- Consistent layouts
- Forgiving interactions (easy undo)

**Flexible Input:**
- Voice input option for text fields
- Adjustable timing (90s is default, not enforced)
- Multiple ways to accomplish tasks

---

## Open Questions

### Product Decisions

1. **LLM Transparency:**
   - Should users see the LLM "thinking" during processing?
   - How do we handle hallucinations or incorrect question generation?
   - Should users be able to rate/flag bad questions?

2. **Content Quality Control:**
   - What if uploaded content is too complex/simple?
   - How do we handle non-text content (images, diagrams, equations)?
   - Should we support handwritten notes (OCR)?

3. **Difficulty Adaptation:**
   - Should the system get harder if users are acing everything?
   - Spaced repetition integration?
   - Adaptive chunking based on performance?

4. **Social Features:**
   - Should users share materials with classmates?
   - Collaborative learning modes?
   - Public vs. private insights?
   - Leaderboards (competitive) vs. just personal progress?

5. **Monetization Impact:**
   - Free tier limitations (chunks per month? materials?)?
   - Premium features (advanced insights, unlimited uploads)?
   - How do we communicate value without being pushy?

### Technical Decisions

6. **Platform Priority:**
   - Web app first? Native mobile? PWA?
   - Desktop app considerations?
   - Cross-platform sync strategy?

7. **Performance:**
   - What's acceptable LLM processing time? (Target: <30s)
   - How do we handle slow networks?
   - Client-side vs. server-side chunk generation?

8. **Data Privacy:**
   - Where is user content stored?
   - Encryption standards?
   - GDPR/CCPA compliance?
   - Can users export/delete their data?

### UX Refinements

9. **Gamification Balance:**
   - How much XP/levels/streaks without being manipulative?
   - Intrinsic vs. extrinsic motivation?
   - Should we have optional "focus mode" without gamification?

10. **Customization:**
    - Should users customize the 90-second timing?
    - Theme options (dark mode, color schemes)?
    - Layout preferences?

11. **Feedback Quality:**
    - How do we ensure AI feedback is helpful and not generic?
    - Should feedback adapt to user's level?
    - Multi-modal feedback (text + diagrams + videos)?

12. **Session Interruption:**
    - What happens if user closes browser mid-session?
    - Auto-save strategy?
    - "Resume session" flow?

---

## Next Steps

### Phase 1: MVP Design (Current)
- [x] Complete UI/UX design document
- [ ] Create low-fidelity wireframes for core flows
- [ ] User test wireframes with 5-10 target users
- [ ] Design high-fidelity mockups for key screens
- [ ] Build design system / component library
- [ ] Create interactive prototype

### Phase 2: Development Alignment
- [ ] Review with development team
- [ ] Technical feasibility assessment
- [ ] Prioritize features for MVP vs. future phases
- [ ] Define API contracts for LLM integration
- [ ] Plan data model for user progress tracking

### Phase 3: Iteration
- [ ] Alpha testing with internal users
- [ ] Gather feedback on 90-second loop experience
- [ ] Refine based on actual usage patterns
- [ ] A/B test key flows (upload, loop interface, insights)
- [ ] Optimize for performance and accessibility

---

## Appendix

### Research References
- Nielsen Norman Group: Micro-interactions
- Material Design: Motion principles
- Apple HIG: Handling user input
- Inclusive Design Principles
- Learning science: Metacognition frameworks (Flavell, Schraw, Pintrich)

### Competitive Analysis
- **Brilliant.org**: Excellent interactive learning, but pre-made content
- **Anki**: Powerful spaced repetition, but passive card review
- **Quizlet**: Good for memorization, weak on metacognition
- **Notion AI**: Content transformation, but not learning-focused
- **Khan Academy**: Great lessons, but doesn't teach "how to learn"

**Our Differentiation:**
- User-uploaded content (personal relevance)
- Metacognitive skill development (not just content)
- Ultra-short loops (90 seconds, not 10 minutes)
- Insight-driven (teaching self-awareness)

---

**Document Status:** Draft v1.0
**Last Updated:** 2025-11-06
**Next Review:** After initial wireframe testing

---

*This document is a living guide. As we learn from users and iterate on the design, we'll update these specifications to reflect our evolving understanding of what makes the Metacognition Learning Engine effective and delightful to use.*

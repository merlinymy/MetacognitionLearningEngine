# Metacognition Learning Engine – Learn Deeply Through Reflection

## Project Summary
The **Metacognition Learning Engine** is a web application that helps students learn their own study material more effectively.  
Instead of passively reading or memorizing, learners upload their notes, textbook sections, or tutorials.  
The system automatically breaks the content into short, guided learning loops that align with **metacognitive practice** — *planning, monitoring, evaluating, and reflecting.*

Each loop lasts **under 90 seconds** to fit modern attention spans while still promoting meaningful engagement.  
Within that short time, users plan their learning goal, test their understanding, reflect on their reasoning, and get feedback that improves both their comprehension **and** their learning process.

---

## Project Goal
To build a system that combines content learning with metacognitive skill development — allowing users to:
1. Learn any material they upload through reflection and feedback.  
2. Practice metacognitive control by planning, monitoring, and evaluating their learning.  
3. Receive personalized insights about how they learn best.  

**Primary MVP Goal:**  
Validate that short reflection-based micro-learning loops are *more engaging and more effective* than passive reading.

---

## Why We’re Doing This
Students often read or re-watch lessons without realizing they don’t fully understand them.  
They rely on repetition, not reflection — which causes the **illusion of knowing**.  

Research in learning science shows that expert learners differ from novices not just by how much they know, but by their **metacognitive skills** — the ability to plan, monitor, and evaluate their learning (Flavell, 1979; Schraw, 1998).  

However, most study apps focus on delivering content, not teaching learners *how to learn.*  
This project closes that gap by turning any material into a **metacognitive learning experience** — where the user learns the content *and* practices learning regulation at the same time.

---

## How It Works

Each content chunk follows a short, research-based metacognitive cycle designed to last **≤ 90 seconds**:

### 1. **Plan (≈10s)**
Before each chunk:
- Display a **micro-teach** (≤80 words) to provide minimal “knowledge of task.”
- Ask two quick planning choices:
  - **Goal:** “I want to… [get the gist] [be able to explain] [apply in a problem].”
  - **Strategy:** “I’ll try… [self-explain] [draw a diagram] [work a tiny example].”

This gives the learner basic task understanding and strategy awareness before starting.

---

### 2. **Monitor (≈40–50s)**
During the chunk:
- 1 **micro-question** about the concept.  
- 1–2 sentence **self-explanation** field.  
- Two fast self-monitoring tools:
  - **Confidence slider (0–100)**  
  - **Muddiest point:** “What’s least clear?”

This captures awareness of progress, not just correctness.

---

### 3. **Evaluate (≈15–20s)**
After submission:
- The **AI provides targeted feedback**: what was correct, what was missing, and a short example or analogy to repair gaps.  
- The learner answers two quick self-evaluation questions:
  - “Did your strategy help?” [Yes/No]  
  - “Adjustment next time?” [try different strategy / slow down / do example first]

This step strengthens self-regulation by prompting users to evaluate and adjust.

---

### 4. **Teach Knowledge of Self**
At the end of each session, the app reflects back simple analytics to help learners discover their patterns:
- “You learn faster when you start with a diagram.”  
- “Your confidence is often 10–20 points higher than your accuracy on definitions.”  
- “When you note a muddiest point, your next-chunk accuracy rises by ~15%.”  

This gives learners *knowledge about themselves* — a key component of metacognition.

---

## Why It’s Different from Other Learning Apps

| Aspect | Brilliant / Khan Academy | Metacognition Learning Engine |
|--------|---------------------------|-------------------------------|
| **Content Source** | Pre-made lessons and exercises | Learner uploads their own material |
| **Learning Focus** | Teaching specific topics | Teaching *how to learn* any topic |
| **Feedback Type** | Correct/incorrect explanations | Reflective feedback on thinking and reasoning |
| **User Role** | Follows guided curriculum | Plans, monitors, and evaluates own learning |
| **Session Length** | 10–30 minutes per lesson | ≤ 90 seconds per concept |
| **Outcome** | Content mastery | Content + metacognitive mastery |

**In short:**  
Khan Academy and Brilliant teach *facts and skills.*  
The Metacognition Learning Engine teaches *understanding and self-awareness.*

---

## Data Model (Per-Chunk and Per-Session)

**Per Chunk:**
- `goal`
- `strategy_selected`
- `answer_correct`
- `explanation_text`
- `confidence`
- `muddiest_point`
- `ai_feedback_tags` (categories of missing pieces)
- `strategy_helpful` (boolean)
- `adjustment_next_time` (enum)

**Per Session:**
- **Calibration:** confidence – correctness  
- **Strategy win-rates:** performance by chosen strategy  
- **Common missing pieces:** taxonomy of recurring gaps  
- **Time-on-task:** per chunk (attention metric)

This data enables the app to generate **personalized insights** and visual progress reports that help learners understand their own thinking patterns.

---

## Expected Impact
- Short loops reduce cognitive load and fit modern attention spans.  
- Active reflection improves retention and deep understanding.  
- Feedback teaches learners how to correct and adapt their study strategies.  
- Analytics develop *self-knowledge* and *learning self-regulation.*

---

## Development Phases

### **Phase 1 – MVP Build (8 weeks)**
- File upload + text chunking  
- Plan → Monitor → Evaluate loop  
- AI feedback on explanations  
- Confidence slider + XP bar  
- Basic progress summary  

### **Phase 2 – Insight Tracking (8–12 weeks)**
- Strategy selection and evaluation  
- Confidence calibration and analytics  
- Personalized self-knowledge insights  

### **Phase 3 – Research Validation (After MVP)**
- Pilot test with college students  
- Compare engagement and learning gains vs. passive reading  
- Analyze reflection quality and calibration data  

---

## References (Key Research Background)
- Flavell, J. H. (1979). *Metacognition and Cognitive Monitoring.*  
- Schraw, G. (1998). *Promoting General Metacognitive Awareness.*  
- Pintrich, P. (2002). *The Role of Metacognitive Knowledge in Learning.*  
- Tanner, K. (2012). *Promoting Student Metacognition.*  
- Chen, Chavez, Ong, & Gunderson (2017). *Strategic Resource Use Intervention Study.*

---

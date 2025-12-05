# Demo Presentation Script

**Total Time: ~3 minutes**

---

## PART 1: SLIDES (~90 seconds)

### SLIDE 1: Title Slide (5 seconds)

**Say:**
"Hi everyone, I'm presenting the Metacognition Learning Engine - a web app that helps students learn their study material AND how they learn best at the same time."

---

### SLIDE 2: What is Metacognition? (20 seconds)

**Say:**
"So first, what is metacognition? It's thinking about your thinking. It means knowing what you know, knowing how you learn best, and being aware of when you're fooling yourself.

The big problem is that students often THINK they know something when they actually don't - like when you read your notes and feel like you got it, but then the exam comes and you realize you didn't really understand."

---

### SLIDE 3: Our Solution (15 seconds)

**Say:**
"Our app solves this by teaching two things at once: the actual study content - like biology or computer science - AND metacognitive awareness.

We do this through 90-second learning loops for each concept."

---

### SLIDE 4: The Learning Loop (30 seconds)

**Say:**
"Here's how each loop works. It's called Plan-Monitor-Evaluate:

First, you PLAN by choosing a learning goal - like 'understand the main idea' or 'explain it to someone.'

Then you MONITOR yourself by choosing a strategy, answering a question, and rating your confidence. Like 'I'm 75% sure I got this right.'

Finally, you EVALUATE - the app gives you feedback and shows you your actual accuracy. So you might see 'You were only 60% accurate - you were overconfident!'

This builds self-awareness over time."

---

### SLIDE 5: Teaching Two Things at Once (20 seconds)

**Say:**
"So here's how we teach both things simultaneously:

For learning the CONTENT: AI breaks your study material into small chunks, each chunk teaches one concept, and questions test your understanding.

For learning METACOGNITION: you track your confidence versus actual accuracy, see which strategies work best for YOU specifically, and build self-awareness over time."

---

### SLIDE 6: Example Session (10 seconds)

**Say:**
"Let me show you a quick example with actual numbers. A student uploads photosynthesis notes, gets 5 chunks, and at the end discovers that self-explain works best for them - 85% accuracy versus only 65% with other strategies."

---

### SLIDE 7: Tech Stack (SKIP if short on time)

**Say:**
"Quick tech overview: React frontend, Node and Express backend, MongoDB database, and GPT-4 or Claude for the AI."

---

## PART 2: LIVE DEMO (~90 seconds)

### PREPARATION (Do this BEFORE presenting!)
1. Open your deployed app URL in browser
2. Copy this sample text to your clipboard:

```
Photosynthesis is the process by which plants convert light energy into chemical energy stored in glucose. It occurs in chloroplasts and has two main stages. The light-dependent reactions occur in the thylakoid membranes and require sunlight. During these reactions, water molecules are split, releasing oxygen as a byproduct. The light energy is captured by chlorophyll and converted into ATP and NADPH. The light-independent reactions, also called the Calvin cycle, occur in the stroma. These reactions use the ATP and NADPH from the light-dependent reactions to convert carbon dioxide into glucose.
```

3. Test the flow once to ensure backend is running

---

### Step 1: Landing Page (5 seconds)

**On screen:** Landing page with "Learn with metacognition" header

**Say:**
"Alright, let me show you the actual app. This is the landing page."

**Action:** Click "Start learning" button

---

### Step 2: Upload Page (10 seconds)

**On screen:** Upload page with title field and textarea

**Say:**
"Here I can upload my study material. I'll paste some photosynthesis notes..."

**Action:**
1. Click in the textarea
2. Paste your sample text (Cmd+V / Ctrl+V)
3. (Optional) Type a title like "Photosynthesis Basics"

**Say:**
"...needs at least 100 characters, we're good. Now I'll generate the chunks."

**Action:** Click "Start learning" button
**Wait:** For loading to complete (~2-5 seconds)

---

### Step 3: PLAN Phase (15 seconds)

**On screen:** Learning page showing chunk content and learning goals

**Say:**
"Great! The AI broke it into chunks. Here's the first one with a mini-lesson on photosynthesis.

Now I PLAN - I'll choose my learning goal... let's pick 'Explain it to someone else.'"

**Action:**
1. Quickly scan the displayed chunk content
2. Click the second learning goal radio button (something like "Explain the concept to someone else")
3. Click "Continue to monitor" button

---

### Step 4: MONITOR Phase (20 seconds)

**On screen:** Question display, strategy selection, answer textarea, confidence slider

**Say:**
"Now I MONITOR. Here's my question about photosynthesis. I need to pick a strategy - I'll choose 'Self-explain'..."

**Action:**
1. Click a strategy radio button (e.g., "Self-explain: describe in your own words")
2. Click in the answer textarea

**Say:**
"...write my answer..."

**Action:**
Type a quick answer (e.g., "Plants use light to make glucose through two stages in chloroplasts")

**Say:**
"...and rate my confidence, let's say 70%."

**Action:**
1. Drag the confidence slider to around 70%
2. Click "Get feedback" button
**Wait:** For AI evaluation (~2-5 seconds)

---

### Step 5: EVALUATE Phase (20 seconds)

**On screen:** Performance metrics, correct answer, feedback, strategy reflection

**Say:**
"And now I EVALUATE - here's my accuracy score..."

**Action:** Point to the accuracy percentage

**Say:**
"...compared to my confidence. See how it shows if I was overconfident or well-calibrated?

It also shows me what I got right, what I missed, and gives me AI feedback.

Then I reflect on whether my strategy helped."

**Action:**
1. Scroll down slightly to show the feedback sections
2. Click "Yes" for strategy helpfulness (or just leave it)
3. Click "Next chunk" button (or "Complete session" if on last chunk)

---

### Step 6: Summary or Next Chunk (15 seconds)

**Option A: If more chunks remain:**

**On screen:** Next chunk's PLAN phase

**Say:**
"And I'd continue this for all the chunks. After all of them, I get a summary showing which strategies worked best for me."

**Action:** Click back or navigate to show the summary concept

**Option B: If you completed all chunks:**

**On screen:** Summary page with stats

**Say:**
"And here's the summary! I can see my overall accuracy, average confidence, and which strategies performed best. This is how students learn what works for them."

**Action:** Point to the strategy performance breakdown

---

### Step 7: Library (Optional - 5 seconds if time permits)

**Say:**
"I can also view my library of all past sessions to track progress over time."

**Action:** Click "View all sessions" or navigate to library

---

## WRAP UP (5 seconds)

**Say:**
"And that's it! The app is fully deployed and working. Happy to answer any questions!"

---

## TIMING GUIDE

**If you're running LONG:**
- Skip Slide 7 (Tech Stack)
- Don't type a session title in upload
- Use shorter answer text in MONITOR phase
- Skip the Library view at the end

**If you're running SHORT:**
- Add more explanation during EVALUATE phase
- Show the Library page
- Mention the character counter and validation features

---

## COMMON QUESTIONS & ANSWERS

**Q: How does the AI evaluation work?**
A: "We send the student's answer and the expected answer points to GPT-4 or Claude. It evaluates what they got right, what they missed, and calculates an accuracy percentage."

**Q: Can students see progress over time?**
A: "Yes! The Library page shows all your past sessions. Right now it's anonymous, but we have the database structure ready to add user authentication for long-term tracking."

**Q: What if someone is always overconfident?**
A: "That's exactly what we're trying to help with! Over multiple sessions, they'll see patterns and start calibrating better. They learn to recognize when they actually know something versus when they just think they do."

**Q: How many chunks does it generate?**
A: "It depends on the content length, but typically 4-8 chunks. Each chunk focuses on one key concept."

**Q: Is this live/deployed?**
A: "Yes! It's running on [mention your hosting - Render/Netlify] with a MongoDB Atlas database."

---

## TECHNICAL TROUBLESHOOTING

### If Backend is Down:
"Looks like we're getting a loading delay - let me talk through what would happen: [walk through the slides and explain the flow]"

### If AI is Slow:
"While this is generating, let me explain: we're using GPT-4/Claude to break this content into chunks and create questions that test understanding at different levels..."

### If You Make a Mistake:
"Perfect - this actually gives me a chance to show the validation! See how it won't let me proceed without [required field]?"

---

## PRE-DEMO CHECKLIST

Before you present, make sure:

- [ ] Backend is running (`npm start` in root directory)
- [ ] Frontend is accessible (deployed URL or `npm run dev:frontend`)
- [ ] MongoDB connection is working
- [ ] You've tested the full flow once
- [ ] Sample text is copied to clipboard
- [ ] Browser tabs are arranged: Slides → App
- [ ] Any browser extensions that might interfere are disabled
- [ ] You're logged out of any conflicting accounts
- [ ] Internet connection is stable

---

## CONFIDENCE TIPS

1. **You built a complete full-stack app** - that's more than most demos!
2. **The concept is solid** - addresses a real educational problem
3. **Live demos have hiccups** - everyone expects it, handle it gracefully
4. **Practice the transitions** - slides → browser → slides is the trickiest part
5. **Speak with enthusiasm** - you believe in this project!

**You've got this! 🚀**

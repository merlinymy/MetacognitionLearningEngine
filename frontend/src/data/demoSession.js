// Hardcoded demo session for metacognition introduction
// This avoids unnecessary LLM API calls since demo content is always the same

// Demo content that will be pre-filled in the upload form
export const DEMO_CONTENT = `# Introduction to Metacognition

Metacognition is thinking about thinking. It's your ability to understand and control your own thought processes. When you're metacognitive, you're aware of how you learn, what strategies work for you, and when you truly understand something versus when you're just fooling yourself.

Research identifies three main phases: Planning (setting goals before learning), Monitoring (checking your understanding during learning), and Evaluating (reflecting after learning). Students who use all three phases consistently score 20-30% higher on tests compared to those who don't.

One of the biggest traps in learning is the "illusion of knowing." When you re-read notes, they look familiar, so you think you understand them. But familiarity isn't the same as understanding. This is why testing yourself is so powerful - it reveals what you actually know versus what just looks familiar.

Calibration is your ability to accurately judge your own understanding. Research shows most students are overconfident - they think they know more than they actually do. Well-calibrated learners save time by studying what they don't know, rather than what they already understand.`;

export const DEMO_SESSION = {
  sessionId: "demo-session-metacognition",
  userId: "guest",
  contentPreview: "Introduction to Metacognition (Demo)",
  defaultGoal: "explain",
  status: "in_progress",
  chunks: [
    {
      chunkId: "demo_chunk_0",
      topic: "What is Metacognition?",
      miniTeach:
        "Metacognition is thinking about thinking. It's your ability to understand and control your own thought processes. When you're metacognitive, you're aware of how you learn, what strategies work for you, and when you truly understand something versus when you're just fooling yourself.",
      question: "Explain what metacognition means and why it's different from regular thinking.",
      questions: {
        gist: "What is metacognition in simple terms?",
        explain: "Explain what metacognition means and why it's different from regular thinking.",
        apply: "Give an example of when you've used metacognition in your own life.",
      },
      expectedPoints: [
        "Thinking about thinking",
        "Understanding your own thought processes",
        "Awareness of how you learn",
        "Different from just thinking because it's reflective",
      ],
      hints: [
        "Think about the prefix 'meta-' which means 'about' or 'beyond'",
        "Consider when you've asked yourself 'Do I really understand this?' - that's metacognition!",
      ],
      completed: false,
      // Pre-generated demo feedback (no API calls needed)
      demoFeedback: {
        accuracy: 85,
        feedback: "Great explanation! You correctly identified that metacognition is 'thinking about thinking' and mentioned how it involves awareness of your own learning process. You could strengthen your answer by providing a specific example of when you've used metacognition.",
        calibrationMessage: "You were well-calibrated on this question. Your confidence matched your actual understanding, which shows good metacognitive awareness!",
      },
    },
    {
      chunkId: "demo_chunk_1",
      topic: "The Three Phases of Metacognition",
      miniTeach:
        "Research identifies three main phases: Planning (setting goals before learning), Monitoring (checking your understanding during learning), and Evaluating (reflecting after learning). Students who use all three phases consistently score 20-30% higher on tests compared to those who don't.",
      question: "Describe the three phases of metacognition and explain why each one matters.",
      questions: {
        gist: "What are the three phases of metacognition?",
        explain: "Describe the three phases of metacognition and explain why each one matters.",
        apply: "How would you use these three phases to study for your next exam?",
      },
      expectedPoints: [
        "Planning - setting goals before learning",
        "Monitoring - checking understanding during learning",
        "Evaluating - reflecting after learning",
        "All three phases improve learning outcomes significantly",
      ],
      hints: [
        "Think about what you do before, during, and after studying",
        "Each phase serves a different purpose in the learning cycle",
      ],
      completed: false,
      demoFeedback: {
        accuracy: 90,
        feedback: "Excellent! You identified all three phases correctly: Planning, Monitoring, and Evaluating. You also explained why each matters. This shows strong comprehension of the metacognitive cycle.",
        calibrationMessage: "You were slightly overconfident on this question. Your confidence was higher than your actual performance, which is common! This awareness helps you study more effectively.",
      },
    },
    {
      chunkId: "demo_chunk_2",
      topic: "The Illusion of Knowing",
      miniTeach:
        "One of the biggest traps in learning is the 'illusion of knowing.' When you re-read notes, they look familiar, so you think you understand them. But familiarity isn't the same as understanding. This is why testing yourself is so powerful - it reveals what you actually know versus what just looks familiar.",
      question: "Explain the illusion of knowing and how metacognition helps you avoid it.",
      questions: {
        gist: "What is the illusion of knowing?",
        explain: "Explain the illusion of knowing and how metacognition helps you avoid it.",
        apply: "Describe a time when you fell into the illusion of knowing trap. How would you avoid it next time?",
      },
      expectedPoints: [
        "Familiarity is not the same as understanding",
        "Re-reading creates false sense of knowledge",
        "Testing reveals true understanding",
        "Metacognition helps you recognize when you don't really know something",
      ],
      hints: [
        "Think about when you thought you knew material but couldn't answer questions about it",
        "Consider why highlighting or re-reading notes feels productive but doesn't always lead to learning",
      ],
      completed: false,
      demoFeedback: {
        accuracy: 75,
        feedback: "Good start! You explained that familiarity doesn't equal understanding. To improve, you could elaborate more on how self-testing reveals the illusion of knowing and provide a specific example from your own experience.",
        calibrationMessage: "You were underconfident this time! Your actual performance was better than you expected. This shows you're being thoughtful about your understanding.",
      },
    },
    {
      chunkId: "demo_chunk_3",
      topic: "Calibration: Knowing What You Know",
      miniTeach:
        "Calibration is your ability to accurately judge your own understanding. Research shows most students are overconfident - they think they know more than they actually do. Well-calibrated learners save time by studying what they don't know, rather than what they already understand.",
      question: "What is calibration and why is it important for effective learning?",
      questions: {
        gist: "What does calibration mean in learning?",
        explain: "What is calibration and why is it important for effective learning?",
        apply: "How could you check your calibration when studying for a test?",
      },
      expectedPoints: [
        "Calibration = accurately judging your understanding",
        "Most students are overconfident",
        "Good calibration makes studying more efficient",
        "Helps you focus on what you don't know",
      ],
      hints: [
        "Think about the difference between your confidence and your actual performance",
        "Consider how knowing your weak spots helps you study smarter",
      ],
      completed: false,
      demoFeedback: {
        accuracy: 95,
        feedback: "Outstanding! You clearly explained what calibration is and why it matters. You mentioned that it helps learners focus on what they don't know, which is the key benefit. Your understanding is excellent.",
        calibrationMessage: "Perfect calibration! Your confidence matched your actual performance almost exactly. This is exactly what we're trying to develop through metacognitive practice.",
      },
    },
  ],
};

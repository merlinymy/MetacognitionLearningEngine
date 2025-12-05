import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Initialize Gemini AI client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/**
 * Generate learning chunks from raw content using Gemini
 * @param {string} content - The raw learning material content
 * @returns {Promise<Array>} Array of chunk objects with topics, mini-teaches, questions, and expected points
 */
export async function generateChunksWithGemini(content) {
  try {
    const prompt = `You are an educational content analyzer. Analyze the following learning material and break it down into 3-8 digestible chunks for a metacognitive learning system.

For each chunk, provide:
1. A clear topic title (2-5 words)
2. A mini-teach: A concise explanation (100-150 words) that teaches the key concepts
   - Use simple, everyday language where possible
   - Keep technical jargon when necessary for accuracy, but explain it simply
   - Include real-world metaphors and everyday life examples when they help clarify concepts
   - Use short, clear sentences
3. THREE different questions tailored to different learning goals:
   - "gist": A question to test if learner grasps the MAIN IDEA quickly (surface-level understanding)
   - "explain": A question to test if learner can EXPLAIN THE CONCEPT deeply to others (deep understanding)
   - "apply": A question to test if learner can APPLY the concept to solve a PRACTICAL PROBLEM (application)
4. For each question type, provide 3-5 expected key points that match that goal's depth

Return the output as a JSON array with this structure:
[
  {
    "chunkId": "chunk_0",
    "topic": "Topic Name",
    "miniTeach": "Brief explanation of the concept...",
    "questions": {
      "gist": "What is the main idea of...?",
      "explain": "How would you explain... to someone who's never heard of it?",
      "apply": "How could you use... to solve [specific problem]?"
    },
    "expectedPoints": {
      "gist": [
        "Main point only",
        "Key takeaway"
      ],
      "explain": [
        "Detailed point 1",
        "Detailed point 2",
        "Detailed point 3"
      ],
      "apply": [
        "Application step 1",
        "Application step 2",
        "Practical consideration"
      ]
    }
  }
]

Content to analyze:
${content}

Return ONLY the JSON array, no other text.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const responseText = response.text.trim();

    // Remove markdown code blocks if present
    let jsonText = responseText;
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?$/g, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```\n?/g, "").replace(/```\n?$/g, "");
    }

    const chunks = JSON.parse(jsonText);

    // Validate the structure
    if (!Array.isArray(chunks) || chunks.length === 0) {
      throw new Error("Invalid chunks format returned from LLM");
    }

    return chunks;
  } catch (error) {
    console.error("Error generating chunks with Gemini:", error);
    throw new Error(`Failed to generate chunks: ${error.message}`);
  }
}

/**
 * Evaluate a user's response using Gemini for intelligent semantic analysis
 * @param {string} userAnswer - The user's answer to the question
 * @param {Array<string>} expectedPoints - The expected key points
 * @param {string} question - The original question
 * @param {string} muddyPoint - What the user found confusing (optional)
 * @param {string} priorKnowledge - What the user already knew about the topic (optional)
 * @returns {Promise<Object>} Evaluation results with correctPoints, missingPoints, accuracy, and feedback
 */
export async function evaluateResponseWithGemini(
  userAnswer,
  expectedPoints,
  question,
  muddyPoint = "",
  priorKnowledge = ""
) {
  try {
    const priorKnowledgeSection = priorKnowledge.trim()
      ? `\n\nStudent's Prior Knowledge:
${priorKnowledge}

Note: The student indicated they had some prior knowledge about this topic. Consider this when providing feedback.`
      : "";

    const muddyPointSection = muddyPoint.trim()
      ? `\n\nStudent's Confusion (Muddiest Point):
${muddyPoint}

IMPORTANT: In your feedback, address and explain this confusion point to help the student gain clarity.`
      : "";

    const prompt = `You are an educational assessment expert. Evaluate a student's answer for semantic understanding, not just keyword matching.

Question: ${question}

Expected Key Points:
${expectedPoints.map((point, idx) => `${idx + 1}. ${point}`).join("\n")}${priorKnowledgeSection}

Student's Answer:
${userAnswer}${muddyPointSection}

Analyze the student's answer and determine:
1. Which expected points were covered (even if worded differently)
2. Which expected points were missing
3. Calculate accuracy as a percentage (0-100)
4. Provide constructive feedback (2-3 sentences)${muddyPoint.trim() ? " - make sure to address and explain their confusion point" : ""}

Return ONLY a JSON object with this structure:
{
  "correctPoints": ["points that were covered"],
  "missingPoints": ["points that were not covered"],
  "accuracy": 75,
  "feedback": "Your constructive feedback here..."
}

Be generous with semantic matching - if the student expresses the same idea in different words, count it as correct.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const responseText = response.text.trim();

    // Remove markdown code blocks if present
    let jsonText = responseText;
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?$/g, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```\n?/g, "").replace(/```\n?$/g, "");
    }

    const evaluation = JSON.parse(jsonText);

    // Validate the structure
    if (
      !evaluation.correctPoints ||
      !evaluation.missingPoints ||
      typeof evaluation.accuracy !== "number" ||
      !evaluation.feedback
    ) {
      throw new Error("Invalid evaluation format returned from LLM");
    }

    // Ensure accuracy is within bounds
    evaluation.accuracy = Math.max(0, Math.min(100, evaluation.accuracy));

    return evaluation;
  } catch (error) {
    console.error("Error evaluating response with Gemini:", error);
    throw new Error(`Failed to evaluate response: ${error.message}`);
  }
}

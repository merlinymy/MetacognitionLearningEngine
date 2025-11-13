import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";

dotenv.config();

// Initialize Claude client
const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

/**
 * Generate learning chunks from raw content using Claude
 * @param {string} content - The raw learning material content
 * @returns {Promise<Array>} Array of chunk objects
 */
export async function generateChunksWithClaude(content) {
  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: `You are an educational content analyzer. Analyze the following learning material and break it down into 3-8 digestible chunks for a metacognitive learning system.

For each chunk, provide:
1. A clear topic title (2-5 words)
2. A mini-teach: A concise explanation (100-150 words) that teaches the key concepts
3. A thought-provoking question that tests understanding
4. 3-5 expected key points that a learner should mention when answering the question

Return the output as a JSON array with this structure:
[
  {
    "chunkId": "chunk_0",
    "topic": "Topic Name",
    "miniTeach": "Brief explanation of the concept...",
    "question": "What are the main aspects of...?",
    "expectedPoints": [
      "First key point",
      "Second key point",
      "Third key point"
    ]
  }
]

Content to analyze:
${content}

Return ONLY the JSON array, no other text.`,
        },
      ],
    });

    const text = message.content[0].text;

    // Remove markdown code blocks if present
    let jsonText = text.trim();
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?$/g, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```\n?/g, "").replace(/```\n?$/g, "");
    }

    const chunks = JSON.parse(jsonText);

    // Validate the structure
    if (!Array.isArray(chunks) || chunks.length === 0) {
      throw new Error("Invalid chunks format returned from Claude");
    }

    return chunks;
  } catch (error) {
    console.error("Error generating chunks with Claude:", error);
    throw new Error(`Claude: ${error.message}`);
  }
}

/**
 * Evaluate a user's response using Claude
 * @param {string} userAnswer - The user's answer
 * @param {Array<string>} expectedPoints - Expected key points
 * @param {string} question - The original question
 * @returns {Promise<Object>} Evaluation results
 */
export async function evaluateResponseWithClaude(
  userAnswer,
  expectedPoints,
  question
) {
  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: `You are an educational assessment expert. Evaluate a student's answer for semantic understanding, not just keyword matching.

Question: ${question}

Expected Key Points:
${expectedPoints.map((point, idx) => `${idx + 1}. ${point}`).join("\n")}

Student's Answer:
${userAnswer}

Analyze the student's answer and determine:
1. Which expected points were covered (even if worded differently)
2. Which expected points were missing
3. Calculate accuracy as a percentage (0-100)
4. Provide constructive feedback (2-3 sentences)

Return ONLY a JSON object with this structure:
{
  "correctPoints": ["points that were covered"],
  "missingPoints": ["points that were not covered"],
  "accuracy": 75,
  "feedback": "Your constructive feedback here..."
}

Be generous with semantic matching - if the student expresses the same idea in different words, count it as correct.`,
        },
      ],
    });

    const text = message.content[0].text;

    // Remove markdown code blocks if present
    let jsonText = text.trim();
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
      throw new Error("Invalid evaluation format returned from Claude");
    }

    // Ensure accuracy is within bounds
    evaluation.accuracy = Math.max(0, Math.min(100, evaluation.accuracy));

    return evaluation;
  } catch (error) {
    console.error("Error evaluating response with Claude:", error);
    throw new Error(`Claude: ${error.message}`);
  }
}

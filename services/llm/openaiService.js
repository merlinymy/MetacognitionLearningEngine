import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate learning chunks from raw content using OpenAI
 * @param {string} content - The raw learning material content
 * @returns {Promise<Array>} Array of chunk objects
 */
export async function generateChunksWithOpenAI(content) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "developer",
          content:
            "You are an educational content analyzer. You MUST return ONLY a valid JSON array with no additional text, explanations, or markdown.",
        },
        {
          role: "user",
          content: `Analyze the following learning material and break it down into 3-8 digestible chunks for a metacognitive learning system.

For each chunk, provide:
1. A clear topic title (2-5 words)
2. A mini-teach: A concise explanation (100-150 words) that teaches the key concepts
3. A thought-provoking question that tests understanding
4. 3-5 expected key points that a learner should mention when answering the question

Return ONLY a JSON array with this structure:
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
${content}`,
        },
      ],
      temperature: 0.7,
    });

    const text = completion.choices[0].message.content;

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
      throw new Error("Invalid chunks format returned from OpenAI");
    }

    return chunks;
  } catch (error) {
    console.error("Error generating chunks with OpenAI:", error);
    throw new Error(`OpenAI: ${error.message}`);
  }
}

/**
 * Evaluate a user's response using OpenAI
 * @param {string} userAnswer - The user's answer
 * @param {Array<string>} expectedPoints - Expected key points
 * @param {string} question - The original question
 * @returns {Promise<Object>} Evaluation results
 */
export async function evaluateResponseWithOpenAI(
  userAnswer,
  expectedPoints,
  question
) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "developer",
          content:
            "You are an educational assessment expert. You MUST return ONLY a valid JSON object with no additional text, explanations, or markdown.",
        },
        {
          role: "user",
          content: `Evaluate a student's answer for semantic understanding, not just keyword matching.

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
      temperature: 0.5,
    });

    const text = completion.choices[0].message.content;

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
      throw new Error("Invalid evaluation format returned from OpenAI");
    }

    // Ensure accuracy is within bounds
    evaluation.accuracy = Math.max(0, Math.min(100, evaluation.accuracy));

    return evaluation;
  } catch (error) {
    console.error("Error evaluating response with OpenAI:", error);
    throw new Error(`OpenAI: ${error.message}`);
  }
}

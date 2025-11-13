/**
 * On-Device LLM Service (Mock Implementation)
 * This is a placeholder for future on-device model integration
 * Currently returns mock data for testing purposes
 */

/**
 * Generate learning chunks using on-device model (mock)
 * @param {string} content - The raw learning material content
 * @returns {Promise<Array>} Array of chunk objects
 */
export async function generateChunksWithOnDevice(content) {
  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Simple chunking based on paragraphs and word count
  const words = content.split(/\s+/);
  const numChunks = Math.min(Math.max(Math.floor(words.length / 100), 3), 8);

  const chunks = [];
  const chunkSize = Math.floor(content.length / numChunks);

  for (let i = 0; i < numChunks; i++) {
    const start = i * chunkSize;
    const end = Math.min((i + 1) * chunkSize, content.length);
    const chunkContent = content.substring(start, end).trim();

    // Extract first sentence as topic
    const firstSentence = chunkContent.match(/^[^.!?]+/)?.[0] || "Topic";
    const topic = firstSentence.substring(0, 30).trim();

    chunks.push({
      chunkId: `chunk_${i}`,
      topic: topic,
      miniTeach: chunkContent.substring(0, 500) + "...",
      question: `What are the key concepts discussed in: "${topic}"?`,
      expectedPoints: [
        "Main concept or definition",
        "Supporting details or examples",
        "Implications or applications",
      ],
    });
  }

  return chunks;
}

/**
 * Evaluate a user's response using on-device model (mock)
 * @param {string} userAnswer - The user's answer
 * @param {Array<string>} expectedPoints - Expected key points
 * @param {string} question - The original question
 * @returns {Promise<Object>} Evaluation results
 */
export async function evaluateResponseWithOnDevice(
  userAnswer,
  expectedPoints,
  question
) {
  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Simple keyword-based evaluation
  const answerLower = userAnswer.toLowerCase();
  const correctPoints = [];
  const missingPoints = [];

  expectedPoints.forEach((point) => {
    const keywords = point
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3);
    const hasMatch = keywords.some((keyword) => answerLower.includes(keyword));

    if (hasMatch) {
      correctPoints.push(point);
    } else {
      missingPoints.push(point);
    }
  });

  const accuracy = Math.round(
    (correctPoints.length / expectedPoints.length) * 100
  );

  let feedback = "";
  if (accuracy >= 80) {
    feedback =
      "Excellent work! You demonstrated strong understanding of the key concepts. ";
  } else if (accuracy >= 60) {
    feedback =
      "Good effort! You captured some important points. Consider reviewing the material again. ";
  } else {
    feedback =
      "Let's review the key concepts together to strengthen your understanding. ";
  }

  if (missingPoints.length > 0) {
    feedback += `You might want to explore: ${missingPoints.slice(0, 2).join(", ")}.`;
  }

  return {
    correctPoints,
    missingPoints,
    accuracy,
    feedback,
  };
}

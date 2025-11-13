/**
 * LLM Service Factory
 * Dynamically selects and uses the appropriate LLM provider based on user request
 */

import {
  generateChunksWithGemini,
  evaluateResponseWithGemini,
} from "./llm/geminiService.js";
import {
  generateChunksWithOpenAI,
  evaluateResponseWithOpenAI,
} from "./llm/openaiService.js";
import {
  generateChunksWithClaude,
  evaluateResponseWithClaude,
} from "./llm/claudeService.js";
import {
  generateChunksWithOnDevice,
  evaluateResponseWithOnDevice,
} from "./llm/onDeviceService.js";

// Supported LLM providers
export const LLM_PROVIDERS = {
  GEMINI: "GEMINI",
  OPENAI: "OPENAI",
  CLAUDE: "CLAUDE",
  ON_DEVICE: "ON_DEVICE",
};

/**
 * Generate learning chunks using the specified LLM provider
 * @param {string} content - The raw learning material content
 * @param {string} provider - LLM provider to use (GEMINI, OPENAI, CLAUDE, ON_DEVICE)
 * @returns {Promise<Array>} Array of chunk objects
 */
export async function generateChunks(content, provider = "GEMINI") {
  const providerUpper = provider.toUpperCase();

  console.log(`Generating chunks with provider: ${providerUpper}`);

  switch (providerUpper) {
    case LLM_PROVIDERS.GEMINI:
      return await generateChunksWithGemini(content);

    case LLM_PROVIDERS.OPENAI:
      return await generateChunksWithOpenAI(content);

    case LLM_PROVIDERS.CLAUDE:
      return await generateChunksWithClaude(content);

    case LLM_PROVIDERS.ON_DEVICE:
      return await generateChunksWithOnDevice(content);

    default:
      throw new Error(
        `Unsupported LLM provider: ${provider}. Supported providers are: ${Object.values(LLM_PROVIDERS).join(", ")}`
      );
  }
}

/**
 * Evaluate a user's response using the specified LLM provider
 * @param {string} userAnswer - The user's answer
 * @param {Array<string>} expectedPoints - Expected key points
 * @param {string} question - The original question
 * @param {string} provider - LLM provider to use (GEMINI, OPENAI, CLAUDE, ON_DEVICE)
 * @returns {Promise<Object>} Evaluation results
 */
export async function evaluateResponse(
  userAnswer,
  expectedPoints,
  question,
  provider = "GEMINI"
) {
  const providerUpper = provider.toUpperCase();

  console.log(`Evaluating response with provider: ${providerUpper}`);

  switch (providerUpper) {
    case LLM_PROVIDERS.GEMINI:
      return await evaluateResponseWithGemini(
        userAnswer,
        expectedPoints,
        question
      );

    case LLM_PROVIDERS.OPENAI:
      return await evaluateResponseWithOpenAI(
        userAnswer,
        expectedPoints,
        question
      );

    case LLM_PROVIDERS.CLAUDE:
      return await evaluateResponseWithClaude(
        userAnswer,
        expectedPoints,
        question
      );

    case LLM_PROVIDERS.ON_DEVICE:
      return await evaluateResponseWithOnDevice(
        userAnswer,
        expectedPoints,
        question
      );

    default:
      throw new Error(
        `Unsupported LLM provider: ${provider}. Supported providers are: ${Object.values(LLM_PROVIDERS).join(", ")}`
      );
  }
}

/**
 * Get list of available LLM providers
 * @returns {Array<string>} List of provider names
 */
export function getAvailableProviders() {
  return Object.values(LLM_PROVIDERS);
}

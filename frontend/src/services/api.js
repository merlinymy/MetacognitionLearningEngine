// API service for communicating with the backend
// In development, Vite proxy will forward /api requests to http://localhost:3000
// In production, the backend serves the built frontend from /frontend/dist

const API_BASE = "/api";

/**
 * Generic fetch wrapper with error handling
 */
async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Request failed" }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

/**
 * Generate chunks from text content
 * POST /api/chunks/generate
 */
export async function generateChunks(
  content,
  title = "",
  provider = "GEMINI",
  userId = "anonymous",
  defaultGoal = "explain",
) {
  return apiFetch("/chunks/generate", {
    method: "POST",
    body: JSON.stringify({ content, title, provider, userId, defaultGoal }),
  });
}

/**
 * Get all chunks for a session
 * GET /api/chunks/:sessionId
 */
export async function getChunks(sessionId) {
  return apiFetch(`/chunks/${sessionId}`);
}

/**
 * Get specific chunk
 * GET /api/chunks/:sessionId/:chunkId
 */
export async function getChunk(sessionId, chunkId) {
  return apiFetch(`/chunks/${sessionId}/${chunkId}`);
}

/**
 * Get all sessions
 * GET /api/sessions
 */
export async function getSessions(userId = "anonymous", limit = 50, skip = 0) {
  return apiFetch(`/sessions?userId=${userId}&limit=${limit}&skip=${skip}`);
}

/**
 * Get specific session
 * GET /api/sessions/:id
 */
export async function getSession(sessionId) {
  return apiFetch(`/sessions/${sessionId}`);
}

/**
 * Mark chunk as complete
 * PATCH /api/sessions/:id/complete-chunk
 */
export async function completeChunk(sessionId, chunkId) {
  return apiFetch(`/sessions/${sessionId}/complete-chunk`, {
    method: "PATCH",
    body: JSON.stringify({ chunkId }),
  });
}

/**
 * Get session summary with stats
 * GET /api/sessions/:id/summary
 */
export async function getSessionSummary(sessionId) {
  return apiFetch(`/sessions/${sessionId}/summary`);
}

/**
 * Redo/reset session (mark all chunks incomplete, delete responses)
 * POST /api/sessions/:id/redo
 */
export async function redoSession(sessionId) {
  return apiFetch(`/sessions/${sessionId}/redo`, {
    method: "POST",
  });
}

/**
 * Delete session
 * DELETE /api/sessions/:id
 */
export async function deleteSession(sessionId) {
  return apiFetch(`/sessions/${sessionId}`, {
    method: "DELETE",
  });
}

/**
 * Submit chunk response
 * POST /api/responses
 */
export async function submitResponse(data) {
  return apiFetch("/responses", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Get all responses for a session
 * GET /api/responses/session/:sessionId
 */
export async function getSessionResponses(sessionId) {
  return apiFetch(`/responses/session/${sessionId}`);
}

/**
 * Get strategy usage history for a user
 * GET /api/responses/strategy-history/:strategy
 */
export async function getStrategyHistory(strategy, userId = "anonymous") {
  return apiFetch(`/responses/strategy-history/${strategy}?userId=${userId}`);
}

/**
 * Update strategy helpfulness
 * PATCH /api/responses/:id/strategy-helpful
 */
export async function updateStrategyHelpful(
  responseId,
  strategyHelpful,
  strategyReflection = "",
  goalAchieved = null,
  nextTimeAdjustment = null,
) {
  return apiFetch(`/responses/${responseId}/strategy-helpful`, {
    method: "PATCH",
    body: JSON.stringify({
      strategyHelpful,
      strategyReflection,
      goalAchieved,
      nextTimeAdjustment,
    }),
  });
}

// Alias for convenience
export const markStrategyHelpful = updateStrategyHelpful;

/**
 * Authentication APIs
 */

/**
 * Log out user
 * POST /api/auth/logout
 */
export async function logout() {
  return apiFetch("/auth/logout", {
    method: "POST",
  });
}

/**
 * Get current user
 * GET /api/auth/me
 */
export async function getCurrentUser() {
  return apiFetch("/auth/me");
}

/**
 * Get Google OAuth URL
 */
export function getGoogleAuthUrl() {
  return `${API_BASE}/auth/google`;
}

/**
 * Migrate guest sessions to authenticated user
 * POST /api/auth/migrate-guest-data
 */
export async function migrateGuestData(sessionIds) {
  return apiFetch("/auth/migrate-guest-data", {
    method: "POST",
    body: JSON.stringify({ sessionIds }),
  });
}

export default {
  generateChunks,
  getChunks,
  getChunk,
  getSessions,
  getSession,
  completeChunk,
  getSessionSummary,
  redoSession,
  deleteSession,
  submitResponse,
  getSessionResponses,
  updateStrategyHelpful,
  logout,
  getCurrentUser,
  getGoogleAuthUrl,
};

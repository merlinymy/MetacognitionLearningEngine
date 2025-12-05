/**
 * Guest session storage utilities
 * Manages localStorage for guest user sessions and prompt tracking
 */

const STORAGE_KEYS = {
  GUEST_SESSIONS: 'metacognition_guest_sessions',
  PROMPT_HISTORY: 'metacognition_prompt_history',
  GUEST_FLAG: 'metacognition_is_guest'
};

/**
 * Check if user is a guest (not authenticated)
 */
export function isGuest() {
  return localStorage.getItem(STORAGE_KEYS.GUEST_FLAG) === 'true';
}

/**
 * Mark user as guest
 */
export function setGuestFlag(value = true) {
  if (value) {
    localStorage.setItem(STORAGE_KEYS.GUEST_FLAG, 'true');
  } else {
    localStorage.removeItem(STORAGE_KEYS.GUEST_FLAG);
  }
}

/**
 * Get all guest sessions
 */
export function getGuestSessions() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.GUEST_SESSIONS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to get guest sessions:', error);
    return [];
  }
}

/**
 * Add a session to guest's localStorage
 */
export function addGuestSession(sessionId, title = 'Untitled Session') {
  try {
    const sessions = getGuestSessions();
    const newSession = {
      sessionId,
      title,
      createdAt: new Date().toISOString(),
      chunksCompleted: 0
    };

    // Avoid duplicates
    const existingIndex = sessions.findIndex(s => s.sessionId === sessionId);
    if (existingIndex >= 0) {
      sessions[existingIndex] = { ...sessions[existingIndex], ...newSession };
    } else {
      sessions.push(newSession);
    }

    localStorage.setItem(STORAGE_KEYS.GUEST_SESSIONS, JSON.stringify(sessions));
    setGuestFlag(true);
  } catch (error) {
    console.error('Failed to add guest session:', error);
  }
}

/**
 * Update guest session progress
 */
export function updateGuestSessionProgress(sessionId, chunksCompleted) {
  try {
    const sessions = getGuestSessions();
    const sessionIndex = sessions.findIndex(s => s.sessionId === sessionId);

    if (sessionIndex >= 0) {
      sessions[sessionIndex].chunksCompleted = chunksCompleted;
      sessions[sessionIndex].lastUpdated = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.GUEST_SESSIONS, JSON.stringify(sessions));
    }
  } catch (error) {
    console.error('Failed to update guest session:', error);
  }
}

/**
 * Get prompt history for a session
 */
export function getPromptHistory(sessionId) {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PROMPT_HISTORY);
    const history = data ? JSON.parse(data) : {};
    return history[sessionId] || { shown: [], dismissed: [] };
  } catch (error) {
    console.error('Failed to get prompt history:', error);
    return { shown: [], dismissed: [] };
  }
}

/**
 * Mark a prompt as shown
 */
export function markPromptShown(sessionId, promptType, chunkNumber) {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PROMPT_HISTORY);
    const history = data ? JSON.parse(data) : {};

    if (!history[sessionId]) {
      history[sessionId] = { shown: [], dismissed: [] };
    }

    const promptRecord = {
      type: promptType,
      chunkNumber,
      timestamp: new Date().toISOString()
    };

    history[sessionId].shown.push(promptRecord);
    localStorage.setItem(STORAGE_KEYS.PROMPT_HISTORY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to mark prompt shown:', error);
  }
}

/**
 * Mark a prompt as dismissed
 */
export function markPromptDismissed(sessionId, promptType, chunkNumber) {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PROMPT_HISTORY);
    const history = data ? JSON.parse(data) : {};

    if (!history[sessionId]) {
      history[sessionId] = { shown: [], dismissed: [] };
    }

    const promptRecord = {
      type: promptType,
      chunkNumber,
      timestamp: new Date().toISOString()
    };

    history[sessionId].dismissed.push(promptRecord);
    localStorage.setItem(STORAGE_KEYS.PROMPT_HISTORY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to mark prompt dismissed:', error);
  }
}

/**
 * Check if a prompt should be shown
 */
export function shouldShowPrompt(sessionId, promptType, chunkNumber) {
  const history = getPromptHistory(sessionId);

  // Don't show if already dismissed
  const wasDismissed = history.dismissed.some(
    p => p.type === promptType && p.chunkNumber === chunkNumber
  );

  if (wasDismissed) {
    return false;
  }

  // Don't show if already shown (unless it's a repeated prompt)
  const wasShown = history.shown.some(
    p => p.type === promptType && p.chunkNumber === chunkNumber
  );

  return !wasShown;
}

/**
 * Clear all guest data
 */
export function clearGuestData() {
  localStorage.removeItem(STORAGE_KEYS.GUEST_SESSIONS);
  localStorage.removeItem(STORAGE_KEYS.PROMPT_HISTORY);
  localStorage.removeItem(STORAGE_KEYS.GUEST_FLAG);
}

/**
 * Get all guest data for migration
 */
export function getGuestDataForMigration() {
  return {
    sessions: getGuestSessions(),
    flag: isGuest()
  };
}

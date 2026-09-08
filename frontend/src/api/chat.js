import { authFetch } from "./client";

/**
 * Send a message to the AI chat assistant
 * @param {string} token - JWT authentication token
 * @param {Object} payload
 * @param {string} payload.message - User's message text
 * @param {string} [payload.sessionId] - Active chat session UUID if continuing a conversation
 * @returns {Promise<{ success: boolean, data: { sessionId: string, reply: string, extractedBooking: Object|null, isComplete: boolean, isAmbiguous: boolean, needsFormFallback: boolean, messages: Array<Object> } }>}
 */
export async function sendChatMessage(token, { message, sessionId }) {
  return authFetch("/chat/message", token, {
    method: "POST",
    body: JSON.stringify({
      message,
      sessionId: sessionId || undefined,
    }),
  });
}

/**
 * Fetch full message history for a specific chat session
 * @param {string} token - JWT authentication token
 * @param {string} sessionId - Chat session UUID
 * @returns {Promise<{ success: boolean, data: Object }>}
 */
export async function fetchChatHistory(token, sessionId) {
  return authFetch(`/chat/history/${sessionId}`, token);
}

/**
 * Fetch all chat sessions for the authenticated user
 * @param {string} token - JWT authentication token
 * @returns {Promise<{ success: boolean, count: number, data: Array<Object> }>}
 */
export async function fetchChatSessions(token) {
  return authFetch("/chat/sessions", token);
}

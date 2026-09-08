const crypto = require("crypto");
const chatModel = require("../models/chatModel");
const aiService = require("./aiService");
const AppError = require("../utils/AppError");

/**
 * Handle sending a message in a chat session
 * @param {object} params
 * @param {string} params.userId - User UUID
 * @param {string} [params.sessionId] - Optional existing chat session UUID
 * @param {string} params.message - User message text
 * @returns {Promise<object>} AI response payload and updated session data
 */
const sendMessage = async ({ userId, sessionId, message }) => {
  let session = null;

  if (sessionId) {
    session = await chatModel.findByIdAndUser(sessionId, userId);
  }

  // If no session provided or not found, create a new one
  if (!session) {
    session = await chatModel.createSession(userId, {
      extracted: {},
      isComplete: false,
    });
  }

  const existingMessages = Array.isArray(session.messages) ? session.messages : [];
  const previousExtracted = session.metadata?.extracted || {};

  // Process message through AI Integration Service
  const aiResult = await aiService.processMessage({
    userMessage: message,
    history: existingMessages,
    previousExtracted,
  });

  const now = new Date().toISOString();
  const userMsgItem = {
    id: crypto.randomUUID(),
    sender: "user",
    text: message,
    timestamp: now,
  };

  const aiMsgItem = {
    id: crypto.randomUUID(),
    sender: "ai",
    text: aiResult.reply,
    timestamp: now,
    suggestedBooking: aiResult.isComplete ? aiResult.extracted : null,
    isComplete: aiResult.isComplete,
    isAmbiguous: aiResult.isAmbiguous,
    needsFormFallback: aiResult.needsFormFallback,
  };

  const updatedMessages = [...existingMessages, userMsgItem, aiMsgItem];
  const updatedMetadata = {
    ...session.metadata,
    extracted: aiResult.extracted,
    isComplete: aiResult.isComplete,
    isAmbiguous: aiResult.isAmbiguous,
    needsFormFallback: aiResult.needsFormFallback,
    lastInteraction: now,
  };

  // Persist conversation history to database
  await chatModel.updateSession(
    session.id,
    userId,
    updatedMessages,
    updatedMetadata,
  );

  return {
    sessionId: session.id,
    reply: aiResult.reply,
    extractedBooking: aiResult.extracted,
    isComplete: aiResult.isComplete,
    isAmbiguous: aiResult.isAmbiguous,
    needsFormFallback: aiResult.needsFormFallback,
    messages: updatedMessages,
  };
};

/**
 * Fetch message history for a specific chat session
 * @param {string} sessionId - Session UUID
 * @param {string} userId - User UUID
 * @returns {Promise<object>} Chat session record
 */
const getSessionHistory = async (sessionId, userId) => {
  const session = await chatModel.findByIdAndUser(sessionId, userId);
  if (!session) {
    throw new AppError("Chat session not found.", 404);
  }
  return session;
};

/**
 * Fetch all chat sessions for a user
 * @param {string} userId - User UUID
 * @returns {Promise<Array<object>>} List of chat sessions
 */
const getUserSessions = async (userId) => {
  return await chatModel.findAllByUser(userId);
};

module.exports = {
  sendMessage,
  getSessionHistory,
  getUserSessions,
};

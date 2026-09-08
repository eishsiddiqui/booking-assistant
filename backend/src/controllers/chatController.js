const chatService = require("../services/chatService");

/**
 * Handle incoming chat message
 * POST /api/chat/message
 */
const sendMessage = async (req, res, next) => {
  try {
    const { message, sessionId } = req.body;
    const userId = req.user.id;

    const result = await chatService.sendMessage({
      userId,
      sessionId,
      message,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve message history for a session
 * GET /api/chat/history/:sessionId
 */
const getSessionHistory = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const session = await chatService.getSessionHistory(sessionId, userId);

    return res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve all chat sessions for the authenticated user
 * GET /api/chat/sessions
 */
const getUserSessions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const sessions = await chatService.getUserSessions(userId);

    return res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendMessage,
  getSessionHistory,
  getUserSessions,
};

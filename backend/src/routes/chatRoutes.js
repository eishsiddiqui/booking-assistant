const express = require("express");
const {
  sendMessage,
  getSessionHistory,
  getUserSessions,
} = require("../controllers/chatController");
const {
  validateSendMessage,
  validateSessionIdParam,
} = require("../middleware/chatValidation");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.post("/message", validateSendMessage, sendMessage);
router.get("/history/:sessionId", validateSessionIdParam, getSessionHistory);
router.get("/sessions", getUserSessions);

module.exports = router;

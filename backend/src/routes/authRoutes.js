const express = require("express");
const { signup, login, getMe } = require("../controllers/authController");
const { validateSignup, validateLogin } = require("../middleware/validation");
const authMiddleware = require("../middleware/authMiddleware");
const { authLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

router.post("/signup", authLimiter, validateSignup, signup);
router.post("/login", authLimiter, validateLogin, login);
router.get("/me", authMiddleware, getMe);

module.exports = router;

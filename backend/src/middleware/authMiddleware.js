const { verifyToken } = require("../utils/jwt");
const pool = require("../db/db");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization denied: No token provided.",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authorization denied: Token is missing.",
      });
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Authorization denied: Token has expired.",
        });
      }
      return res.status(401).json({
        success: false,
        message: "Authorization denied: Invalid token.",
      });
    }

    // Verify user exists in database
    const userQuery =
      "SELECT id, name, email, created_at FROM users WHERE id = $1";
    const result = await pool.query(userQuery, [decoded.id]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Authorization denied: User not found.",
      });
    }

    // Attach user payload to request
    req.user = result.rows[0];
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during authentication.",
    });
  }
};

module.exports = authMiddleware;

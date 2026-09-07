const bcrypt = require("bcryptjs");
const pool = require("../db/db");
const { generateToken } = require("../utils/jwt");

//Signup Controller
const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const existingUserQuery = "SELECT id FROM users WHERE email = $1";
    const existingUser = await pool.query(existingUserQuery, [email]);

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "A user with this email already exists.",
      });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const insertUserQuery = `
      INSERT INTO users (name, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, name, email, created_at
    `;
    const result = await pool.query(insertUserQuery, [
      name,
      email,
      passwordHash,
    ]);
    const newUser = result.rows[0];

    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully.",
      token,
      user: newUser,
    });
  } catch (error) {
    next(error);
  }
};

//Login Controller
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const userQuery = `
      SELECT id, name, email, password_hash, created_at
      FROM users
      WHERE email = $1
    `;
    const result = await pool.query(userQuery, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const user = result.rows[0];

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    next(error);
  }
};

//Get Me Controller
const getMe = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  login,
  getMe,
};

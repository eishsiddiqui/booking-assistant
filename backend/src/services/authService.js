const bcrypt = require("bcryptjs");
const userModel = require("../models/userModel");
const { generateToken } = require("../utils/jwt");
const AppError = require("../utils/AppError");

const signup = async ({ name, email, password }) => {
  const existingUser = await userModel.findByEmail(email);
  if (existingUser) {
    throw new AppError("A user with this email already exists.", 409);
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  let newUser;
  try {
    newUser = await userModel.create({
      name,
      email,
      passwordHash,
    });
  } catch (error) {
    if (error.code === "23505") {
      throw new AppError("A user with this email already exists.", 409);
    }
    throw error;
  }

  const token = generateToken({
    id: newUser.id,
    email: newUser.email,
    name: newUser.name,
  });

  return {
    token,
    user: newUser,
  };
};

const login = async ({ email, password }) => {
  const user = await userModel.findByEmail(email);
  if (!user) {
    throw new AppError("Invalid email or password.", 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    throw new AppError("Invalid email or password.", 401);
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    name: user.name,
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      created_at: user.created_at,
    },
  };
};

module.exports = {
  signup,
  login,
};

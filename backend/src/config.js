require("dotenv").config();

const config = {
  port: process.env.PORT || 5000,

  database: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },

  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",

  // ai: {
  //   mistralApiKey: process.env.MISTRAL_API_KEY || "",
  //   model: process.env.AI_MODEL || "mistral-small-latest",
  // },

  ai: {
    groqApiKey: process.env.GROQ_API_KEY || "",
    model: process.env.AI_MODEL || "qwen/qwen3.8-27b",
  },
};

module.exports = config;

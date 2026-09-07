const express = require("express");
const config = require("./config");
const pool = require("./db/db");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "API is running",
  });
});

app.get("/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT current_database()");

    res.json({
      message: "Database connected successfully",
      database: result.rows[0].current_database,
    });
  } catch (error) {
    console.error("Database connection error:", error);

    res.status(500).json({
      message: "Database connection failed",
    });
  }
});

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});

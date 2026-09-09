const fs = require("fs");
const path = require("path");
const pool = require("./db");

const seedDatabase = async () => {
  console.log("Seeding database from seed.sql...");

  try {
    const seedSqlPath = path.join(__dirname, "seed.sql");
    const seedQuery = fs.readFileSync(seedSqlPath, "utf8");

    await pool.query(seedQuery);

    console.log("Seed completed successfully!");
    console.log("Sample credentials created:");
    console.log("Email: demo@example.com");
    console.log("Password: Password123!\n");
    console.log("Secondary test user:");
    console.log("Email: sarah.connor@example.com");
    console.log("Password: Password123!");
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
};

seedDatabase();

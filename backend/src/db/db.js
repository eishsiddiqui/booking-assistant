const { Pool, types } = require("pg");
const config = require("../config");

// Return PostgreSQL DATE (OID 1082) as raw string 'YYYY-MM-DD' instead of JS Date object
types.setTypeParser(1082, (val) => val);

const pool = new Pool({
  host: config.database.host,
  port: config.database.port,
  database: config.database.name,
  user: config.database.user,
  password: config.database.password,
});

module.exports = pool;

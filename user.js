const { Client } = require("pg");

// konfigurasi koneksi ke database
const client = new Client({
  user: process.env.PGUSER || "postgres",
  host: process.env.PGHOST || "localhost",
  database: process.env.PGDATABASE || "timesheetDB",
  password: process.env.PGPASSWORD || "root",
  port: process.env.PGPORT || 5432,
  ssl: process.env.PGSSLMODE === "require" ? { rejectUnauthorized: false } : false,
});

module.exports = client;

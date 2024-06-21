const { Client } = require("pg");

// konfigurasi koneksi ke database
const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "timesheetDB",
  password: "root",
  port: 5432,
});

module.exports = client;

const { Client } = require("pg");
require("dotenv").config(); // Memuat variabel lingkungan dari .env

// konfigurasi koneksi ke database menggunakan DATABASE_URL
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSLMODE === "require" ? { rejectUnauthorized: false } : false,
});

module.exports = client;

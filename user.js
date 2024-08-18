require("dotenv").config(); // Memuat variabel lingkungan dari .env
const { Client } = require("pg");

// konfigurasi koneksi ke database menggunakan DATABASE_URL
const client = new Client({
  connectionString: process.env.POSTGRES_URL,
});

module.exports = client;

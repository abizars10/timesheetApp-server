const express = require("express");
const cors = require("cors");
const client = require("./user");

const app = express();
const port = process.env.PORT || 3000;

// Menggunakan built-in middleware untuk parsing body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// Menjalankan server pada port
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// Fungsi untuk menghubungkan ke database
const connectToDB = async () => {
  try {
    await client.connect();
    console.log("Connected to database");
  } catch (err) {
    console.error("Error connecting to database: ", err);
  }
};

// Memanggil fungsi penghubung DB
connectToDB();

app.get("/", (req, res) => {
  res.send("Selamat datang di API Timesheet!");
});

// CRUD Kegiatan
// Mengambil database
app.get("/kegiatan", (req, res) => {
  client.query("SELECT * FROM kegiatan", (err, result) => {
    if (!err) {
      res.send(result.rows);
    } else {
      res.status(500).send(err.message);
    }
  });
});

// Menambahkan database
app.post("/kegiatan", (req, res) => {
  const { judul, proyek, tgl_mulai, tgl_berakhir, waktu_mulai, waktu_berakhir, durasi, id_karyawan } = req.body;
  const query = `
    INSERT INTO kegiatan(judul, proyek, tgl_mulai, tgl_berakhir, waktu_mulai, waktu_berakhir, durasi, id_karyawan)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
  `;
  const values = [judul, proyek, tgl_mulai, tgl_berakhir, waktu_mulai, waktu_berakhir, durasi, id_karyawan];

  client.query(query, values, (err, result) => {
    if (!err) {
      res.status(201).send(result.rows[0]);
    } else {
      res.status(500).send(err.message);
    }
  });
});

// Menghapus database
app.delete("/kegiatan/:id", (req, res) => {
  client.query("DELETE FROM kegiatan WHERE id = $1", [req.params.id], (err, result) => {
    if (!err) {
      if (result.rowCount > 0) {
        res.send("Database deleted successfully");
      } else {
        res.status(404).send("Data tidak ditemukan");
      }
    } else {
      res.status(500).send(err.message);
    }
  });
});

// Memperbarui database
app.put("/kegiatan/:id", (req, res) => {
  const { judul, proyek, tgl_mulai, tgl_berakhir, waktu_mulai, waktu_berakhir, durasi, id_karyawan } = req.body;

  const query = `
    UPDATE kegiatan
    SET judul = $1, proyek = $2, tgl_mulai = $3, tgl_berakhir = $4, 
        waktu_mulai = $5, waktu_berakhir = $6, durasi = $7, id_karyawan = $8
    WHERE id = $9
  `;

  const values = [judul, proyek, tgl_mulai, tgl_berakhir, waktu_mulai, waktu_berakhir, durasi, id_karyawan, req.params.id];

  client.query(query, values, (err, result) => {
    if (err) {
      console.error("Error updating database:", err);
      return res.status(500).send({ message: "Terjadi kesalahan saat memperbarui database", error: err.message });
    }

    if (result.rowCount === 0) {
      // Jika tidak ada baris yang diperbarui, artinya ID tidak ditemukan
      return res.status(404).send({ message: "Data tidak ditemukan" });
    }

    res.status(200).send({ message: "Database updated successfully" });
  });
});

// CRUD Karyawan
// Mengambil database
app.get("/karyawan", async (req, res) => {
  try {
    const karyawanResult = await client.query("SELECT * FROM karyawan");
    const karyawan = karyawanResult.rows;

    const kegiatanPromises = karyawan.map(async (karyawan) => {
      const kegiatanResult = await client.query("SELECT * FROM kegiatan WHERE id_karyawan = $1", [karyawan.id]);
      return {
        ...karyawan,
        kegiatan: kegiatanResult.rows,
      };
    });

    const karyawanWithKegiatan = await Promise.all(kegiatanPromises);
    res.json(karyawanWithKegiatan);
  } catch (err) {
    console.error(err);
    res.status(500).send("Terjadi kesalahan pada server");
  }
});

// Menambahkan database
app.post("/karyawan", (req, res) => {
  const { nama, rate } = req.body;

  client.query("INSERT INTO karyawan(nama, rate) VALUES ($1, $2) RETURNING *", [nama, rate], (err, result) => {
    if (!err) {
      res.status(201).send(result.rows[0]);
    } else {
      res.status(500).send(err.message);
    }
  });
});

// Menghapus karyawan dan kegiatan terkait
app.delete("/karyawan/:id", async (req, res) => {
  const karyawanId = req.params.id;

  try {
    await client.query("BEGIN");
    await client.query("DELETE FROM kegiatan WHERE id_karyawan = $1", [karyawanId]);
    const result = await client.query("DELETE FROM karyawan WHERE id = $1 RETURNING *", [karyawanId]);
    await client.query("COMMIT");

    if (result.rowCount === 0) {
      return res.status(404).send({ message: "Karyawan tidak ditemukan" });
    }

    res.status(200).send({ message: "Karyawan dan kegiatan terkait berhasil dihapus" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error saat menghapus karyawan dan kegiatan:", err);
    res.status(500).send({ error: "Terjadi kesalahan internal" });
  }
});

// CRUD Proyek
// Mengambil database
app.get("/proyek", (req, res) => {
  client.query("SELECT * FROM proyek", (err, result) => {
    if (!err) {
      res.send(result.rows);
    } else {
      res.status(500).send(err.message);
    }
  });
});

// Menambahkan database
app.post("/proyek", (req, res) => {
  const { nama_proyek } = req.body;

  client.query("INSERT INTO proyek(nama_proyek) VALUES ($1) RETURNING *", [nama_proyek], (err, result) => {
    if (!err) {
      res.status(201).send(result.rows[0]);
    } else {
      res.status(500).send(err.message);
    }
  });
});

// Menghapus database
app.delete("/proyek/:id", (req, res) => {
  client.query("DELETE FROM proyek WHERE id = $1", [req.params.id], (err, result) => {
    if (!err) {
      if (result.rowCount > 0) {
        res.send("Database deleted successfully");
      } else {
        res.status(404).send("Data tidak ditemukan");
      }
    } else {
      res.status(500).send(err.message);
    }
  });
});

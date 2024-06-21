const express = require("express");
const cors = require("cors");
const client = require("./user");

const app = express();
const port = 3000;

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

// Mengambil database
app.get("/kegiatan", (req, res) => {
  client.query(`select * from kegiatan`, (err, result) => {
    if (!err) {
      res.send(result.rows);
    }
  });
});

// Menambahkan database
app.post("/kegiatan", (req, res) => {
  const { judul, proyek, tgl_mulai, tgl_berakhir, waktu_mulai, waktu_berakhir, durasi } = req.body;

  client.query(
    `insert into kegiatan(judul, proyek, tgl_mulai, tgl_berakhir, waktu_mulai, waktu_berakhir, durasi) values ('${judul}', '${proyek}', '${tgl_mulai}', '${tgl_berakhir}', '${waktu_mulai}', '${waktu_berakhir}', '${durasi}')`,
    (err, result) => {
      !err ? res.send("Database added successfully") : res.send(err.message);
    }
  );
});

// Menghapus database
app.delete("/kegiatan/:id", (req, res) => {
  client.query(`delete from kegiatan where id = ${req.params.id}`, (err, result) => {
    !err ? res.send("Database deleted successfully") : res.send(err.message);
  });
});

// Memperbarui database
app.put("/kegiatan/:id", (req, res) => {
  const { judul, proyek, tgl_mulai, tgl_berakhir, waktu_mulai, waktu_berakhir, durasi } = req.body;

  client.query(
    `update kegiatan set judul = '${judul}', proyek = '${proyek}', tgl_mulai = '${tgl_mulai}', tgl_berakhir = '${tgl_berakhir}', waktu_mulai = '${waktu_mulai}', waktu_berakhir = '${waktu_berakhir}', durasi = '${durasi}' where id = '${req.params.id}'`,
    (err, result) => {
      !err ? res.send("Database updated successfully") : res.send(err.message);
    }
  );
});

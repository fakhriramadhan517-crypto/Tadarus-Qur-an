const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const PROGRESS_FILE = path.join(__dirname, 'progress.json');

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

// Inisialisasi file progress.json jika belum ada
if (!fs.existsSync(PROGRESS_FILE)) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify({}));
}

// Endpoint untuk menyimpan progres
app.post('/save-progress', (req, res) => {
  console.log("Data diterima:", req.body); // DEBUG
  const { username, surat, halaman, juz, tanggal } = req.body;
  if (!username || !surat || !halaman || !juz || !tanggal) {
    return res.status(400).json({ error: 'Data tidak lengkap' });
  }

  let data = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
  if (!data[username]) data[username] = [];
  data[username].push({ surat, halaman, juz, tanggal });

  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(data, null, 2));
  res.json({ message: 'Progres berhasil disimpan' });
});

// Endpoint untuk mendapatkan semua progres (admin)
app.get('/get-progress', (req, res) => {
  const data = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
  res.json(data);
});

// Endpoint untuk mendapatkan progres user tertentu
app.get('/get-progress/:username', (req, res) => {
  const username = req.params.username;
  const data = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
  res.json(data[username] || []);
});

// Endpoint untuk reset semua progres (admin)
app.post('/reset-progress', (req, res) => {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify({}));
  res.json({ message: 'Semua progres berhasil direset' });
});

// Endpoint untuk hapus progres user tertentu (admin)
app.delete('/delete-progress/:username', (req, res) => {
  const username = req.params.username;
  let data = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
  if (data[username]) {
    delete data[username];
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(data, null, 2));
    res.json({ message: `Progres untuk ${username} dihapus` });
  } else {
    res.status(404).json({ error: 'User tidak ditemukan' });
  }
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
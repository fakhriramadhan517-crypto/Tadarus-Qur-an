const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
const nodemailer = require('nodemailer'); // Opsional untuk email

const app = express();
const PORT = 3000;
const PROGRESS_FILE = path.join(__dirname, 'progress.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.')); // Serve static files (CSS, JS, HTML)

// WebSocket server
const wss = new WebSocket.Server({ port: 8080 });
wss.on('connection', (ws) => {
  console.log('Client connected');
});

// Route untuk halaman utama
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Inisialisasi file progress.json
if (!fs.existsSync(PROGRESS_FILE)) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify({}));
}

// Endpoint untuk menyimpan progres
app.post('/save-progress', (req, res) => {
  const { username, surat, halaman, juz, tanggal } = req.body;
  if (!username || !surat || !halaman || !juz || !tanggal) {
    return res.status(400).json({ error: 'Data tidak lengkap' });
  }

  let data = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
  if (!data[username]) data[username] = [];
  data[username].push({ surat, halaman, juz, tanggal });

  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(data, null, 2));

  // Kirim notifikasi ke admin via WebSocket
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'progress_saved', message: `Progres baru dari ${username}: ${surat}, Juz ${juz}` }));
    }
  });

  // Opsional: Kirim email ke admin (aktifkan jika perlu)
  // const transporter = nodemailer.createTransporter({ /* config */ });
  // transporter.sendMail({ /* email details */ });

  console.log(`Progres disimpan dan dikirim ke admin: ${username} - ${surat}`);
  res.json({ message: 'Progres berhasil disimpan' });
});

// Endpoint untuk mendapatkan riwayat (untuk admin)
app.get('/get-progress', (req, res) => {
  const data = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
  res.json(data);
});

// Endpoint untuk mendapatkan riwayat pengguna tertentu
app.get('/get-progress/:username', (req, res) => {
  const username = req.params.username;
  const data = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
  res.json(data[username] || []);
});

// Endpoint untuk reset seluruh data progres (hanya untuk admin)
app.post('/reset-progress', (req, res) => {
  // Reset file progress.json ke kosong
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify({}));
  res.json({ message: 'Semua data progres berhasil direset' });
});

// Endpoint untuk hapus data progres per pengguna (hanya untuk admin)
app.delete('/delete-progress/:username', (req, res) => {
  const username = req.params.username;
  let data = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
  if (data[username]) {
    delete data[username];
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(data, null, 2));
    res.json({ message: `Data progres untuk ${username} berhasil dihapus` });
  } else {
    res.status(404).json({ error: 'Pengguna tidak ditemukan' });
  }
});
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
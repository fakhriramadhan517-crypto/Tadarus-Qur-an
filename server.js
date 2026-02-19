const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const app = express();
const PORT = 3000;
const PROGRESS_FILE = path.join(__dirname, 'progress.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.')); // Serve static files (CSS, JS, HTML)

// Inisialisasi file progress.json
if (!fs.existsSync(PROGRESS_FILE)) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify({}));
}

// Endpoint halaman utama
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint simpan progres
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
      client.send(JSON.stringify({
        type: 'progress_saved',
        message: `Progres baru dari ${username}: ${surat}, Halaman ${halaman}, Juz ${juz}`
      }));
    }
  });

  console.log(`Progres disimpan: ${username} - ${surat}`);
  res.json({ message: 'Progres berhasil disimpan' });
});

// Endpoint ambil semua progres (admin)
app.get('/get-progress', (req, res) => {
  const data = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
  res.json(data);
});

// Endpoint ambil progres user tertentu
app.get('/get-progress/:username', (req, res) => {
  const username = req.params.username;
  const data = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
  res.json(data[username] || []);
});

// Endpoint reset semua progres
app.post('/reset-progress', (req, res) => {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify({}));
  res.json({ message: 'Semua data progres berhasil direset' });
});

// Endpoint hapus progres user tertentu
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

// Jalankan server HTTP + WebSocket
const server = app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});

const wss = new WebSocket.Server({ server });
wss.on('connection', (ws) => {
  console.log('Client WebSocket connected');
});
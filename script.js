// Proteksi halaman user
if (window.location.pathname.includes('user.html')) {
  const user = localStorage.getItem('user');
  if (!user) {
    alert('Silakan login terlebih dahulu');
    window.location.href = 'index.html';
  }
}

// WebSocket untuk notifikasi real-time
const ws = new WebSocket('ws://localhost:3000');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'progress_saved') {
    if (window.location.pathname.includes('admin.html')) {
      document.getElementById('notifications').innerHTML += `<p>Notifikasi: ${data.message}</p>`;
      loadAllProgress(); // Reload data admin
    }
  }
};

// Login logic
document.getElementById('loginForm')?.addEventListener('submit', function(e) {
  e.preventDefault();

  // Ambil input dari form
  const username = document.getElementById('username').value.trim().toLowerCase();
  const password = document.getElementById('password').value.trim();
  const error = document.getElementById('error');

    // Daftar user & password (semua username disamakan lowercase)
  const users = {
    admin: 'Admin123',
    dea: 'dea123',
    mutia: 'mutia123',
    delvina: 'vina123',
    khailana: 'kila123', 
    niken: 'niken123',  
    welmita: 'wel123',
    sulthan: 'sultan123',
    selvina: 'selvina123',
    pia: 'pia123',
    yuni: 'yuni123',
    asra: 'asra123',
    salsabila: 'salsa123',
    mardatila: 'tila123',
  };

    // Cek login
  if (users[username] && users[username] === password) {
    localStorage.setItem('user', username);
    if (username === 'admin') {
      window.location.href = 'admin.html';
    } else {
      window.location.href = 'user.html';
    }
  } else {
    error.textContent = 'Username atau password salah';
  }
});

document.getElementById('resetAllBtn')?.addEventListener('click', function() {
  if (confirm('Apakah Anda yakin ingin mereset semua data progres? Tindakan ini tidak dapat dibatalkan.')) {
    resetAllProgress();
  }
});

// Progress form logic (untuk user.html)
document.getElementById('progressForm')?.addEventListener('submit', async function (e) {
  e.preventDefault();

  const username = localStorage.getItem('user');
  if (!username) {
    alert('User belum login');
    return;
  }

  const surat = document.getElementById('surat').value;
  const halaman = Number(document.getElementById('halaman').value);
  const juz = Number(document.getElementById('juz').value);
  const tanggal = new Date().toISOString();

  if (!surat || halaman < 1 || halaman > 604 || juz < 1 || juz > 30) {
    alert('Input tidak valid');
    return;
  }

  try {
    const response = await fetch('/save-progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, surat, halaman, juz, tanggal })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(err);
    }

    alert('Progres berhasil disimpan');
    loadUserProgress();
    this.reset();

  } catch (err) {
    alert('Gagal menyimpan progres: ' + err.message);
  }
});


// Load progres untuk pengguna
async function loadUserProgress() {
  const username = localStorage.getItem('user');
  const response = await fetch(`/get-progress/${username}`);
  const data = await response.json();

  if (data.length > 0) {
    const latest = data[data.length - 1];
    document.getElementById('latestProgress').innerHTML = `
      <p>Surat: ${latest.surat}, Halaman: ${latest.halaman}, Juz: ${latest.juz}</p>
    `;

    // Hitung statistik surat dan juz yang sudah dibaca
    const surahs = new Set(data.map(item => item.surat));
    const juzs = new Set(data.map(item => item.juz));
    document.getElementById('readSurahs').textContent = Array.from(surahs).join(', ');
    document.getElementById('readJuzs').textContent = Array.from(juzs).join(', ');
    document.getElementById('totalSurahs').textContent = surahs.size;
    document.getElementById('totalJuzs').textContent = juzs.size;

    const tbody = document.querySelector('#historyTable tbody');
      tbody.innerHTML += `
<tr>
  <td>${new Date(item.tanggal).toLocaleString('id-ID')}</td>
  <td>${item.surat}</td>
  <td>${item.halaman}</td>
  <td>${item.juz}</td>
</tr>`;
}};
  


// Load semua progres untuk admin
async function loadAllProgress() {
  const response = await fetch('/get-progress');
  const data = await response.json();
  const container = document.getElementById('allProgress');
  container.innerHTML = '';
  for (const [user, progresses] of Object.entries(data)) {
    container.innerHTML += `<h3>${user}</h3>`;
    if (progresses.length > 0) {
      container.innerHTML += '<table><thead><tr><th>Tanggal</th><th>Surat</th><th>Halaman</th><th>Juz</th></tr></thead><tbody>';
      progresses.forEach(item => {
        container.innerHTML += `<tr><td>${item.tanggal}</td><td>${item.surat}</td><td>${item.halaman}</td><td>${item.juz}</td></tr>`;
      });
      container.innerHTML += '</tbody></table>';
    }
  }
}

// Logout
function logout() {
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}

// Load data saat halaman dimuat
if (window.location.pathname.includes('user.html')) {
  loadUserProgress();
} else if (window.location.pathname.includes('admin.html')) {
  loadAllProgress();
}
async function resetAllProgress() {
  const response = await fetch('/reset-progress', { method: 'POST' });
  if (response.ok) {
    alert('Semua progres berhasil direset');
    loadAllProgress();
  }
}
ws.onopen = () => console.log('WebSocket connected');
ws.onerror = (e) => console.error('WebSocket error', e);

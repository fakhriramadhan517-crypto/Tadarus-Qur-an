// Event listener untuk form user
document.getElementById('progressForm')?.addEventListener('submit', async function(e) {
  e.preventDefault();
  console.log("Form disubmit"); // DEBUG


  // Event listener untuk form login
document.getElementById('loginForm')?.addEventListener('submit', function(e) {
  e.preventDefault();

  const username = document.getElementById('username').value.trim().toLowerCase();
  const password = document.getElementById('password').value.trim();
  const error = document.getElementById('error');

  // Daftar user & password (semua username lowercase)
  const users = {
    admin: 'Admin123',
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
    dea: 'dea123',
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
  const username = localStorage.getItem('user');
  const surat = document.getElementById('surat').value;
  const halaman = parseInt(document.getElementById('halaman').value);
  const juz = parseInt(document.getElementById('juz').value);
  const tanggal = new Date().toISOString();

  if (juz < 1 || juz > 30 || halaman < 1 || halaman > 604) {
    alert('Input tidak valid!');
    return;
  }

  try {
    const response = await fetch('/save-progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, surat, halaman, juz, tanggal })
    });

    if (response.ok) {
      alert('Progres berhasil disimpan!');
      loadUserProgress();
    } else {
      alert('Gagal menyimpan progres');
    }
  } catch (err) {
    console.error("Error saat simpan progres:", err);
    alert('Terjadi error saat menyimpan progres');
  }
});

// Load progres user
async function loadUserProgress() {
  const username = localStorage.getItem('user');
  const response = await fetch(`/get-progress/${username}`);
  const data = await response.json();

  if (data.length > 0) {
    const latest = data[data.length - 1];
    document.getElementById('latestProgress').innerHTML =
      `<p>Surat: ${latest.surat}, Halaman: ${latest.halaman}, Juz: ${latest.juz}</p>`;

    const tbody = document.querySelector('#historyTable tbody');
    tbody.innerHTML = '';
    data.forEach(item => {
      tbody.innerHTML += `<tr><td>${item.tanggal}</td><td>${item.surat}</td><td>${item.halaman}</td><td>${item.juz}</td></tr>`;
    });
  }
}

// Load semua progres untuk admin
async function loadAllProgress() {
  const response = await fetch('/get-progress');
  const data = await response.json();

  const container = document.getElementById('allProgress');
  container.innerHTML = '';
  for (const [user, progresses] of Object.entries(data)) {
    container.innerHTML += `<h3>${user}</h3>`;
    if (progresses.length > 0) {
      container.innerHTML += `<button class="deleteBtn" data-user="${user}">Hapus Data ${user}</button>`;
      container.innerHTML += '<table><thead><tr><th>Tanggal</th><th>Surat</th><th>Halaman</th><th>Juz</th></tr></thead><tbody>';
      progresses.forEach(item => {
        container.innerHTML += `<tr><td>${item.tanggal}</td><td>${item.surat}</td><td>${item.halaman}</td><td>${item.juz}</td></tr>`;
      });
      container.innerHTML += '</tbody></table>';
    } else {
      container.innerHTML += '<p>Tidak ada data progres.</p>';
    }
  }

  document.querySelectorAll('.deleteBtn').forEach(btn => {
    btn.addEventListener('click', async function() {
      const user = this.getAttribute('data-user');
      if (confirm(`Apakah Anda yakin ingin menghapus data progres untuk ${user}?`)) {
        await deleteUserProgress(user);
      }
    });
  });
}

// Reset semua progres
document.getElementById('resetAllBtn')?.addEventListener('click', async function() {
  if (confirm('Apakah Anda yakin ingin mereset semua data progres?')) {
    const response = await fetch('/reset-progress', { method: 'POST' });
    if (response.ok) {
      alert('Semua data progres berhasil direset!');
      loadAllProgress();
    } else {
      alert('Gagal mereset data');
    }
  }
});

// Hapus progres user
async function deleteUserProgress(username) {
  const response = await fetch(`/delete-progress/${username}`, { method: 'DELETE' });
  if (response.ok) {
    alert(`Data progres untuk ${username} berhasil dihapus!`);
    loadAllProgress();
  } else {
    alert('Gagal menghapus data');
  }
}

// Logout
function logout() {
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}

// Load data sesuai halaman
if (window.location.pathname.includes('user.html')) {
  loadUserProgress();
} else if (window.location.pathname.includes('admin.html')) {
  loadAllProgress();
}
// ====== AUTH ======
if (location.pathname.includes('user.html')) {
  if (!localStorage.getItem('user')) {
    alert('Silakan login');
    location.href = 'index.html';
  }
}

// ====== LOGIN ======
document.getElementById('loginForm')?.addEventListener('submit', (e) => {
  e.preventDefault();

  const u = document.getElementById('username').value.trim().toLowerCase();
  const p = document.getElementById('password').value.trim();
  const err = document.getElementById('error');

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
    mardatila: 'tila123'
  };

  if (users[u] === p) {
    localStorage.setItem('user', u);
    location.href = (u === 'admin') ? 'admin.html' : 'user.html';
  } else {
    err.textContent = 'Username atau password salah';
  }
});

// ====== SIMPAN PROGRES (GITHUB) ======
document.getElementById('progressForm')?.addEventListener('submit', (e) => {
  e.preventDefault();

  const user = localStorage.getItem('user');
  if (!user) return alert('Belum login');

  const suratEl = document.getElementById('surat');
  const halamanEl = document.getElementById('halaman');
  const juzEl = document.getElementById('juz');

  if (!suratEl || !halamanEl || !juzEl) {
    return alert('Form tidak lengkap');
  }

  const store = JSON.parse(localStorage.getItem('progressData') || '{}');
  if (!store[user]) store[user] = [];

  store[user].push({
    surat: suratEl.value,
    halaman: Number(halamanEl.value),
    juz: Number(juzEl.value),
    tanggal: new Date().toLocaleString('id-ID')
  });

  localStorage.setItem('progressData', JSON.stringify(store));
  alert('Progres tersimpan');

  loadUserProgress();
  e.target.reset();
});

// ====== LOAD USER ======
function loadUserProgress() {
  const user = localStorage.getItem('user');
  const store = JSON.parse(localStorage.getItem('progressData') || '{}');
  const list = store[user] || [];
  if (!list.length) return;

  const last = list[list.length - 1];
  const latest = document.getElementById('latestProgress');
  if (latest) {
    latest.innerHTML = `<p>${last.surat} | Hal ${last.halaman} | Juz ${last.juz}</p>`;
  }

  const tbody = document.querySelector('#historyTable tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  list.forEach(item => {
    tbody.innerHTML += `
      <tr>
        <td>${item.tanggal}</td>
        <td>${item.surat}</td>
        <td>${item.halaman}</td>
        <td>${item.juz}</td>
      </tr>`;
  });

  const surahs = [...new Set(list.map(i => i.surat))];
  const juzs = [...new Set(list.map(i => i.juz))];

  document.getElementById('readSurahs').textContent = surahs.join(', ');
  document.getElementById('readJuzs').textContent = juzs.join(', ');
  document.getElementById('totalSurahs').textContent = surahs.length;
  document.getElementById('totalJuzs').textContent = juzs.length;
}

// ====== ADMIN ======
function loadAllProgress() {
  const store = JSON.parse(localStorage.getItem('progressData') || '{}');
  const box = document.getElementById('allProgress');
  if (!box) return;

  box.innerHTML = '';
  Object.keys(store).forEach(u => {
    box.innerHTML += `<h3>${u}</h3>`;
    store[u].forEach(i => {
      box.innerHTML += `<p>${i.tanggal} — ${i.surat} (Hal ${i.halaman}, Juz ${i.juz})</p>`;
    });
  });
}

document.getElementById('resetAllBtn')?.addEventListener('click', () => {
  if (confirm('Reset semua progres?')) {
    localStorage.removeItem('progressData');
    loadAllProgress();
  }
});

// ====== INIT ======
if (location.pathname.includes('user.html')) loadUserProgress();
if (location.pathname.includes('admin.html')) loadAllProgress();

function logout() {
  localStorage.removeItem('user');
  location.href = 'index.html';
}
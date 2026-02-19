// ================== AUTH ==================
if (location.pathname.includes('user.html')) {
  if (!localStorage.getItem('user')) {
    alert('Silakan login');
    location.href = 'index.html';
  }
}

// ================== LOGIN ==================
document.getElementById('loginForm')?.addEventListener('submit', e => {
  e.preventDefault();

  const u = username.value.trim().toLowerCase();
  const p = password.value.trim();

  const users = {
    admin: 'Admin123',
    dea: 'dea123',
    mutia: 'mutia123',
    delvina: 'vina123',
    khailana: 'kila123',
    niken: 'niken123'
  };

  if (users[u] === p) {
    localStorage.setItem('user', u);
    location.href = u === 'admin' ? 'admin.html' : 'user.html';
  } else {
    error.textContent = 'Username atau password salah';
  }
});

// ================== SIMPAN PROGRES ==================
document.getElementById('progressForm')?.addEventListener('submit', e => {
  e.preventDefault();

  const user = localStorage.getItem('user');
  const allData = JSON.parse(localStorage.getItem('progressData')) || {};

  if (!allData[user]) allData[user] = [];

  allData[user].push({
    surat: surat.value,
    halaman: halaman.value,
    juz: juz.value,
    tanggal: new Date().toLocaleString('id-ID')
  });

  localStorage.setItem('progressData', JSON.stringify(allData));

  alert('Progres tersimpan');
  loadUserProgress();
  e.target.reset();
});

// ================== LOAD USER ==================
function loadUserProgress() {
  const user = localStorage.getItem('user');
  const allData = JSON.parse(localStorage.getItem('progressData')) || {};
  const data = allData[user] || [];

  if (!data.length) return;

  const last = data[data.length - 1];
  latestProgress.innerHTML = `
    <p>${last.surat} | Hal ${last.halaman} | Juz ${last.juz}</p>
  `;

  const tbody = document.querySelector('#historyTable tbody');
  tbody.innerHTML = '';

  data.forEach(item => {
    tbody.innerHTML += `
      <tr>
        <td>${item.tanggal}</td>
        <td>${item.surat}</td>
        <td>${item.halaman}</td>
        <td>${item.juz}</td>
      </tr>`;
  });

  const surahs = [...new Set(data.map(i => i.surat))];
  const juzs = [...new Set(data.map(i => i.juz))];

  readSurahs.textContent = surahs.join(', ');
  readJuzs.textContent = juzs.join(', ');
  totalSurahs.textContent = surahs.length;
  totalJuzs.textContent = juzs.length;
}

// ================== ADMIN ==================
function loadAllProgress() {
  const allData = JSON.parse(localStorage.getItem('progressData')) || {};
  allProgress.innerHTML = '';

  for (const user in allData) {
    allProgress.innerHTML += `<h3>${user}</h3>`;
    allData[user].forEach(i => {
      allProgress.innerHTML += `
        <p>${i.tanggal} — ${i.surat} (Hal ${i.halaman}, Juz ${i.juz})</p>`;
    });
  }
}

document.getElementById('resetAllBtn')?.addEventListener('click', () => {
  if (confirm('Reset semua progres?')) {
    localStorage.removeItem('progressData');
    loadAllProgress();
  }
});

// ================== LOGOUT ==================
function logout() {
  localStorage.removeItem('user');
  location.href = 'index.html';
}

// ================== INIT ==================
if (location.pathname.includes('user.html')) loadUserProgress();
if (location.pathname.includes('admin.html')) loadAllProgress();

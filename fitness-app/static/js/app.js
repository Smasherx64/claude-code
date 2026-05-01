/** Main application logic */

let currentPatient = null;
let allPatients = [];
let liveCalcTimer = null;

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  Avatar.init('avatar-container');
  window.addEventListener('resize', Avatar.resize);
  loadPatients();
  Avatar.updateShape({ fatPct: 15, sex: 'M', weight: 70, height: 170 });
});

// ===== VIEWS =====
function showView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('view-' + name).classList.add('active');
  document.getElementById('nav-' + name).classList.add('active');

  if (name === 'evolution' && currentPatient) loadEvolution(currentPatient.id);
}

// ===== PATIENTS =====
async function loadPatients() {
  const res = await fetch('/api/patients');
  allPatients = await res.json();
  renderPatients(allPatients);
}

function renderPatients(list) {
  const el = document.getElementById('patients-list');
  if (!list.length) {
    el.innerHTML = '<p class="empty-state">Nenhum paciente cadastrado. Clique em "+ Novo Paciente".</p>';
    return;
  }
  el.innerHTML = list.map(p => {
    const age = p.birth_date ? calcAge(p.birth_date) : '–';
    const initials = p.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
    const count = p.assessment_count || 0;
    return `
    <div class="patient-card" onclick="selectPatient(${p.id})">
      <div class="patient-card-header">
        <div class="patient-avatar-icon">${initials}</div>
        <div class="patient-actions">
          <button class="btn-icon" onclick="editPatient(event, ${p.id})" title="Editar">✏️</button>
          <button class="btn-icon danger" onclick="confirmDeletePatient(event, ${p.id})" title="Excluir">🗑️</button>
        </div>
      </div>
      <div class="patient-name">${p.name}</div>
      <div class="patient-info">
        <span>${p.sex === 'M' ? '♂ Masculino' : '♀ Feminino'}</span>
        <span>${age !== '–' ? age + ' anos' : ''}</span>
      </div>
      ${count > 0 ? `<div class="tag">${count} avaliação${count !== 1 ? 'ões' : ''}</div>` : ''}
    </div>`;
  }).join('');
}

function filterPatients() {
  const q = document.getElementById('patient-search').value.toLowerCase();
  renderPatients(allPatients.filter(p => p.name.toLowerCase().includes(q)));
}

async function selectPatient(pid) {
  currentPatient = await (await fetch(`/api/patients/${pid}`)).json();
  document.getElementById('assess-patient-name').textContent = currentPatient.name;
  document.getElementById('evol-patient-name').textContent = currentPatient.name;
  showView('assess');
  clearForm();

  // Load last assessment to pre-populate avatar
  const assessments = await (await fetch(`/api/patients/${pid}/assessments`)).json();
  if (assessments.length) {
    const last = assessments[0];
    populateForm(last);
    updateAvatarFromResults(last.results, last.weight_kg, last.height_cm, currentPatient.sex);
  }
}

// ===== PATIENT MODAL =====
function openNewPatient() {
  document.getElementById('mp-id').value = '';
  document.getElementById('mp-name').value = '';
  document.getElementById('mp-birth').value = '';
  document.getElementById('mp-sex').value = 'M';
  document.getElementById('mp-email').value = '';
  document.getElementById('mp-phone').value = '';
  document.getElementById('modal-patient-title').textContent = 'Novo Paciente';
  document.getElementById('modal-patient').style.display = 'flex';
  setTimeout(() => document.getElementById('mp-name').focus(), 50);
}

async function editPatient(e, pid) {
  e.stopPropagation();
  const p = await (await fetch(`/api/patients/${pid}`)).json();
  document.getElementById('mp-id').value = p.id;
  document.getElementById('mp-name').value = p.name;
  document.getElementById('mp-birth').value = p.birth_date || '';
  document.getElementById('mp-sex').value = p.sex;
  document.getElementById('mp-email').value = p.email || '';
  document.getElementById('mp-phone').value = p.phone || '';
  document.getElementById('modal-patient-title').textContent = 'Editar Paciente';
  document.getElementById('modal-patient').style.display = 'flex';
}

function closePatientModal(e) {
  if (e && e.target !== document.getElementById('modal-patient')) return;
  document.getElementById('modal-patient').style.display = 'none';
}

async function submitPatient() {
  const name = document.getElementById('mp-name').value.trim();
  const birth = document.getElementById('mp-birth').value;
  if (!name) { showToast('Nome é obrigatório', 'error'); return; }
  if (!birth) { showToast('Data de nascimento é obrigatória', 'error'); return; }

  const data = {
    id: document.getElementById('mp-id').value || null,
    name,
    birth_date: birth,
    sex: document.getElementById('mp-sex').value,
    email: document.getElementById('mp-email').value,
    phone: document.getElementById('mp-phone').value,
  };
  const method = data.id ? 'PUT' : 'POST';
  const url = data.id ? `/api/patients/${data.id}` : '/api/patients';
  await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  document.getElementById('modal-patient').style.display = 'none';
  showToast('Paciente salvo com sucesso!', 'success');
  loadPatients();
}

async function confirmDeletePatient(e, pid) {
  e.stopPropagation();
  if (!confirm('Excluir este paciente e todas as avaliações? Esta ação não pode ser desfeita.')) return;
  await fetch(`/api/patients/${pid}`, { method: 'DELETE' });
  showToast('Paciente excluído', 'info');
  if (currentPatient && currentPatient.id === pid) currentPatient = null;
  loadPatients();
}

// ===== ASSESSMENT FORM =====
function clearForm() {
  const ids = ['f-weight', 'f-height', 'sf-chest', 'sf-midaxillary', 'sf-triceps',
    'sf-subscapular', 'sf-abdomen', 'sf-suprailiac', 'sf-thigh',
    'm-neck', 'm-shoulder', 'm-chest', 'm-waist', 'm-abdomen', 'm-hip', 'm-thigh', 'm-calf', 'm-arm', 'f-notes'];
  ids.forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  document.getElementById('results-panel').style.display = 'none';
  if (currentPatient) Avatar.updateShape({ fatPct: 15, sex: currentPatient.sex || 'M', weight: 70, height: 170 });
}

function populateForm(a) {
  if (a.weight_kg) document.getElementById('f-weight').value = a.weight_kg;
  if (a.height_cm) document.getElementById('f-height').value = a.height_cm;
  const sf = a.skinfolds || {};
  const sfMap = { 'sf-chest': 'chest', 'sf-midaxillary': 'midaxillary', 'sf-triceps': 'triceps',
    'sf-subscapular': 'subscapular', 'sf-abdomen': 'abdomen', 'sf-suprailiac': 'suprailiac', 'sf-thigh': 'thigh' };
  for (const [id, key] of Object.entries(sfMap)) {
    if (sf[key]) document.getElementById(id).value = sf[key];
  }
  const m = a.measurements || {};
  const mMap = { 'm-neck': 'neck', 'm-shoulder': 'shoulder', 'm-chest': 'chest',
    'm-waist': 'waist', 'm-abdomen': 'abdomen', 'm-hip': 'hip',
    'm-thigh': 'thigh', 'm-calf': 'calf', 'm-arm': 'arm' };
  for (const [id, key] of Object.entries(mMap)) {
    if (m[key]) document.getElementById(id).value = m[key];
  }
  if (a.notes) document.getElementById('f-notes').value = a.notes;
  if (a.results) renderResults(a.results);
}

function getFormData() {
  return {
    weight_kg: parseFloat(document.getElementById('f-weight').value) || null,
    height_cm: parseFloat(document.getElementById('f-height').value) || null,
    skinfolds: {
      chest: parseFloat(document.getElementById('sf-chest').value) || 0,
      midaxillary: parseFloat(document.getElementById('sf-midaxillary').value) || 0,
      triceps: parseFloat(document.getElementById('sf-triceps').value) || 0,
      subscapular: parseFloat(document.getElementById('sf-subscapular').value) || 0,
      abdomen: parseFloat(document.getElementById('sf-abdomen').value) || 0,
      suprailiac: parseFloat(document.getElementById('sf-suprailiac').value) || 0,
      thigh: parseFloat(document.getElementById('sf-thigh').value) || 0,
    },
    measurements: {
      neck: parseFloat(document.getElementById('m-neck').value) || 0,
      shoulder: parseFloat(document.getElementById('m-shoulder').value) || 0,
      chest: parseFloat(document.getElementById('m-chest').value) || 0,
      waist: parseFloat(document.getElementById('m-waist').value) || 0,
      abdomen: parseFloat(document.getElementById('m-abdomen').value) || 0,
      hip: parseFloat(document.getElementById('m-hip').value) || 0,
      thigh: parseFloat(document.getElementById('m-thigh').value) || 0,
      calf: parseFloat(document.getElementById('m-calf').value) || 0,
      arm: parseFloat(document.getElementById('m-arm').value) || 0,
    },
    notes: document.getElementById('f-notes').value,
  };
}

function liveCalculate() {
  clearTimeout(liveCalcTimer);
  liveCalcTimer = setTimeout(async () => {
    const fd = getFormData();
    const sf = fd.skinfolds;
    const filled = Object.values(sf).filter(v => v > 0).length;
    if (filled < 7) { updateAvatar(); return; }

    const sex = currentPatient ? currentPatient.sex : 'M';
    const age = currentPatient ? calcAge(currentPatient.birth_date) : 30;

    const body = { ...sf, weight_kg: fd.weight_kg, height_cm: fd.height_cm, sex, age };
    try {
      const res = await fetch('/api/calculate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
      });
      const results = await res.json();
      renderResults(results);
      updateAvatarFromResults(results, fd.weight_kg, fd.height_cm, sex, fd.measurements);
    } catch (e) { console.error(e); }
  }, 400);
}

function updateAvatar() {
  const fd = getFormData();
  const sex = currentPatient ? currentPatient.sex : 'M';
  const m = fd.measurements;
  Avatar.updateShape({
    fatPct: 15, sex,
    weight: fd.weight_kg || 70,
    height: fd.height_cm || 170,
    waist: m.waist, chest: m.chest, hip: m.hip,
    thigh: m.thigh, arm: m.arm, calf: m.calf, shoulder: m.shoulder,
  });
}

function updateAvatarFromResults(results, weight, height, sex, measurements = {}) {
  const m = measurements || {};
  Avatar.updateShape({
    fatPct: results.body_fat_pct || 15,
    sex: sex || 'M',
    weight: weight || 70,
    height: height || 170,
    waist: m.waist || 0, chest: m.chest || 0, hip: m.hip || 0,
    thigh: m.thigh || 0, arm: m.arm || 0, calf: m.calf || 0, shoulder: m.shoulder || 0,
  });
  document.getElementById('avatar-fat-label').textContent = (results.body_fat_pct || 0).toFixed(1) + '%';
}

function renderResults(r) {
  document.getElementById('results-panel').style.display = 'block';
  document.getElementById('r-fat').textContent = (r.body_fat_pct || 0).toFixed(1) + '%';
  document.getElementById('r-class').textContent = r.classification || '–';
  document.getElementById('r-sum7').textContent = (r.sum7 || 0) + ' mm';
  document.getElementById('r-fat-mass').textContent = r.fat_mass_kg ? r.fat_mass_kg + ' kg' : '–';
  document.getElementById('r-lean').textContent = r.lean_mass_kg ? r.lean_mass_kg + ' kg' : '–';
  document.getElementById('r-bmi').textContent = r.bmi || '–';
  document.getElementById('r-bmi-cat').textContent = r.category || '–';
  const ideal = r.ideal_weight;
  document.getElementById('r-ideal').textContent = ideal ? `${ideal.min}–${ideal.max} kg` : '–';

  // Fat bar marker position (3% to 45%)
  const fat = r.body_fat_pct || 15;
  const pct = Math.max(0, Math.min(100, (fat - 3) / 42 * 100));
  document.getElementById('fat-bar-marker').style.left = pct + '%';
}

async function saveAssessment() {
  if (!currentPatient) { showToast('Selecione um paciente primeiro', 'error'); return; }
  const fd = getFormData();
  const filled = Object.values(fd.skinfolds).filter(v => v > 0).length;
  if (filled < 7) { showToast('Preencha as 7 dobras cutâneas', 'error'); return; }
  if (!fd.weight_kg || !fd.height_cm) { showToast('Preencha peso e altura', 'error'); return; }

  const btn = document.getElementById('btn-save-assess');
  btn.textContent = 'Salvando...'; btn.disabled = true;

  try {
    const res = await fetch(`/api/patients/${currentPatient.id}/assessments`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(fd)
    });
    const data = await res.json();
    renderResults(data.results);
    updateAvatarFromResults(data.results, fd.weight_kg, fd.height_cm, currentPatient.sex, fd.measurements);
    showToast('Avaliação salva com sucesso!', 'success');
    loadPatients();
  } catch (e) {
    showToast('Erro ao salvar avaliação', 'error');
  } finally {
    btn.textContent = 'Salvar Avaliação'; btn.disabled = false;
  }
}

// ===== EVOLUTION =====
async function loadEvolution(pid) {
  const [evolution, assessments] = await Promise.all([
    fetch(`/api/patients/${pid}/evolution`).then(r => r.json()),
    fetch(`/api/patients/${pid}/assessments`).then(r => r.json()),
  ]);

  const el = document.getElementById('evolution-content');
  if (!evolution.length) {
    el.innerHTML = '<p class="empty-state">Nenhuma avaliação registrada ainda.</p>';
    return;
  }

  const latest = evolution[evolution.length - 1];
  const first = evolution[0];

  const deltaFat = evolution.length > 1
    ? (latest.body_fat - first.body_fat).toFixed(1)
    : null;
  const deltaW = evolution.length > 1
    ? (latest.weight - first.weight).toFixed(1)
    : null;

  const fatDeltaHtml = deltaFat !== null
    ? `<div class="evol-delta ${parseFloat(deltaFat) < 0 ? 'good' : 'bad'}">${parseFloat(deltaFat) > 0 ? '+' : ''}${deltaFat}% desde início</div>`
    : '';
  const wDeltaHtml = deltaW !== null
    ? `<div class="evol-delta ${parseFloat(deltaW) < 0 ? 'good' : 'bad'}">${parseFloat(deltaW) > 0 ? '+' : ''}${deltaW} kg desde início</div>`
    : '';

  el.innerHTML = `
    <div class="evolution-grid">
      <div class="evol-card">
        <div class="evol-card-date">Última avaliação · ${latest.date}</div>
        <div class="evol-card-val">${latest.body_fat || '–'}%</div>
        <div class="evol-card-label">% Gordura Corporal</div>
        ${fatDeltaHtml}
      </div>
      <div class="evol-card">
        <div class="evol-card-date">Última avaliação · ${latest.date}</div>
        <div class="evol-card-val">${latest.weight || '–'} kg</div>
        <div class="evol-card-label">Peso</div>
        ${wDeltaHtml}
      </div>
      <div class="evol-card">
        <div class="evol-card-date">Última avaliação · ${latest.date}</div>
        <div class="evol-card-val">${latest.sum7 || '–'} mm</div>
        <div class="evol-card-label">Soma 7 Dobras</div>
      </div>
      <div class="evol-card">
        <div class="evol-card-date">Avaliações</div>
        <div class="evol-card-val">${evolution.length}</div>
        <div class="evol-card-label">Total realizadas</div>
      </div>
    </div>

    <div class="chart-container">
      <h3>% Gordura ao Longo do Tempo</h3>
      <canvas id="chart-fat" class="chart-canvas"></canvas>
    </div>
    <div class="chart-container">
      <h3>Peso (kg)</h3>
      <canvas id="chart-weight" class="chart-canvas"></canvas>
    </div>

    <div class="assess-history">
      <h3>Histórico de Avaliações</h3>
      <table class="history-table">
        <thead><tr>
          <th>Data</th><th>Peso</th><th>% Gordura</th><th>Σ7 Dobras</th><th>IMC</th>
        </tr></thead>
        <tbody>
          ${evolution.slice().reverse().map(e => `
            <tr>
              <td>${e.date}</td>
              <td>${e.weight ? e.weight + ' kg' : '–'}</td>
              <td>${e.body_fat ? e.body_fat + '%' : '–'}</td>
              <td>${e.sum7 ? e.sum7 + ' mm' : '–'}</td>
              <td>${e.bmi || '–'}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>
  `;

  // Draw mini charts with Canvas API
  drawLineChart('chart-fat', evolution.map(e => ({ x: e.date, y: e.body_fat })), '%', '#4f8ef7');
  drawLineChart('chart-weight', evolution.map(e => ({ x: e.date, y: e.weight })), 'kg', '#22c55e');
}

function drawLineChart(canvasId, data, unit, color) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || data.length < 2) return;
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth * window.devicePixelRatio;
  canvas.height = canvas.offsetHeight * window.devicePixelRatio;
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

  const W = canvas.offsetWidth, H = canvas.offsetHeight;
  const pad = { top: 16, right: 20, bottom: 30, left: 45 };
  const vals = data.map(d => d.y).filter(v => v != null);
  if (!vals.length) return;

  const minV = Math.min(...vals) * 0.95;
  const maxV = Math.max(...vals) * 1.05;
  const xStep = (W - pad.left - pad.right) / (data.length - 1);

  const px = (i) => pad.left + i * xStep;
  const py = (v) => pad.top + (maxV - v) / (maxV - minV) * (H - pad.top - pad.bottom);

  ctx.clearRect(0, 0, W, H);

  // Grid
  ctx.strokeStyle = '#2a3348'; ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + i * (H - pad.top - pad.bottom) / 4;
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
    const v = maxV - i * (maxV - minV) / 4;
    ctx.fillStyle = '#8899b4'; ctx.font = '11px sans-serif'; ctx.textAlign = 'right';
    ctx.fillText(v.toFixed(1) + unit, pad.left - 4, y + 4);
  }

  // Fill area
  const gradient = ctx.createLinearGradient(0, pad.top, 0, H - pad.bottom);
  gradient.addColorStop(0, color + '44');
  gradient.addColorStop(1, color + '00');
  ctx.beginPath();
  data.forEach((d, i) => { if (d.y != null) { i === 0 ? ctx.moveTo(px(i), py(d.y)) : ctx.lineTo(px(i), py(d.y)); } });
  ctx.lineTo(px(data.length - 1), H - pad.bottom);
  ctx.lineTo(pad.left, H - pad.bottom);
  ctx.closePath(); ctx.fillStyle = gradient; ctx.fill();

  // Line
  ctx.beginPath(); ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.lineJoin = 'round';
  data.forEach((d, i) => { if (d.y != null) { i === 0 ? ctx.moveTo(px(i), py(d.y)) : ctx.lineTo(px(i), py(d.y)); } });
  ctx.stroke();

  // Dots
  data.forEach((d, i) => {
    if (d.y == null) return;
    ctx.beginPath(); ctx.arc(px(i), py(d.y), 4, 0, Math.PI * 2);
    ctx.fillStyle = color; ctx.fill();
    ctx.strokeStyle = '#0f1117'; ctx.lineWidth = 2; ctx.stroke();
  });

  // X labels
  ctx.fillStyle = '#8899b4'; ctx.font = '10px sans-serif'; ctx.textAlign = 'center';
  data.forEach((d, i) => {
    if (i % Math.ceil(data.length / 6) === 0 || i === data.length - 1) {
      ctx.fillText(d.x.slice(5), px(i), H - 4);
    }
  });
}

// ===== AVATAR CONTROLS =====
function avatarAutoRotate() {
  const active = Avatar.toggleAutoRotate();
  document.getElementById('btn-rotate').classList.toggle('active', active);
}

function resetAvatarView() {
  Avatar.resetView();
}

// ===== UTILS =====
function calcAge(birthDate) {
  if (!birthDate) return 30;
  const born = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - born.getFullYear();
  const m = now.getMonth() - born.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < born.getDate())) age--;
  return age;
}

let toastTimer;
function showToast(msg, type = 'info') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `toast ${type} show`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.classList.remove('show'); }, 3000);
}

// Close modal on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') document.getElementById('modal-patient').style.display = 'none';
});

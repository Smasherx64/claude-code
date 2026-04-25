const STORAGE_KEY = 'fitness_assessments_v1';

const form = document.querySelector('#assessment-form');
const table = document.querySelector('#assessments-table');
const tbody = table.querySelector('tbody');
const emptyState = document.querySelector('#empty-state');

const format = (value, digits = 2) => Number(value).toFixed(digits).replace('.', ',');

function getImcClassification(imc) {
  if (imc < 18.5) return 'Baixo peso';
  if (imc < 25) return 'Peso adequado';
  if (imc < 30) return 'Sobrepeso';
  if (imc < 35) return 'Obesidade I';
  if (imc < 40) return 'Obesidade II';
  return 'Obesidade III';
}

function getWhRisk(sex, rcq) {
  if (sex === 'M') {
    if (rcq < 0.9) return 'Baixo';
    if (rcq < 1) return 'Moderado';
    return 'Alto';
  }

  if (rcq < 0.8) return 'Baixo';
  if (rcq < 0.85) return 'Moderado';
  return 'Alto';
}

function loadData() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function render() {
  const data = loadData();
  tbody.innerHTML = '';

  if (!data.length) {
    table.hidden = true;
    emptyState.hidden = false;
    return;
  }

  table.hidden = false;
  emptyState.hidden = true;

  data.forEach((item) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.date}</td>
      <td>${item.name}</td>
      <td>${item.age}</td>
      <td>${format(item.imc)}</td>
      <td>${item.imcClass}</td>
      <td>${format(item.rcq)}</td>
      <td>${item.rcqRisk}</td>
      <td>${item.notes || '-'}</td>
    `;
    tbody.appendChild(tr);
  });
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const entry = {
    date: new Date().toLocaleDateString('pt-BR'),
    name: form.name.value.trim(),
    age: Number(form.age.value),
    sex: form.sex.value,
    height: Number(form.height.value),
    weight: Number(form.weight.value),
    waist: Number(form.waist.value),
    hip: Number(form.hip.value),
    notes: form.notes.value.trim(),
  };

  const imc = entry.weight / (entry.height ** 2);
  const rcq = entry.waist / entry.hip;

  const assessment = {
    ...entry,
    imc,
    rcq,
    imcClass: getImcClassification(imc),
    rcqRisk: getWhRisk(entry.sex, rcq),
  };

  const data = loadData();
  data.unshift(assessment);
  saveData(data);
  form.reset();
  render();
});

document.querySelector('#clear-data').addEventListener('click', () => {
  if (!confirm('Tem certeza que deseja apagar todas as avaliações?')) return;
  localStorage.removeItem(STORAGE_KEY);
  render();
});

document.querySelector('#export-csv').addEventListener('click', () => {
  const data = loadData();
  if (!data.length) {
    alert('Não há dados para exportar.');
    return;
  }

  const headers = ['data', 'nome', 'idade', 'sexo', 'altura', 'peso', 'cintura', 'quadril', 'imc', 'classificacao', 'rcq', 'risco', 'observacoes'];
  const lines = data.map((item) => [
    item.date,
    item.name,
    item.age,
    item.sex,
    item.height,
    item.weight,
    item.waist,
    item.hip,
    item.imc.toFixed(2),
    item.imcClass,
    item.rcq.toFixed(2),
    item.rcqRisk,
    item.notes,
  ].map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(','));

  const csv = [headers.join(','), ...lines].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `avaliacoes-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
});

render();

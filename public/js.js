const limits = {
  "Bubble": { min: 5, max: 50, default: 15 },
  "Selection": { min: 10, max: 50, default: 25 },
  "Insertion": { min: 10, max: 50, default: 45 },
  "Quick": { min: 5, max: 50, default: 20 },
  "Gnome": { min: 5, max: 50, default: 20 },
  "Stooge": { min: 3, max: 20, default: 10 },
  "Exchange": { min: 5, max: 50, default: 20 },
  "Merge": { min: 5, max: 50, default: 20 }
};
const RANK = { 'O(n)': 1, 'O(n log n)': 2, 'O(n²)': 3, 'O(n^2.71)': 4 };
 
const complexity = {
  Bubble:    { name: 'Burbuja',   best: 'O(n)',       avg: 'O(n²)',      worst: 'O(n²)',
               bestNote: 'Lista ya ordenada (con bandera)', worstNote: 'Lista en orden inverso' },
  Selection: { name: 'Selección', best: 'O(n²)',      avg: 'O(n²)',      worst: 'O(n²)',
               bestNote: 'Siempre recorre todo',           worstNote: 'Siempre recorre todo' },
  Insertion: { name: 'Inserción', best: 'O(n)',       avg: 'O(n²)',      worst: 'O(n²)',
               bestNote: 'Lista ya ordenada',              worstNote: 'Lista en orden inverso' },
  Quick:     { name: 'Quick',     best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n²)',
               bestNote: 'Pivote parte la lista a la mitad', worstNote: 'Pivote siempre es el mín/máx' },
  Gnome:     { name: 'Gnome',     best: 'O(n)',       avg: 'O(n²)',      worst: 'O(n²)',
               bestNote: 'Lista ya ordenada',              worstNote: 'Lista en orden inverso' },
  Stooge:    { name: 'Stooge',    best: 'O(n^2.71)',  avg: 'O(n^2.71)',  worst: 'O(n^2.71)',
               bestNote: 'Igual en todos los casos',       worstNote: 'Igual en todos los casos' },
  Exchange:  { name: 'Exchange',  best: 'O(n²)',      avg: 'O(n²)',      worst: 'O(n²)',
               bestNote: 'Siempre hace todas las pasadas', worstNote: 'Siempre hace todas las pasadas' },
  Merge:     { name: 'Merge',     best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)',
               bestNote: 'Igual en todos los casos',       worstNote: 'Igual en todos los casos' }
};

// ---------- Elementos del DOM ----------
//Metodologia para mejorar el desarrollo 
//Es como un arbol jerarquico, REVISAR antes de modificar 
//atte Dep-Frontend
const $ = (id) => document.getElementById(id);
const selectAlgorithm = $('algorithm');
const inputElements   = $('elements');
const textElements    = $('elements-value');
const inputSpeed      = $('speed');
const textSpeed       = $('speed-value');
const barsBox         = $('bars');
const algoButtons     = document.querySelectorAll('[data-algo]');
 
const ACTIVE   = ['bg-slate-950', 'text-white', 'font-bold'];
const INACTIVE = ['border', 'border-slate-200', 'bg-white', 'text-slate-600', 'font-semibold'];
 
let data = [];

//Grafica y Barras
function generateData() {
  const n = parseInt(inputElements.value);
  data = Array.from({ length: n }, () => Math.floor(Math.random() * 96) + 5); // 5..100
  renderBars();
  resetStats();
}
 
function renderBars() {
  barsBox.innerHTML = '';
  data.forEach((v) => {
    const bar = document.createElement('div');
    bar.style.height = v + '%';
    bar.style.flex = '1 1 0';
    bar.style.maxWidth = '24px';
    bar.className = 'rounded-t-sm bg-blue-600 transition-all duration-300';
    bar.title = v;
    barsBox.appendChild(bar);
  });
}
 
function resetStats() {
  $('stat-comparisons').textContent = 0;
  $('stat-swaps').textContent = 0;
  $('stat-progress').textContent = '0%';
}

//Config
function updateElementLimits() {
  const { min, max, default: def } = limits[selectAlgorithm.value];
  inputElements.min = min;
  inputElements.max = max;
  inputElements.value = def;
  textElements.textContent = def;
}
 
function updateActiveButton() {
  algoButtons.forEach((btn) => {
    const isActive = btn.dataset.algo === selectAlgorithm.value;
    btn.classList.remove(...ACTIVE, ...INACTIVE);
    btn.classList.add(...(isActive ? ACTIVE : INACTIVE));
    btn.setAttribute('aria-pressed', isActive);
  });
}
 
function updateSpeedLabel() {
  const val = parseInt(inputSpeed.value);
  textSpeed.textContent = val < 33 ? 'Lenta' : val > 66 ? 'Rápida' : 'Media';
}
 
//Complejidad
function updateInfo() {
  const algo = selectAlgorithm.value;
  const c = complexity[algo];
  $('cx-name').textContent = c.name;
  $('viz-title').textContent = c.name;
  $('cx-best').textContent = c.best;
  $('cx-avg').textContent = c.avg;
  $('cx-worst').textContent = c.worst;
  $('cx-best-note').textContent = c.bestNote;
  $('cx-worst-note').textContent = c.worstNote;
  updateComparison();
}
 
//Comparar
const compareToggle = $('compare-toggle');
const comparePanel  = $('compare-panel');
const selectB       = $('algorithm-b');
 
function toggleCompare() {
  const open = comparePanel.classList.toggle('hidden') === false;
  compareToggle.setAttribute('aria-expanded', open);
  compareToggle.textContent = open ? 'Ocultar comparación' : 'Comparar con otro método';
  if (open) updateComparison();
}
 
function winnerClass(a, b) {
  if (RANK[a] < RANK[b]) return ['text-emerald-600 font-bold', 'text-slate-500'];
  if (RANK[a] > RANK[b]) return ['text-slate-500', 'text-emerald-600 font-bold'];
  return ['text-slate-700', 'text-slate-700'];
}
 
function updateComparison() {
  if (comparePanel.classList.contains('hidden')) return;
 
  const keyA = selectAlgorithm.value;
  // Si B es igual a A, se cambia automáticamente al siguiente método
  if (selectB.value === keyA) {
    const keys = Object.keys(complexity);
    selectB.value = keys[(keys.indexOf(keyA) + 1) % keys.length];
  }
  const keyB = selectB.value;
  const A = complexity[keyA], B = complexity[keyB];
 
  $('cmp-head-a').textContent = A.name;
  $('cmp-head-b').textContent = B.name;
 
  const rows = [['Mejor', 'best'], ['Promedio', 'avg'], ['Peor', 'worst']];
  let scoreA = 0, scoreB = 0;
  $('cmp-body').innerHTML = rows.map(([label, k]) => {
    const [ca, cb] = winnerClass(A[k], B[k]);
    scoreA += RANK[A[k]] < RANK[B[k]] ? 1 : 0;
    scoreB += RANK[B[k]] < RANK[A[k]] ? 1 : 0;
    return `<tr class="border-t border-slate-100">
      <td class="py-2 font-sans font-semibold text-slate-400">${label}</td>
      <td class="py-2 ${ca}">${A[k]}</td>
      <td class="py-2 ${cb}">${B[k]}</td></tr>`;
  }).join('');
 
  let verdict;
  if (scoreA === scoreB) verdict = `${A.name} y ${B.name} tienen un rendimiento teórico equivalente.`;
  else {
    const [w, l] = scoreA > scoreB ? [A, B] : [B, A];
    verdict = `${w.name} es teóricamente más eficiente que ${l.name} (gana en ${Math.max(scoreA, scoreB)} de 3 casos).`;
  }
  $('cmp-verdict').textContent = verdict;
}
 
//Selected
function selectMethod(name) {
  selectAlgorithm.value = name;
  updateElementLimits();
  updateActiveButton();
  updateInfo();
  generateData();
}
 
algoButtons.forEach((btn) => btn.addEventListener('click', () => selectMethod(btn.dataset.algo)));
selectAlgorithm.addEventListener('change', () => selectMethod(selectAlgorithm.value));
 
inputElements.addEventListener('input', (e) => {
  textElements.textContent = e.target.value;
  generateData();
});
inputSpeed.addEventListener('input', updateSpeedLabel);
$('generate').addEventListener('click', generateData);
 
compareToggle.addEventListener('click', toggleCompare);
selectB.addEventListener('change', updateComparison);
 
//Start
selectMethod(selectAlgorithm.value);
updateSpeedLabel();
// Selector de algoritmo
const algoList = document.querySelector('#algo-list');
let selectedAlgo = algoList.querySelector('.btn-active')?.dataset.algo ?? null;
// Interfaz para que la animación se conecte después
const algoSelector = {
  getSelected: () => selectedAlgo,
  onChange: null, // (algo) => { ... }
};
algoList.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn-method');
  if (!btn) return; // clic en el label u otra cosa

  algoList.querySelector('.btn-active')?.classList.remove('btn-active');
  btn.classList.add('btn-active');

  selectedAlgo = btn.dataset.algo;
  algoSelector.onChange?.(selectedAlgo);
});

window.algoSelector = algoSelector;
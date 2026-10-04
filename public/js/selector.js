// Selector de algoritmo
const algoList = document.querySelector('#algo-list');
let selectedAlgo = algoList.querySelector('.btn-active')?.dataset.algo ?? null;
let modoComparar = false;
let comparados = [];

const pintarActivos = () => algoList.querySelectorAll('.btn-method').forEach(b => b.classList.toggle
  ('btn-active', (modoComparar ? comparados : [selectedAlgo]).includes(b.dataset.algo)));
// Interfaz para que la animación se conecte después
const algoSelector = {
  getSelected: () => selectedAlgo,
  getComparados: () => [...comparados],
  setModo(c) { modoComparar = c; comparados = c && selectedAlgo ? [selectedAlgo] : []; pintarActivos(); },
  onChange: null,
  onCompareChange: null,
};
algoList.addEventListener('click', (e) => {
  const algo = e.target.closest('.btn-method')?.dataset.algo;
  if (!algo) return; // clic en el label u otra cosa
  if (!modoComparar) { selectedAlgo = algo; pintarActivos(); return algoSelector.onChange?.(algo); }
  const i = comparados.indexOf(algo);
  if (i >= 0) comparados.splice(i, 1); else comparados.push(algo);
  pintarActivos();
  algoSelector.onCompareChange?.();
});

window.algoSelector = algoSelector;

(() => {
  const $ = id => document.getElementById(id);
  const [vSingle, vCompare, cont, tplP, tplF, tabla, hint, warn] = ['view-single', 'view-compare', 'panels', 'tpl-panel', 'tpl-result-row', 'results-body', 'compare-hint', 'stooge-warning'].map($);
  let modo = 'single', paneles = [], indice = 0, listos = false, cargando = false, version = 0, previos, suscrito = false;
  const arregloComun = () => { const a = window.arrayManager.getArray(); return algoSelector.getComparados().includes('Stooge') ? a.slice(0, LIMITE_STOOGE) : a; };
 
  function construir() {
    window.controls.pause?.();
    version++; indice = 0; listos = cargando = false;
    cont.replaceChildren(); tabla.replaceChildren();
    const a = arregloComun();
    paneles = algoSelector.getComparados().map(nombre => {
      const nodo = tplP.content.firstElementChild.cloneNode(true);
      nodo.querySelector('.panel-name').textContent = nombre;
      nodo.querySelector('.panel-comps').textContent = nodo.querySelector('.panel-moves').textContent = 0;
      cont.append(nodo);
      const cv = nodo.querySelector('.panel-canvas'), c = cv.getContext('2d');
      ajustarTamanoCanvas(cv, c); dibujarArreglo(a, {}, cv, c);
      return { nombre, nodo, cv, c, pasos: [] };
    });
    hint.textContent = paneles.length >= 2 ? 'Listo: presiona Play o Paso para comparar.' :`Elige al menos 2 métodos (${paneles.length}  seleccionado${paneles.length === 1 ? '' : 's'}).`;
    warn.hidden = !algoSelector.getComparados().includes('Stooge');
  }
 
  function dibujar() {
    paneles.forEach(p => {
      const u = p.pasos.length - 1, i = Math.min(indice, u), s = p.pasos[i];
      dibujarArreglo(s.array, pasoAResaltados(s), p.cv, p.c);
      p.nodo.querySelector('.panel-comps').textContent = p.comps[i];
      p.nodo.querySelector('.panel-moves').textContent = p.movs[i];
      p.nodo.querySelector('.panel-bar-fill').style.width = `${u > 0 ? i / u * 100 : 100}%`;
      if (p.live) p.live.style.width = `${(p.comps[i] + p.movs[i]) / p.max * 100}%`;
    });
  }
 
  function construirTabla() {
    const tot = p => p.comps.at(-1) + p.movs.at(-1);
    const max = Math.max(...paneles.map(tot), 1);
    [...paneles].sort((a, b) => tot(a) - tot(b)).forEach((p, k) => {
      const f = tplF.content.firstElementChild.cloneNode(true), q = s => f.querySelector(s);
      q('.r-rank').textContent = k + 1;
      q('.r-name').textContent = p.nombre;
      q('.r-comps').textContent = p.comps.at(-1);
      q('.r-moves').textContent = p.movs.at(-1);
      q('.r-total-num').textContent = tot(p);
      q('.r-bar-total').style.width = `${tot(p) / max * 100}%`;
      q('.r-ms').textContent = `${p.ms.toFixed(0)} ms`;
      q('.r-avg').textContent = `${(p.ms / p.pasos.length).toFixed(2)} ms/paso`;
      p.live = q('.r-bar-live'); p.max = max;
      p.nodo.querySelector('.panel-rank').textContent = `#${k + 1}`;
      tabla.append(f);
    });
  }
 
  async function cargar() {
    const metodos = algoSelector.getComparados();
    if (cargando || paneles.length < 2) return;
    cargando = true;
    const v = version, a = arregloComun();
    try {
      const res = await Promise.all(metodos.map(async m => { const t = performance.now(); const d = await window.ConexionAlBackend(m, a); return [d.steps, performance.now() - t]; }));
      if (v !== version) return;
      res.forEach(([pasos, ms], k) => {
        let c = 0, m = 0;
        const comps = [], movs = [];
        pasos.forEach(s => { c += s.compare?.length ? 1 : 0; m += s.swapped ? 1 : 0; comps.push(c); movs.push(m); });
        Object.assign(paneles[k], { pasos, ms, comps, movs });
      });
      listos = true; construirTabla(); dibujar();
    } catch { window.controls.pause?.(); }
    finally { if (v === version) cargando = false; }
  }
 
  function avanzar() {
    if (paneles.length < 2) return false;
    if (!listos) { cargar(); return true; }
    if (indice >= Math.max(...paneles.map(p => p.pasos.length)) - 1) return false;
    indice++; dibujar(); return true;
  }
 
  function reiniciar() { indice = 0; listos ? dibujar() : construir(); }
 
  function setModo(nuevo) {
    if (nuevo === modo) return;
    window.controls.pause?.();
    modo = nuevo;
    document.querySelectorAll('#mode-nav button').forEach(b => b.classList.toggle('active', b.dataset.mode === nuevo));
    vSingle.hidden = nuevo !== 'single';
    vCompare.hidden = nuevo !== 'compare';
    algoSelector.setModo(nuevo === 'compare');
    if (nuevo === 'compare') {
      if (!suscrito) { suscrito = true; window.appState.fil((e, motivo) => { if (modo === 'compare' && motivo === 'arreglo') construir(); }); }
      previos = { onStep: window.controls.onStep, onReset: window.controls.onReset };
      Object.assign(window.controls, { onStep: avanzar, onReset: reiniciar });
      construir();
    } else {
      Object.assign(window.controls, previos);
      warn.hidden = algoSelector.getSelected() !== 'Stooge';
      ajustarTamanoCanvas(); dibujarArreglo(window.arrayManager.getArray());
    }
  }
 
  $('mode-nav').addEventListener('click', e => { const b = e.target.closest('button[data-mode]'); if (b) setModo(b.dataset.mode); });
  algoSelector.onCompareChange = () => modo === 'compare' && construir();
  window.addEventListener('resize', () => {
    if (modo !== 'compare') return;
    paneles.forEach(p => ajustarTamanoCanvas(p.cv, p.c));
    if (listos) dibujar(); else { const a = arregloComun(); paneles.forEach(p => dibujarArreglo(a, {}, p.cv, p.c)); }
  });
})();
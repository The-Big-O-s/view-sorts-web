
(() => {
  'use strict';
 
  const MAX_BYTES = 15 * 1024 * 1024; 
  const $ = id => document.getElementById(id);
  const esc = s => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = n => n.toLocaleString('en-US');
  const fmtBytes = b => b >= 1048576 ? (b / 1048576).toFixed(2) + ' MB' : b >= 1024 ? (b / 1024).toFixed(1) + ' KB' : b + ' B';
 
  let cargado = null; // { nombre, texto, meta }
 
  /* ── Mensajes (errores y avisos bajo la barra) ── */
  function mensaje(txt, error = false) {
    const m = $('hz-msg');
    m.hidden = !txt; m.textContent = txt || ''; m.classList.toggle('error', error);
  }
 
  /* ── Libro cargado: se guarda, se muestra su nombre y se habilita Comprimir ── */
  function cargar(nombre, texto, meta = '') {
    texto = texto.replace(/^\uFEFF/, ''); // quita el BOM si lo trae
    if (!texto.trim()) return mensaje('El archivo está vacío.', true);
    cargado = { nombre, texto, meta };
    const bytes = new TextEncoder().encode(texto).length;
    $('hz-current-label').innerHTML = `<b>${esc(nombre)}</b> <span class="hz-muted">· ${fmtBytes(bytes)}</span>`;
    $('hz-run').disabled = false;
    mensaje('');
  }
 
  /* ── 1. Subir .txt ── */
  $('hz-file').addEventListener('change', async e => {
    const f = e.target.files[0];
    e.target.value = ''; 
    if (!f) return;
    if (f.size > MAX_BYTES) return mensaje('El archivo supera 15 MB.', true);
    if (!/\.txt$/i.test(f.name) && !f.type.startsWith('text/')) return mensaje('Selecciona un archivo .txt.', true);
    cargar(f.name.replace(/\.txt$/i, ''), await f.text(), 'Archivo local');
  });
 
  /* ── 2. Buscador de Gutenberg (usa /api/gutenberg/*) ── */
  const lista = $('hz-results');
  const cerrarLista = () => { lista.hidden = true; };
  $('hz-results-close').addEventListener('click', cerrarLista);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') cerrarLista(); });
  document.addEventListener('click', e => {
    if (!lista.hidden && !e.target.closest('#controls')) cerrarLista(); // clic fuera
  });
 
  async function pedirJson(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail || 'No se pudo conectar con el servidor');
    return res;
  }
 
  $('hz-search').addEventListener('submit', async e => {
    e.preventDefault();
    const q = $('hz-q').value.trim();
    if (!q) return;
    const btn = $('hz-buscar');
    btn.disabled = true; mensaje('Buscando en Project Gutenberg…');
    try {
      const res = await pedirJson(`/api/gutenberg/search?q=${encodeURIComponent(q)}`);
      mostrarResultados(await res.json());
      mensaje('');
    } catch (err) { mensaje(err.message, true); }
    finally { btn.disabled = false; }
  });
 
  function mostrarResultados({ count, results }) {
    $('hz-results-count').textContent = `Project Gutenberg · ${fmt(count)} resultados`;
    const ul = $('hz-results-list');
    ul.innerHTML = '';
    if (!results.length) ul.innerHTML = '<li class="hz-res-empty">Sin resultados.</li>';
    for (const libro of results) {
      const li = document.createElement('li');
      li.innerHTML = `<div class="hz-res-info"><div class="hz-res-title">${esc(libro.title)}</div>` +
        `<div class="hz-res-meta">${esc(libro.authors || 'Autor desconocido')} · #${libro.id} · ${fmt(libro.downloads)} descargas</div></div>`;
      const usar = document.createElement('button');
      usar.type = 'button'; usar.className = 'hz-use'; usar.textContent = 'Usar';
      usar.addEventListener('click', () => usarLibro(libro, usar));
      li.appendChild(usar);
      ul.appendChild(li);
    }
    lista.hidden = false;
  }
 
  async function usarLibro(libro, boton) {
    boton.disabled = true; boton.textContent = 'Cargando…';
    try {
      const res = await pedirJson(`/api/gutenberg/book/${libro.id}`);
      cargar(libro.title, await res.text(), `${libro.authors || 'Autor desconocido'} · Project Gutenberg #${libro.id}`);
      cerrarLista();
    } catch (err) {
      mensaje(err.message, true);
      boton.disabled = false; boton.textContent = 'Usar';
    }
  }
 
  /* ── 3. Comprimir: solo avisa. Quien escuche el evento hace el trabajo ── */
  $('hz-run').addEventListener('click', () => {
    if (!cargado) return;
    document.dispatchEvent(new CustomEvent('fuente:comprimir', { detail: { ...cargado } }));
  });
})();
 
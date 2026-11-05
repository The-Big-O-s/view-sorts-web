// navegacion.js — index.html barra fija
(() => {
  'use strict';
  const SECCIONES = {
    ordenamiento: { archivo: 'ordenamiento.html', titulo: 'Ordenamiento' },
    huffman:      { archivo: 'huffman.html',      titulo: 'Huffman' },
  };
  const DEFECT = 'ordenamiento';
  const UMBRAL = 10;          // px de movimiento antes de cambiar de estado (evita parpadeo)
  const CERCA_DEL_TOPE = 40;  // arriba del todo la barra siempre se ve
 
  const marco = document.getElementById('vista');
  const barra = document.querySelector('.header');
  const enlaces = document.querySelectorAll('.site-nav a');
 
  /* ── Sección activa ── */
  function mostrarSeccion() {
    const pedida = location.hash.slice(1);
    const clave = Object.keys(SECCIONES).includes(pedida) ? pedida : DEFECT;
    const { archivo, titulo } = SECCIONES[clave];
    if (marco.getAttribute('src') !== archivo) marco.setAttribute('src', archivo);
    enlaces.forEach(a => {
      if (a.dataset.seccion === clave) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    document.title = 'VSA \u2014 ' + titulo;
  }
 
  /* ── Barra que se oculta al bajar y vuelve al subir ── */
  let ultimoY = 0;
  const mostrarBarra = () => barra.classList.remove('oculta');
  const ocultarBarra = () => barra.classList.add('oculta');
 
  function alDesplazar(win) {
    const y = Math.max(0, win.scrollY);
    if (y < CERCA_DEL_TOPE) { mostrarBarra(); ultimoY = y; return; }
    if (barra.classList.contains('oculta')) {
      if (y > ultimoY) ultimoY = y;                              // sigue bajando: sigue oculta
      else if (ultimoY - y > UMBRAL) { mostrarBarra(); ultimoY = y; } // subió: reaparece
    } else {
      if (y < ultimoY) ultimoY = y;
      else if (y - ultimoY > UMBRAL) { ocultarBarra(); ultimoY = y; } // bajó: se oculta
    }
  }
 
  // Cada vez que se carga una sección hay una ventana nueva: se vuelve a escuchar.
  marco.addEventListener('load', () => {
    const win = marco.contentWindow;
    mostrarBarra(); ultimoY = 0;
    win.addEventListener('scroll', () => alDesplazar(win), { passive: true });
    // Acercar el mouse al borde superior también la muestra
    win.addEventListener('mousemove', e => { if (e.clientY <= 8) mostrarBarra(); }, { passive: true });
  });
  // Con teclado (Tab) la barra debe verse
  barra.addEventListener('focusin', mostrarBarra);
 
  window.addEventListener('hashchange', mostrarSeccion);
  mostrarSeccion();
})();
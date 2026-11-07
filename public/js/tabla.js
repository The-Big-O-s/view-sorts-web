// tabla de frecuencias y códigos.
(() => {
  'use strict';
 
  const $ = id => document.getElementById(id);
  const fmt = n => n.toLocaleString('en-US');
  const esc = s => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const unicode = ch => 'U+' + ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0');
 
  // Cómo mostrar los caracteres invisibles
  function visible(ch) {
    const cp = ch.codePointAt(0);
    if (ch === ' ') return '␣';
    if (ch === '\n') return '↵';
    if (ch === '\r') return '␍';
    if (ch === '\t') return '⇥';
    if (cp === 0xA0) return '⍽';
    if (cp < 0x20 || (cp >= 0x7F && cp < 0xA0)) return '·';
    return ch;
  }
 
  function renderTabla({ n, bitsTotales, simbolos }) {
    const cuerpo = $('hz-tabla');
    if (!simbolos || !simbolos.length) {
      $('hz-tabla-label').textContent = '';
      cuerpo.innerHTML = '<tr><td colspan="7" class="mu">Sin datos.</td></tr>';
      return;
    }
    n = n ?? simbolos.reduce((s, x) => s + x.freq, 0);
    bitsTotales = bitsTotales ?? simbolos.reduce((s, x) => s + x.freq * x.codigo.length, 0);
 
    // De mayor a menor frecuencia (a igualdad, por code point para que el orden sea estable)
    const filas = [...simbolos].sort((a, b) => b.freq - a.freq || a.ch.codePointAt(0) - b.ch.codePointAt(0));
    const maxF = filas[0].freq;
 
    $('hz-tabla-label').textContent = `de mayor a menor frecuencia · total ${fmt(bitsTotales)} bits`;
    cuerpo.innerHTML = filas.map(s =>
      `<tr><td class="ch">${esc(visible(s.ch))}</td>` +
      `<td class="m mu">${unicode(s.ch)}</td>` +
      `<td><span class="fb"><i style="width:${(s.freq / maxF * 100).toFixed(1)}%"></i></span>${fmt(s.freq)}</td>` +
      `<td>${(s.freq / n * 100).toFixed(2)}</td>` +
      `<td class="k">${esc(s.codigo)}</td>` +
      `<td>${s.codigo.length}</td>` +
      `<td>${fmt(s.freq * s.codigo.length)}</td></tr>`
    ).join('');
  }
 
  // La tabla vive en la vista "Árbol y códigos": al haber datos, se quita el aviso de vacío
  function mostrarVista() {
    const vista = $('view-arbol');
    vista.querySelector('.hz-vacio').hidden = true;
    vista.querySelector('.hz-body').hidden = false;
  }
 
  document.addEventListener('huffman:resultado', e => { renderTabla(e.detail); mostrarVista(); });
  window.renderTabla = renderTabla; // por si se quiere llamar a mano desde la consola
})();
// editor.js — vista tipo editor con números de línea y dos modos:
(() => {
  'use strict';
 
  const $ = id => document.getElementById(id);
  const fmt = n => n.toLocaleString('en-US');
 
  const LOTE = 200;           
  const BYTES_POR_LINEA = 8;
  const CERCA = 300; 
 
  const cont = $('hz-lines');
  let d = null;          // datos actuales
  let vista = 'bin';     // 'bin' | 'txt'
  let cargadas = 0;      // líneas ya dibujadas
  let lineasTxt = null;  // el texto partido en líneas (se calcula la primera vez que se pide)
 
  /* ── Datos de cada línea (se calculan solo cuando se van a mostrar) ── */
  function totalLineas() {
    if (vista === 'txt') {
      if (!lineasTxt) lineasTxt = d.texto.split(/\r?\n/);
      return lineasTxt.length;
    }
    return d.bytes ? Math.ceil(d.bytes.length / BYTES_POR_LINEA)
                   : Math.ceil(d.bits.length / (BYTES_POR_LINEA * 8));
  }
 
  function textoLinea(i) {
    if (vista === 'txt') return lineasTxt[i];
    const grupos = [];
    if (d.bytes) {
      const ini = i * BYTES_POR_LINEA;
      for (let j = ini; j < Math.min(ini + BYTES_POR_LINEA, d.bytes.length); j++) {
        grupos.push(d.bytes[j].toString(2).padStart(8, '0'));
      }
    } else {
      const s = d.bits.slice(i * BYTES_POR_LINEA * 8, (i + 1) * BYTES_POR_LINEA * 8);
      for (let k = 0; k < s.length; k += 8) grupos.push(s.slice(k, k + 8));
    }
    return grupos.join(' ');
  }
 
  /* ── Dibujo por partes ── */
  function agregarLote() {
    const total = totalLineas();
    const hasta = Math.min(cargadas + LOTE, total);
    const frag = document.createDocumentFragment();
    for (let i = cargadas; i < hasta; i++) {
      const fila = document.createElement('div'); fila.className = 'hz-ln';
      const num = document.createElement('em'); num.textContent = i + 1;
      const txt = document.createElement('span'); txt.textContent = textoLinea(i);
      fila.append(num, txt);
      frag.appendChild(fila);
    }
    cont.appendChild(frag);   // solo se agregan las nuevas: lo anterior no se vuelve a dibujar
    cargadas = hasta;
    actualizarPie(total);
  }
 
  function reiniciar() {
    cont.replaceChildren();
    cont.scrollTop = 0;
    cargadas = 0;
    cont.classList.toggle('bin', vista === 'bin');
    agregarLote();
  }
 
  function actualizarPie(total) {
    const bytesTot = d.bytes ? d.bytes.length : Math.ceil(d.bits.length / 8);
    const bitsTot = d.bitsTotales ?? (d.bytes ? d.bytes.length * 8 : d.bits.length);
    $('hz-lineas-label').textContent = `${fmt(cargadas)} de ${fmt(total)} líneas`;
    $('hz-filename').textContent = (d.nombre ?? 'archivo') + (vista === 'bin' ? '.tbos' : '.txt');
    $('hz-status').textContent = vista === 'bin'
      ? `${fmt(bytesTot)} bytes · ${fmt(bitsTot)} bits · ${BYTES_POR_LINEA} bytes por línea`
      : `${fmt(d.n ?? d.texto.length)} caracteres decodificados`;
    $('hz-mas').disabled = cargadas >= total;
    for (const [id, v] of [['hz-ver-bin', 'bin'], ['hz-ver-txt', 'txt']]) {
      $(id).classList.toggle('on', vista === v);
      $(id).setAttribute('aria-pressed', vista === v);
    }
  }
 
  /* ── Interacción ── */
  // Al acercarse al final del editor se carga el siguiente lote
  cont.addEventListener('scroll', () => {
    if (d && cargadas < totalLineas() && cont.scrollTop + cont.clientHeight >= cont.scrollHeight - CERCA) agregarLote();
  }, { passive: true });
 
  // Botón de respaldo (y para quien navega con teclado)
  $('hz-mas').addEventListener('click', () => { if (d) agregarLote(); });
 
  function cambiarVista(v) {
    if (!d || v === vista) return;
    vista = v;
    reiniciar();
  }
  $('hz-ver-bin').addEventListener('click', () => cambiarVista('bin'));
  $('hz-ver-txt').addEventListener('click', () => cambiarVista('txt'));
 
  /* ── Datos nuevos ── */
  function mostrarVista() {
    const v = $('view-texto');
    v.querySelector('.hz-vacio').hidden = true;
    v.querySelector('.hz-body').hidden = false;
  }
 
  document.addEventListener('huffman:resultado', e => {
    const x = e.detail;
    if (!x || (!x.bytes && typeof x.bits !== 'string')) return; // este evento no trae bits: no es para el editor
    d = x; vista = 'bin'; lineasTxt = null;
 
    $('hz-titulo').textContent = d.nombre ?? 'Archivo';
    $('hz-desc').textContent = (d.meta ? d.meta + '. ' : '') +
      'El archivo ya está comprimido: la vista Normal no lee el .txt original, se genera decodificando los bits.';
    $('hz-ver-txt').disabled = typeof d.texto !== 'string';
 
    const chk = $('hz-check');
    chk.classList.toggle('bad', d.ok === false);
    chk.textContent = d.ok === true ? '✓ decodificado = original' : d.ok === false ? '✕ el decodificado no coincide con el original' : '';
 
    mostrarVista();
    reiniciar();
  });
})();
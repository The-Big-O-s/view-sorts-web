(() => {
  'use strict';
 
  const $ = id => document.getElementById(id);
  const fmt = n => n.toLocaleString('en-US');
  const fmtBytes = b => b >= 1048576 ? (b / 1048576).toFixed(2) + ' MB' : b >= 1024 ? (b / 1024).toFixed(1) + ' KB' : b + ' B';
 
  const MAX_BYTES = 15 * 1024 * 1024;       // límite razonable para el navegador
  const FIRMA = [0x54, 0x42, 0x4f, 0x53];   // "TBOS"
  const LOTE = 200;                         // líneas que se agregan cada vez
  const CERCA = 300;                        // px antes del final en los que se carga el siguiente lote
 
  const cont = $('hz-d-lines');
  let actual = null;     // { nombre, texto, lineas, bytesTbos }
  let mostradas = 0;     // líneas ya dibujadas
  let ocupado = false;   // hay una descompresión en curso
 
  /* ── Mensajes ── */
  function mensaje(txt, error = false) {
    const m = $('hz-d-msg');
    m.hidden = !txt; m.textContent = txt || ''; m.classList.toggle('error', error);
  }
 
  // "Mi Libro.tbos" → "mi-libro" (nombre seguro para un archivo)
  function nombreBase(nombre) {
    return String(nombre ?? '')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w.-]+/g, '-').replace(/^[-.]+|[-.]+$/g, '')
      .slice(0, 80).toLowerCase() || 'huffman';
  }
 
  // Un .tbos empieza con "TBOS" + tamaño del encabezado (4 bytes) + encabezado + datos
  function validarTbos(b) {
    const malo = new Error('No parece un archivo .tbos válido (falta la firma TBOS o está incompleto).');
    if (b.length < 8 || !FIRMA.every((x, i) => b[i] === x)) throw malo;
    const tamEncabezado = new DataView(b.buffer, b.byteOffset, b.byteLength).getUint32(4);
    if (8 + tamEncabezado > b.length) throw malo;
  }
 
  /* ── Subir y descomprimir ── */
  async function procesar(archivo) {
    if (!archivo || ocupado) return;
    if (!/\.tbos$/i.test(archivo.name)) return mensaje('Selecciona un archivo .tbos.', true);
    if (archivo.size > MAX_BYTES) return mensaje('El archivo supera 15 MB.', true);
    if (!window.hzApi) return mensaje('La conexión con el servidor no está lista.', true);
 
    ocupado = true;
    try {
      const bytes = new Uint8Array(await archivo.arrayBuffer());
      validarTbos(bytes);
      mensaje('Descomprimiendo…');
      const texto = await window.hzApi.descomprimir(bytes);
      if (!texto) throw new Error('El servidor devolvió un texto vacío.');
      actual = {
        nombre: archivo.name.replace(/\.tbos$/i, ''),
        texto,
        bytesTbos: bytes.length,
        lineas: texto.split(/\r?\n/),
      };
      mensaje('');
      mostrar();
    } catch (err) {
      mensaje(err.message, true);   // si falla, se conserva el resultado anterior
    } finally {
      ocupado = false;
    }
  }
 
  $('hz-d-file').addEventListener('change', e => {
    const f = e.target.files[0];
    e.target.value = '';            // permite volver a elegir el mismo archivo
    procesar(f);
  });
 
  // Arrastrar y soltar sobre la zona
  const zona = $('hz-d-drop');
  zona.addEventListener('dragover', e => { e.preventDefault(); zona.classList.add('sobre'); });
  zona.addEventListener('dragleave', () => zona.classList.remove('sobre'));
  zona.addEventListener('drop', e => {
    e.preventDefault();
    zona.classList.remove('sobre');
    procesar(e.dataTransfer?.files?.[0]);
  });
 
  /* ── Mostrar el resultado ── */
  function crearStat(valor, etiqueta, sub, color) {
    const s = document.createElement('div'); s.className = 'stat';
    const v = document.createElement('span'); v.className = 'stat-value'; v.textContent = valor;
    if (color) v.style.color = color;
    const l = document.createElement('span'); l.className = 'stat-label'; l.textContent = etiqueta;
    const u = document.createElement('span'); u.className = 'stat-sub'; u.textContent = sub;
    s.append(v, l, u);
    return s;
  }
 
  function mostrar() {
    const { nombre, texto, bytesTbos, lineas } = actual;
    const original = new TextEncoder().encode(texto).length;
    const caracteres = [...texto].length;
    const ahorro = (1 - bytesTbos / original) * 100;
 
    $('hz-d-label').textContent = `${fmt(lineas.length)} líneas`;
    $('hz-d-stats').replaceChildren(
      crearStat(fmtBytes(bytesTbos), '.tbos subido', `${fmt(bytesTbos)} bytes`),
      crearStat(fmtBytes(original), 'texto recuperado', `${fmt(caracteres)} caracteres`),
      crearStat(`${ahorro.toFixed(1)} %`, ahorro >= 0 ? 'de ahorro' : 'más grande que el texto', 'frente al texto recuperado',
        ahorro >= 0 ? 'var(--c-sorted)' : 'var(--c-error)')
    );
    $('hz-d-filename').textContent = nombre + '.txt';
    $('hz-d-resultado').hidden = false;
 
    cont.replaceChildren();
    cont.scrollTop = 0;
    mostradas = 0;
    agregarLote();
  }
 
  // Carga por partes: solo se dibujan las líneas nuevas
  function agregarLote() {
    const total = actual.lineas.length;
    const hasta = Math.min(mostradas + LOTE, total);
    const frag = document.createDocumentFragment();
    for (let i = mostradas; i < hasta; i++) {
      const fila = document.createElement('div'); fila.className = 'hz-ln';
      const num = document.createElement('em'); num.textContent = i + 1;
      const txt = document.createElement('span'); txt.textContent = actual.lineas[i];
      fila.append(num, txt);
      frag.appendChild(fila);
    }
    cont.appendChild(frag);
    mostradas = hasta;
    $('hz-d-status').textContent = `${fmt(mostradas)} de ${fmt(total)} líneas`;
    $('hz-d-mas').disabled = mostradas >= total;
  }
 
  cont.addEventListener('scroll', () => {
    if (actual && mostradas < actual.lineas.length && cont.scrollTop + cont.clientHeight >= cont.scrollHeight - CERCA) agregarLote();
  }, { passive: true });
  $('hz-d-mas').addEventListener('click', () => { if (actual) agregarLote(); });
 
  /* ── Descargar el texto ── */
  $('hz-d-dl').addEventListener('click', () => {
    if (!actual) return;
    const url = URL.createObjectURL(new Blob([actual.texto], { type: 'text/plain;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url; a.download = nombreBase(actual.nombre) + '-decodificado.txt';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
})();
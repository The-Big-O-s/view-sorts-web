
(() => {
  'use strict';

  const NS = 'http://www.w3.org/2000/svg';
  const $ = (id) => document.getElementById(id);
  const fmt = (n) => n.toLocaleString('en-US');
  const compacto = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }); // 250000 → "250K"

  // Medidas del dibujo (px)
  const HOJA_W = 44;
  const HOJA_H = 44;
  const SEP_X = 54; // distancia horizontal entre hojas
  const SEP_Y = 72; // distancia vertical entre niveles
  const RADIO = 8; // radio de los nodos internos
  const MARGEN = 28;
  const MAX_HOJAS = 500; // con más hojas el dibujo pasaría de 25,000 px de ancho: mejor avisar

  const cont = $('hz-tree');
  const statsBox = $('hz-stats-arbol');
  const etiqueta = $('hz-arbol-label');

  // El contenedor tiene scroll: con tabindex se puede recorrer con las flechas del teclado
  cont.tabIndex = 0;
  cont.setAttribute('role', 'region');
  cont.setAttribute('aria-label', 'Árbol de Huffman (se desplaza con las flechas)');

  // Igual que en tabla.js: cómo mostrar los caracteres invisibles
  function visible(ch) {
    const cp = ch.codePointAt(0);
    if (ch === ' ') return '␣';
    if (ch === '\n') return '↵';
    if (ch === '\r') return '␍';
    if (ch === '\t') return '⇥';
    if (cp === 0xa0) return '⍽';
    if (cp < 0x20 || (cp >= 0x7f && cp < 0xa0)) return '·';
    return ch;
  }

  /* ── Validación del árbol que manda el backend ── */
  function esArbol(nodo) {
    if (nodo == null || typeof nodo !== 'object' || !Number.isFinite(nodo.frequency)) return false;
    if (nodo.char !== undefined) return typeof nodo.char === 'string' && nodo.char.length > 0; // hoja
    const hijos = [nodo.left, nodo.right].filter((h) => h != null);
    return hijos.length > 0 && hijos.every(esArbol);
  }

  function contarHojas(nodo) {
    if (nodo.char !== undefined) return 1;
    return (nodo.left ? contarHojas(nodo.left) : 0) + (nodo.right ? contarHojas(nodo.right) : 0);
  }

  /* ── Posiciones: las hojas van en fila; cada nodo interno queda en medio de sus hijos ── */
  function disponer(raiz) {
    const nodos = [];
    const ramas = [];
    const hojas = [];
    let altura = 0;

    function recorrer(nodo, profundidad, codigo) {
      altura = Math.max(altura, profundidad);
      const actual = { frecuencia: nodo.frequency, profundidad, codigo };
      nodos.push(actual);

      if (nodo.char !== undefined) {
        actual.hoja = true;
        actual.char = nodo.char;
        actual.u = hojas.length; // posición horizontal, en "lugares de hoja"
        hojas.push(actual);
        return actual;
      }

      const izq = nodo.left ? recorrer(nodo.left, profundidad + 1, codigo + '0') : null;
      const der = nodo.right ? recorrer(nodo.right, profundidad + 1, codigo + '1') : null;
      if (izq) ramas.push({ padre: actual, hijo: izq, bit: '0' });
      if (der) ramas.push({ padre: actual, hijo: der, bit: '1' });
      actual.u = izq && der ? (izq.u + der.u) / 2 : (izq ?? der).u;
      return actual;
    }

    recorrer(raiz, 0, '');

    // De "lugares de hoja" a píxeles
    for (const n of nodos) {
      n.x = MARGEN + HOJA_W / 2 + n.u * SEP_X;
      n.y = MARGEN + n.profundidad * SEP_Y;
    }
    return { nodos, ramas, hojas, altura };
  }

  /* ── SVG ── */
  function el(tag, atributos = {}, texto) {
    const nodo = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(atributos)) nodo.setAttribute(k, v);
    if (texto !== undefined) nodo.textContent = texto;
    return nodo;
  }

  function dibujarSvg({ nodos, ramas, hojas, altura }) {
    const ancho = (hojas.length - 1) * SEP_X + HOJA_W + MARGEN * 2;
    const alto = altura * SEP_Y + HOJA_H + MARGEN * 2;
    const svg = el('svg', {
      viewBox: `0 0 ${ancho} ${alto}`,
      width: ancho,
      height: alto,
      role: 'img',
      'aria-label': `Árbol de Huffman con ${hojas.length} hojas. Rama izquierda es 0, rama derecha es 1.`,
    });

    // 1) Ramas (debajo de los nodos)
    for (const r of ramas) {
      svg.append(
        el('line', {
          class: r.bit === '0' ? 'e0' : 'e1',
          x1: r.padre.x,
          y1: r.padre.y,
          x2: r.hijo.x,
          y2: r.hijo.y,
        })
      );
    }

    // 2) Nodos
    for (const n of nodos) {
      const g = el('g');
      if (n.hoja) {
        const simbolo = visible(n.char);
        g.append(
          el('title', {}, `«${simbolo}» · frecuencia ${fmt(n.frecuencia)} · código ${n.codigo || '0'}`),
          el('rect', { class: 'lf', x: n.x - HOJA_W / 2, y: n.y, width: HOJA_W, height: HOJA_H, rx: 6 }),
          el('text', { class: 'lt', x: n.x, y: n.y + 19 }, simbolo),
          el('text', { class: 'lfq', x: n.x, y: n.y + 35 }, compacto.format(n.frecuencia))
        );
      } else {
        g.append(
          el('title', {}, `Nodo interno · frecuencia ${fmt(n.frecuencia)}`),
          el('circle', { class: 'in', cx: n.x, cy: n.y, r: RADIO })
        );
      }
      svg.append(g);
    }

    // 3) Etiquetas 0 / 1 junto a cada rama (encima de todo)
    for (const r of ramas) {
      const lado = r.bit === '0' ? -10 : 10;
      svg.append(
        el(
          'text',
          {
            class: r.bit === '0' ? 'e0t' : 'e1t',
            x: (r.padre.x + r.hijo.x) / 2 + lado,
            y: (r.padre.y + r.hijo.y) / 2 + 4,
          },
          r.bit
        )
      );
    }
    return svg;
  }

  /* ── Datos que acompañan al árbol (barra de etiqueta y estadísticas) ── */
  function crearStat(valor, etiquetaTxt, sub) {
    const stat = document.createElement('div');
    stat.className = 'stat';
    const v = document.createElement('span');
    v.className = 'stat-value';
    v.textContent = valor;
    const l = document.createElement('span');
    l.className = 'stat-label';
    l.textContent = etiquetaTxt;
    const s = document.createElement('span');
    s.className = 'stat-sub';
    s.textContent = sub;
    stat.append(v, l, s);
    return stat;
  }

  function pintarDatos({ nodos, hojas, altura }) {
    etiqueta.textContent = `${fmt(hojas.length)} símbolos · ${fmt(nodos.length)} nodos`;

    // Código más corto: el del símbolo más frecuente. Más largo: el del más raro.
    const porLargo = [...hojas].sort(
      (a, b) => a.codigo.length - b.codigo.length || b.frecuencia - a.frecuencia
    );
    const corto = porLargo[0];
    const largo = porLargo[porLargo.length - 1];
    const bits = (n) => `${n} ${n === 1 ? 'bit' : 'bits'}`;
    const codigoDe = (h) => (h.codigo || '0').length;

    statsBox.replaceChildren(
      crearStat(String(altura), 'altura', 'niveles bajo la raíz'),
      crearStat(bits(codigoDe(corto)), 'código más corto', `de «${visible(corto.char)}»`),
      crearStat(bits(codigoDe(largo)), 'código más largo', `de «${visible(largo.char)}»`)
    );
  }

  /* ── Scroll: que la raíz quede a la vista al abrir el árbol ── */
  let raizX = 0;
  let pendienteCentrar = false;

  function centrar() {
    cont.scrollLeft = Math.max(0, raizX - cont.clientWidth / 2);
    cont.scrollTop = 0;
    pendienteCentrar = false;
  }

  // El árbol se dibuja mientras la pestaña está oculta (clientWidth = 0): se centra
  // en cuanto el contenedor se vuelve visible.
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(() => {
      if (pendienteCentrar && cont.clientWidth > 0) centrar();
    }).observe(cont);
  }

  /* ── API pública ── */
  function limpiar() {
    cont.replaceChildren();
    statsBox.replaceChildren();
    etiqueta.textContent = '';
  }

  function aviso(texto) {
    limpiar();
    const p = document.createElement('p');
    p.className = 'hz-aviso';
    p.textContent = texto;
    cont.append(p);
  }

  function mostrar(arbol) {
    if (!esArbol(arbol)) {
      aviso('No se pudo dibujar el árbol: los datos recibidos no tienen el formato esperado.');
      return;
    }
    const total = contarHojas(arbol);
    if (total > MAX_HOJAS) {
      aviso(`El árbol tiene ${fmt(total)} hojas: es demasiado grande para dibujarlo. La tabla de códigos de abajo tiene todo el detalle.`);
      return;
    }

    const diseno = disponer(arbol);
    cont.replaceChildren(dibujarSvg(diseno));
    pintarDatos(diseno);

    raizX = diseno.nodos[0].x;
    pendienteCentrar = true;
    if (cont.clientWidth > 0) centrar();
  }

  document.addEventListener('huffman:resultado', (e) => {
    const arbol = e.detail?.arbol ?? e.detail?.tree; 
    if (arbol) mostrar(arbol);
  });

  window.Arbol = { mostrar, limpiar }; 
})();
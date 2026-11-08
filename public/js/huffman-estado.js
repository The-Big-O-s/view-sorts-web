// huffman-estado.js — estado de la página de Huffman, puente de eventos y pestañas (#82)
//
// Flujo:  fuente.js ──'fuente:comprimir'──▶ (este archivo) ──▶ API ──▶ 'huffman:resultado' ──▶ editor.js, tabla.js, resultados.js
(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);

  /* ── Estado central (mismo patrón que estado.js del visualizador) ── */
  const estado = {
    texto: null, // lo último que mandó fuente.js: { nombre, texto, meta }
    resultado: null, // lo que se mandó en 'huffman:resultado'
    vista: 'texto', // pestaña activa: 'texto' | 'arbol'
    ocupado: false, // hay una petición en curso
    toast: [],

    // motivo: 'texto' | 'resultado' | 'vista' | 'ocupado'
    fil(fn) {
      estado.toast.push(fn);
    },
    cambiar(motivo, datos) {
      Object.assign(estado, datos);
      estado.toast.forEach((fn) => fn(estado, motivo));
    },
    setVista(vista) {
      if (vista !== estado.vista) estado.cambiar('vista', { vista });
    },
  };

  /* ── Mensajes bajo la barra de fuente (el mismo #hz-msg que usa fuente.js) ── */
  function mostrarMensaje(txt, error = false) {
    const m = $('hz-msg');
    m.hidden = !txt;
    m.textContent = txt || '';
    m.classList.toggle('error', error);
  }

  /* ── Comprimir: texto → API → verificación → evento con el resultado ── */
  async function comprimir(fuente) {
    if (estado.ocupado) return; // ya hay una compresión en curso
    const boton = $('hz-run');
    boton.disabled = true;
    estado.cambiar('texto', { texto: fuente, ocupado: true });

    try {
      mostrarMensaje('Comprimiendo…');
      const r = await window.hzApi.comprimir(fuente.texto);

      // Verificar: descomprimir el .tbos y comparar con el original.
      // Si la verificación falla, el resultado de comprimir se muestra igual.
      let decodificado;
      let aviso = '';
      if (r.tbos) {
        mostrarMensaje('Verificando…');
        try {
          decodificado = await window.hzApi.descomprimir(r.tbos);
        } catch (err) {
          aviso = `No se pudo verificar la descompresión: ${err.message}`;
        }
      }

      const resultado = {
        ...r,
        nombre: fuente.nombre,
        meta: fuente.meta,
        texto: decodificado, // la vista "Normal" del editor sale de decodificar, no del .txt original
        ok: decodificado === undefined ? undefined : decodificado === fuente.texto,
      };
      estado.cambiar('resultado', { resultado });
      document.dispatchEvent(new CustomEvent('huffman:resultado', { detail: resultado }));
      mostrarMensaje(aviso, Boolean(aviso));
    } catch (err) {
      mostrarMensaje(err.message, true);
    } finally {
      estado.cambiar('ocupado', { ocupado: false });
      boton.disabled = false;
    }
  }

  document.addEventListener('fuente:comprimir', (e) => comprimir(e.detail));

  /* ── Pestañas: Texto / Árbol y códigos ── */
  const pestanas = [...document.querySelectorAll('#hz-tabs [role="tab"]')];

  function pintarVista(vista) {
    pestanas.forEach((t) => {
      const activa = t.dataset.tab === vista;
      t.classList.toggle('btn-active', activa);
      t.setAttribute('aria-selected', String(activa));
      t.tabIndex = activa ? 0 : -1;
      $(t.getAttribute('aria-controls')).hidden = !activa;
    });
  }

  estado.fil((s, motivo) => {
    if (motivo === 'vista') pintarVista(s.vista);
  });

  $('hz-tabs').addEventListener('click', (e) => {
    const tab = e.target.closest('[role="tab"]');
    if (tab) estado.setVista(tab.dataset.tab);
  });

  // Flechas izquierda/derecha para moverse entre pestañas con el teclado
  $('hz-tabs').addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const i = pestanas.findIndex((t) => t.dataset.tab === estado.vista);
    const paso = e.key === 'ArrowRight' ? 1 : pestanas.length - 1;
    const siguiente = pestanas[(i + paso) % pestanas.length];
    estado.setVista(siguiente.dataset.tab);
    siguiente.focus();
  });

  pintarVista(estado.vista);

  window.hzEstado = estado;
})();s
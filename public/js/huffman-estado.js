
(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);

  /* ── Estado central  ── */
  const estado = {
    texto: null,          // fuente cargada: { nombre, texto, meta }
    resultado: null,      // último resultado de comprimir (ya adaptado)
    vista: 'texto',       // pestaña activa: 'texto' | 'arbol'
    ocupado: false,       // hay una compresión en curso
    busqueda: { consulta: '', total: 0, resultados: [] }, // última búsqueda en Gutenberg
    buscando: false,      // hay una búsqueda en curso
    cargandoLibro: null,  // id del libro que se está descargando (null si ninguno)
    toast: [],

    // motivo: 'texto' | 'resultado' | 'vista' | 'ocupado' | 'busqueda' | 'buscando' | 'libro'
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

  /* ── Mensajes bajo la barra de fuente ── */
  function mostrarMensaje(txt, error = false) {
    const m = $('hz-msg');
    m.hidden = !txt;
    m.textContent = txt || '';
    m.classList.toggle('error', error);
  }

  /* ── Gutenberg: buscar y descargar libros ── */
  let pedidoBusqueda = 0; 
  async function buscarLibros(consulta) {
    const mio = ++pedidoBusqueda;
    estado.cambiar('buscando', { buscando: true });
    try {
      const r = await window.hzApi.buscarLibros(consulta);
      if (mio === pedidoBusqueda) {
        estado.cambiar('busqueda', {
          busqueda: { consulta: String(consulta).trim(), total: r.count, resultados: r.results },
        });
      }
      return r; 
    } finally {
      if (mio === pedidoBusqueda) estado.cambiar('buscando', { buscando: false });
    }
  }

  async function cargarLibro(libro) {
    if (estado.cargandoLibro != null) throw new Error('Ya se está descargando un libro.');
    estado.cambiar('libro', { cargandoLibro: libro.id });
    try {
      const texto = await window.hzApi.obtenerLibro(libro.id);
      return {
        nombre: libro.title,
        texto,
        meta: `${libro.authors || 'Autor desconocido'} · Project Gutenberg #${libro.id}`,
      }; 
    } finally {
      estado.cambiar('libro', { cargandoLibro: null });
    }
  }

  /* ── Comprimir: texto → API → verificación → evento con el resultado ── */
  async function comprimir(fuente) {
    if (estado.ocupado) return; 
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

  estado.buscarLibros = buscarLibros;
  estado.cargarLibro = cargarLibro;
  window.hzEstado = estado;
})();
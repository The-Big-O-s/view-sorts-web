
(() => {
  'use strict';

  const RUTAS = {
    comprimir: '/api/hencode', 
    descomprimir: '/api/hdecode',
  };
  const CAMPO_ARCHIVO = 'file'; 
  const FIRMA = [0x54, 0x42, 0x4f, 0x53]; 

  const inesperada = () => new Error('El servidor devolvió una respuesta inesperada.');

  
  function mensajeDeValidacion(detalle) {
    // FastAPI manda los errores 422 como una lista de objetos
    if (!Array.isArray(detalle)) return '';
    const largo = detalle.find((d) => d?.type === 'string_too_long');
    if (largo) {
      const max = largo.ctx?.max_length;
      return max
        ? `El texto supera el límite de ${max.toLocaleString('es-MX')} caracteres.`
        : 'El texto es demasiado largo.';
    }
    if (detalle.some((d) => d?.type === 'string_too_short')) return 'El texto está vacío.';
    return '';
  }

  async function leerError(respuesta) {
    let detalle;
    try {
      detalle = (await respuesta.json()).detail;
    } catch {
      // el cuerpo no era JSON
    }

    if (typeof detalle === 'string' && detalle) return detalle; 
    const validacion = mensajeDeValidacion(detalle);
    if (validacion) return validacion;
    if (respuesta.status === 413) return 'El texto es demasiado grande para el servidor.';
    if (respuesta.status === 422) return 'El servidor no pudo leer lo que se envió.';
    if (respuesta.status >= 500) return 'El servidor tuvo un problema. Intenta de nuevo.';
    return `El servidor respondió con error ${respuesta.status}.`;
  }

  /* ── Peticiones POST ── */
  async function enviar(ruta, opciones) {
    let respuesta;
    try {
      respuesta = await fetch(ruta, { method: 'POST', ...opciones });
    } catch {
      throw new Error('No se pudo conectar con el servidor.');
    }
    if (!respuesta.ok) throw new Error(await leerError(respuesta));

    const datos = await respuesta.json().catch(() => null);
    if (datos == null) throw inesperada();
    return datos;
  }

  // Cuerpo JSON: { "text": "..." }
  function pedirJson(ruta, objeto) {
    if (window.hzSimulado) return window.hzSimulado(ruta, objeto); 
    return enviar(ruta, {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(objeto),
    });
  }

  
  function pedirArchivo(ruta, bytes) {
    if (window.hzSimulado) return window.hzSimulado(ruta, bytes);
    const form = new FormData();
    form.append(CAMPO_ARCHIVO, new Blob([bytes]), 'comprimido.tbos');
    return enviar(ruta, { body: form });
  }

  /* ── Base64 y formato .tbos ── */
  function decodificarTbos(b64) {
    try {
      const bin = atob(b64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      return bytes;
    } catch {
      throw new Error('El servidor devolvió un archivo .tbos inválido.');
    }
  }

  // El .tbos es: "TBOS" + tamaño del encabezado (4 bytes) + encabezado JSON + datos codificados
  function cuerpoDelTbos(tbos) {
    const firmaOk = tbos.length >= 8 && FIRMA.every((b, i) => tbos[i] === b);
    if (!firmaOk) throw new Error('El servidor devolvió un archivo .tbos inválido.');
    const tamEncabezado = new DataView(tbos.buffer, tbos.byteOffset, tbos.byteLength).getUint32(4);
    if (8 + tamEncabezado > tbos.length) throw new Error('El servidor devolvió un archivo .tbos inválido.');
    return tbos.subarray(8 + tamEncabezado);
  }

  /* ── De la respuesta del backend a lo que esperan editor.js, tabla.js y resultados.js ── */
  const esNumero = (x) => Number.isFinite(x) && x >= 0;
  const esObjeto = (x) => x != null && typeof x === 'object';

  // A) Formato de /api/hencode
  function adaptarHencode(r, texto) {
    const frec = r.frequencies;
    const codigos = r.codes;
    const chars = esObjeto(frec) ? Object.keys(frec) : [];
    const valido =
      chars.length > 0 &&
      esObjeto(codigos) &&
      chars.every((ch) => esNumero(frec[ch]) && typeof codigos[ch] === 'string') &&
      esObjeto(r.tree) &&
      esNumero(r.encoded_bits) &&
      esObjeto(r.tbos) &&
      typeof r.tbos.content_base64 === 'string';
    if (!valido) throw inesperada();

    const tbos = decodificarTbos(r.tbos.content_base64);
    return {
      n: chars.reduce((suma, ch) => suma + frec[ch], 0),
      bytesOriginal: new TextEncoder().encode(texto).length,
      bitsTotales: r.encoded_bits,
      bytesTbos: tbos.length,
      simbolos: chars.map((ch) => ({ ch, freq: frec[ch], codigo: codigos[ch] })),
      arbol: r.tree, 
      tbos, 
      bytes: cuerpoDelTbos(tbos), 
    };
  }

  function adaptarStats(r) {
    const s = r.stats;
    const valido =
      esObjeto(s) &&
      esNumero(s.chars) &&
      esNumero(s.original_bytes) &&
      Array.isArray(r.symbols) &&
      r.symbols.length > 0 &&
      r.symbols.every((x) => esObjeto(x) && typeof x.char === 'string' && x.char.length > 0 && esNumero(x.frequency) && typeof x.code === 'string') &&
      esObjeto(r.tree) &&
      typeof r.encoded === 'string';
    if (!valido) throw inesperada();

    return {
      n: s.chars,
      bytesOriginal: s.original_bytes,
      bitsTotales: r.encoded.length,
      simbolos: r.symbols.map((x) => ({ ch: x.char, freq: x.frequency, codigo: x.code })),
      arbol: r.tree,
      bits: r.encoded, 
      tbos: null, 
    };
  }

  function adaptarCompresion(r, texto) {
    if (r?.tbos?.content_base64 !== undefined) return adaptarHencode(r, texto);
    if (r?.stats && typeof r.encoded === 'string') return adaptarStats(r);
    throw inesperada();
  }

  /* ── API pública ── */
  async function comprimir(texto) {
    return adaptarCompresion(await pedirJson(RUTAS.comprimir, { text: texto }), texto);
  }

  async function descomprimir(tbos) {
    const r = await pedirArchivo(RUTAS.descomprimir, tbos);
    if (typeof r.text !== 'string') throw inesperada();
    return r.text;
  }

  window.hzApi = { comprimir, descomprimir, RUTAS };
})();
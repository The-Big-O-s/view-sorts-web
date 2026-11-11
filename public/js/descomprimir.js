(() => {
  'use strict';
 
  const $ = id => document.getElementById(id);
  const MAX_BYTES = 15 * 1024 * 1024;     
  const FIRMA = [0x54, 0x42, 0x4f, 0x53];   
 
  let ocupado = false;
 
  function mensaje(txt, error = false) {
    const m = $('hz-msg');
    m.hidden = !txt; m.textContent = txt || ''; m.classList.toggle('error', error);
  }

  function datosDelTbos(b) {
    const malo = new Error('No parece un archivo .tbos válido (falta la firma TBOS o está incompleto).');
    if (b.length < 8 || !FIRMA.every((x, i) => b[i] === x)) throw malo;
    const tamEncabezado = new DataView(b.buffer, b.byteOffset, b.byteLength).getUint32(4);
    if (8 + tamEncabezado > b.length) throw malo;
    return b.subarray(8 + tamEncabezado);
  }
 
  async function descomprimir(archivo) {
    if (!archivo || ocupado) return;
    if (!/\.tbos$/i.test(archivo.name)) return mensaje('Selecciona un archivo .tbos.', true);
    if (archivo.size > MAX_BYTES) return mensaje('El archivo supera 15 MB.', true);
    if (!window.hzApi) return mensaje('La conexión con el servidor no está lista.', true);
    if (window.hzEstado?.ocupado) return mensaje('Espera a que termine la compresión.', true);
 
    ocupado = true;
    try {
      const bytes = new Uint8Array(await archivo.arrayBuffer());
      const datos = datosDelTbos(bytes);
      mensaje('Descomprimiendo…');
      const texto = await window.hzApi.descomprimir(bytes);
      if (!texto) throw new Error('El servidor devolvió un texto vacío.');
 
      const resultado = {
        nombre: archivo.name.replace(/\.tbos$/i, ''),
        meta: 'Archivo .tbos',
        tbos: bytes,                                   
        bytes: datos,                                  
        texto,                                       
        n: [...texto].length,
        bytesOriginal: new TextEncoder().encode(texto).length,
        bytesTbos: bytes.length,
        bitsTotales: datos.length * 8,                 // por bytes completos (el .tbos no trae los bits exactos)
      };
      document.dispatchEvent(new CustomEvent('huffman:resultado', { detail: resultado }));
 
      window.hzEstado?.setVista('texto');              // asegurar que se vea la pestaña del editor
      if (!$('hz-ver-txt').disabled) $('hz-ver-txt').click(); // y mostrar el texto, no los bits
      mensaje('');
    } catch (err) {
      mensaje(err.message, true);                      // si falla, se conserva lo que ya había
    } finally {
      ocupado = false;
    }
  }
 
  $('hz-tbos-file').addEventListener('change', e => {
    const f = e.target.files[0];
    e.target.value = '';                               // permite volver a elegir el mismo archivo
    descomprimir(f);
  });
})();
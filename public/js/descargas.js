// descargas.js — botones "Descargar .tbos" y "Descargar .txt decodificado".
(() => {
  'use strict';
 
  const $ = id => document.getElementById(id);
  const btnTbos = $('hz-dl-huf');  
  const btnTxt = $('hz-dl-txt');
 
  let actual = null; // último resultado
 
  const hayTbos = () => ArrayBuffer.isView(actual?.tbos) && actual.tbos.byteLength > 0;
  const hayTexto = () => typeof actual?.texto === 'string';
 
  function nombreBase(nombre) {
    return String(nombre ?? '')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')   // quita acentos
      .replace(/[^\w.-]+/g, '-')                          // todo lo raro → guion
      .replace(/^[-.]+|[-.]+$/g, '')                      // sin guiones ni puntos en los extremos
      .slice(0, 80).toLowerCase() || 'huffman';
  }
 
  function descargar(blob, archivo) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = archivo;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
 
  function actualizarBotones() {
    btnTbos.disabled = !hayTbos();
    btnTbos.title = hayTbos() ? '' : 'El servidor no entregó el archivo .tbos';
    btnTxt.disabled = !hayTexto();
    btnTxt.title = hayTexto() ? '' : 'No hay texto decodificado para descargar';
  }
 
  btnTbos.addEventListener('click', () => {
    if (!hayTbos()) return;
    descargar(new Blob([actual.tbos], { type: 'application/octet-stream' }), nombreBase(actual.nombre) + '.tbos');
  });
 
  btnTxt.addEventListener('click', () => {
    if (!hayTexto()) return;
    descargar(new Blob([actual.texto], { type: 'text/plain;charset=utf-8' }), nombreBase(actual.nombre) + '-decodificado.txt');
  });
 
  document.addEventListener('huffman:resultado', e => { actual = e.detail; actualizarBotones(); });
  actualizarBotones();
})();

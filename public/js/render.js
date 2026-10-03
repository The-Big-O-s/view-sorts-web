// render.js — Renderizado visual del arreglo en el <canvas>
const canvas = document.getElementById('canvas-main');
const ctx = canvas.getContext('2d');

// Colores para la futura animacion
const COLORES = {
  normal: '#2563eb',    // elemento sin ordenar
  comparing: '#f59e0b', // comparando
  swap: '#ef4444',      // intercambio
  pivot: '#8b5cf6',     // pivote
  min: '#06b6d4',       // mínimo / clave
  sorted: '#10b981'     // ya en su lugar
};

function ajustarTamanoCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function colorParaIndice(i, resaltados) {
  if (resaltados.sorted?.includes(i)) return COLORES.sorted;
  if (resaltados.swap?.includes(i)) return COLORES.swap;
  if (resaltados.comparing?.includes(i)) return COLORES.comparing;
  if (i === resaltados.pivot) return COLORES.pivot;
  if (i === resaltados.min) return COLORES.min;
  return COLORES.normal;
}

function dibujarArreglo(arreglo, resaltados = {}) {
  const ancho = canvas.getBoundingClientRect().width;
  const alto = canvas.getBoundingClientRect().height;

  ctx.clearRect(0, 0, ancho, alto);

  if (arreglo.length === 0) return;

  const maxValor = Math.max(...arreglo);
  const espacio = 2;
  const anchoBarra = (ancho - espacio * (arreglo.length - 1)) / arreglo.length;

  arreglo.forEach((valor, i) => {
    const alturaBarra = (valor / maxValor) * alto;
    const x = i * (anchoBarra + espacio);
    const y = alto - alturaBarra;

    ctx.fillStyle = colorParaIndice(i, resaltados);
    ctx.fillRect(x, y, anchoBarra, alturaBarra);
  });
}

function redibujarSinResaltados(arreglo) {
  dibujarArreglo(arreglo, {});
}

window.addEventListener('resize', () => {
  ajustarTamanoCanvas();
  dibujarArreglo(window.arrayManager.getArray());
});

ajustarTamanoCanvas();
window.arrayManager.onChange = redibujarSinResaltados;
dibujarArreglo(window.arrayManager.getArray());

window.dibujarArreglo = dibujarArreglo;
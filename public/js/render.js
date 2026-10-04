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

function ajustarTamanoCanvas(cv = canvas, c = ctx) {
  const dpr = window.devicePixelRatio || 1;
  const rect = cv.getBoundingClientRect();
  cv.width = rect.width * dpr;
  cv.height = rect.height * dpr;
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function colorParaIndice(i, resaltados) {
  if (resaltados.sorted?.includes(i)) return COLORES.sorted;
  if (resaltados.swap?.includes(i)) return COLORES.swap;
  if (resaltados.comparing?.includes(i)) return COLORES.comparing;
  if (i === resaltados.pivot) return COLORES.pivot;
  if (i === resaltados.min) return COLORES.min;
  return COLORES.normal;
}

function pasoAResaltados(paso) {
  const validos = (lista = []) => lista.filter(i => i >= 0); // gnome manda -1 en i = 0
  return {
    comparing: validos(paso.compare),
    swap: paso.swapped ? validos(paso.swap?.length ? paso.swap : paso.compare) : [],
    sorted: paso.sorted_index ?? [],
    pivot: paso.pivot ?? undefined,
    min: paso.key ?? undefined,
  };
}
function dibujarArreglo(arreglo, resaltados = {}, cv = canvas, c = ctx) {
  const { width: ancho, height: alto } = cv.getBoundingClientRect();
  
  c.clearRect(0, 0, ancho, alto);
  if (arreglo.length === 0) return;

  const maxValor = Math.max(...arreglo, 1);
  const espacio = 2;
  const anchoBarra = (ancho - espacio * (arreglo.length - 1)) / arreglo.length;

  arreglo.forEach((valor, i) => {
    const alturaBarra = (valor / maxValor) * alto;
    const x = i * (anchoBarra + espacio);
    const y = alto - alturaBarra;

    c.fillStyle = colorParaIndice(i, resaltados);
    c.fillRect(x, y, anchoBarra, alturaBarra);
  });
}

function redibujarSinResaltados(arreglo) {
  dibujarArreglo(arreglo, {});
}

window.addEventListener('resize', () => {
  ajustarTamanoCanvas();
  dibujarArreglo(window.arrayManager.getArray());
});

window.appState.fil((estado, motivo) => {
  if (motivo === 'arreglo') redibujarSinResaltados(estado.arreglo);
});

ajustarTamanoCanvas();
dibujarArreglo(window.arrayManager.getArray());

window.dibujarArreglo = dibujarArreglo;
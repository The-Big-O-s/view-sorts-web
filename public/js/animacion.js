// animacion.js — recorre los steps del backend y los conecta con el estado central y el dibujo

// ---- 1. Traducir cada formato de paso al vocabulario único que entiende dibujarArreglo ----
const FAMILIA_POR_ALGORITMO = {
  Bubble: 'estandar',
  Selection: 'estandar',
  Gnome: 'estandar',
  Exchange: 'estandar',
  Merge: 'estandar',
  Stooge: 'estandar',
  Quick: 'quicksort',
  Insertion: 'insertion'
};

function normalizarPaso(paso, metodo) {
  const familia = FAMILIA_POR_ALGORITMO[metodo] ?? 'estandar';

  if (familia === 'quicksort') {
    return {
      array: paso.array,
      comparing: paso.compare ?? [],
      swap: paso.swap ?? [],
      sorted: paso.sorted_index ?? [],
      pivot: paso.pivot
    };
  }

  if (familia === 'insertion') {
    return {
      array: paso.array,
      comparing: paso.compare ?? [],
      swap: [],
      sorted: paso.sorted_index ?? [],
      min: paso.key
    };
  }

  // estandar: Bubble, Selection, Gnome, Exchange, Merge, Stooge
  return {
    array: paso.array,
    comparing: paso.compare ?? [],
    swap: paso.swapped ? (paso.compare ?? []) : [],
    sorted: paso.sorted_index ?? []
  };
}

// ---- 2. Referencias al DOM que faltaban por usar ----
const stepLabel = document.getElementById('step-label');
const inputScrub = document.getElementById('input-scrub');
const pctLabel = document.getElementById('pct-label');
const btnEnd = document.getElementById('btn-end');

// ---- 3. Pedir los pasos al backend y guardarlos en el estado central ----
async function cargarPasosDelBackend() {
  try {
    const datos = await window.ConexionAlBackend(); // ya viene como { steps: [...] }
    window.appState.setPasos(datos.steps);
  } catch (err) {
    // api.js ya mostró el error en su propia barra (#api-status); aquí solo lo registramos
    console.error('No se pudieron obtener los pasos:', err);
  }
}

// ---- 4. Dibujar exactamente lo que diga el estado en este momento ----
function dibujarPasoActual() {
  const { pasos, indicePaso, algoritmo, arreglo } = window.appState;

  if (pasos.length === 0) {
    dibujarArreglo(arreglo, {}); // todavía no hay pasos calculados: solo el arreglo plano
    actualizarIndicadores(0, 0);
    return;
  }

  const paso = pasos[indicePaso];
  const resaltados = normalizarPaso(paso, algoritmo);
  dibujarArreglo(resaltados.array, resaltados);
  actualizarIndicadores(indicePaso, pasos.length - 1);
}

function actualizarIndicadores(indice, total) {
  stepLabel.textContent = `Paso ${indice} / ${total}`;
  inputScrub.max = total;
  inputScrub.value = indice;
  pctLabel.textContent = total === 0 ? '0%' : `${Math.round((indice / total) * 100)}%`;
}

// ---- 5. Conectar con el reproductor (main.js) ----
window.controls.onStep = () => window.appState.siguientePaso();
window.controls.onReset = () => window.appState.irAPaso(0);

inputScrub.addEventListener('input', () => {
  window.appState.irAPaso(Number(inputScrub.value));
});

btnEnd?.addEventListener('click', () => {
  window.appState.irAPaso(window.appState.pasos.length - 1);
});

// ---- 6. Reaccionar a CUALQUIER cambio del estado central ----
window.appState.fil((estado, motivo) => {
  if (motivo === 'algoritmo' || motivo === 'arreglo') {
    cargarPasosDelBackend(); // cambió el algoritmo o el arreglo: hay que recalcular los pasos
  }
  dibujarPasoActual(); // sin importar el motivo, refleja el estado actual en el canvas
});

// ---- 7. Carga inicial ----
dibujarPasoActual();     // dibuja el arreglo plano mientras llega la primera respuesta
cargarPasosDelBackend(); // pide los pasos para el algoritmo/arreglo iniciales
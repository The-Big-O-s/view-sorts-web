// animacion.js — recorre los pasos del backend y los conecta con el estado central y el dibujo

// Formato de pasos de los algoritmos
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

  // Mismo formato
  return {
    array: paso.array,
    comparing: paso.compare ?? [],
    swap: paso.swapped ? (paso.compare ?? []) : [],
    sorted: paso.sorted_index ?? []
  };
}


const stepLabel = document.getElementById('step-label');
const inputScrub = document.getElementById('input-scrub');
const pctLabel = document.getElementById('pct-label');
const btnEnd = document.getElementById('btn-end');

//Pedir los pasos
async function cargarPasosDelBackend() {
  try {
    
    const datos = await window.ConexionAlBackend(); 
    window.appState.setPasos(datos.steps);
  } catch (err) {
    console.error('No se pudieron obtener los pasos:', err);
  }
}

// Se muestra exactamente lo que diga el estado en este momento
function dibujarPasoActual() {
  const { pasos, indicePaso, algoritmo, arreglo } = window.appState;

  if (pasos.length === 0) {
    dibujarArreglo(arreglo, {}); //Solo se dibuja el arreglo
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

// Conectar con el main.js
window.controls.onStep = () => window.appState.siguientePaso();
window.controls.onReset = () => window.appState.irAPaso(0);

inputScrub.addEventListener('input', () => {
  window.appState.irAPaso(Number(inputScrub.value));
});

btnEnd?.addEventListener('click', () => {
  window.appState.irAPaso(window.appState.pasos.length - 1);
});

// Reaccionar a cualquier cambio del estado central 
window.appState.fil((estado, motivo) => {
  if (motivo === 'algoritmo' || motivo === 'arreglo') {
    cargarPasosDelBackend(); //si cambia el algoritmo o el arreglo, se piden los pasos de nuevo
  }
  dibujarPasoActual(); // siempre dibuja el paso actual
});

dibujarPasoActual();     // dibuja el arreglo plano mientras llega la primera respuesta
cargarPasosDelBackend(); // pide los pasos para el algoritmo/arreglo iniciales
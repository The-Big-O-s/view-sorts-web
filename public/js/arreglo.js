// Control del arreglo: tamaño, generación aleatoria y entrada manual
const MAX_ELEMENTOS = 50;
const LIMITE_STOOGE = 20;

const inputSize = document.getElementById('input-size');
const sizeLabel = document.getElementById('size-label');
const btnRandom = document.getElementById('btn-random');
const inputManual = document.getElementById('input-manual');
const btnManual = document.getElementById('btn-manual');
const manualError = document.getElementById('manual-error');
const stoogeWarning = document.getElementById('stooge-warning');

let arregloActual = [];

const arrayManager = {
  getArray: () => arregloActual,
  getArrayParaBackend: () => {
    const algo = window.algoSelector.getSelected();
    return algo === 'Stooge' ? arregloActual.slice(0, LIMITE_STOOGE) : arregloActual;
  },
  onChange: null, 
};

function generarAleatorio(cantidad) {
  const arr = [];
  for (let i = 0; i < cantidad; i++) {
    arr.push(Math.floor(Math.random() * 95) + 5);
  }
  return arr;
}

function actualizarArreglo(nuevoArreglo) {
  arregloActual = nuevoArreglo;
  arrayManager.onChange?.(arregloActual);
}

function actualizarEtiquetaTamano() {
  sizeLabel.textContent = inputSize.value;
}

function mostrarErrorManual(mensaje) {
  manualError.textContent = mensaje;
  manualError.hidden = false;
}

// ---- Eventos ----

inputSize.addEventListener('input', actualizarEtiquetaTamano);

btnRandom.addEventListener('click', () => {
  const cantidad = Number(inputSize.value);
  actualizarArreglo(generarAleatorio(cantidad));
});

btnManual.addEventListener('click', () => {
  const numeros = inputManual.value
    .split(',')
    .map(n => n.trim())
    .filter(n => n !== '');

  if (numeros.length === 0) {
    mostrarErrorManual('Escribe al menos un número.');
    return;
  }
  if (numeros.length > MAX_ELEMENTOS) {
    mostrarErrorManual(`Máximo ${MAX_ELEMENTOS} elementos.`);
    return;
  }

  const valores = numeros.map(Number);
  if (valores.some(Number.isNaN)) {
    mostrarErrorManual('Todos los números deben estar separados por comas.');
    return;
  }

  manualError.hidden = true;
  inputSize.value = valores.length;
  actualizarEtiquetaTamano();
  actualizarArreglo(valores);
});

function manejarCambioAlgoritmo(algo) {
  stoogeWarning.hidden = algo !== 'Stooge';
}

window.algoSelector.onChange = manejarCambioAlgoritmo;
manejarCambioAlgoritmo(window.algoSelector.getSelected()); 

// ---- Inicializar ----
actualizarEtiquetaTamano();
actualizarArreglo(generarAleatorio(Number(inputSize.value)));

window.arrayManager = arrayManager;
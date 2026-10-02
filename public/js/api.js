// api.js — comunicación con el backend de Python
const BASE_URL = '/api';


const RUTAS_POR_ALGORITMO = {
  Bubble: 'bubble',
  Selection: 'selection',
  Insertion: 'insertion',
  Quick: 'quick',
  Gnome: 'gnome',
  Stooge: 'stooge',
  Exchange: 'exchange',
  Merge: 'merge'
};

async function ConexionAlBackend() {
  const arreglo = window.arrayManager.getArrayParaBackend();
  const metodo = window.algoSelector.getSelected();

  const ruta = RUTAS_POR_ALGORITMO[metodo];
  if (!ruta) {
    throw new Error(`No hay una ruta de API para "${metodo}".`);
  }

  const url = `${BASE_URL}/${ruta}`;
  const payload = { array: arreglo };

  const respuesta = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!respuesta.ok) {
    throw new Error(`El backend respondió con error: ${respuesta.status}`);
  }

  const pasos = await respuesta.json();
  return pasos;
}

window.ConexionAlBackend = ConexionAlBackend;

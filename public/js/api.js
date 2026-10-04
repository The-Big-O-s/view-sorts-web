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

// Estado de la conexión: 'ok' | 'loading' | 'error'
const api = {
  estado: 'ok',
  onEstado: null,
};

function obtenerBarraEstado() {
  let barra = document.getElementById('api-status');
  if (!barra) {
    barra = document.createElement('div');
    barra.id = 'api-status';
    barra.hidden = true;
    (document.getElementById('manual-error') ?? document.getElementById('controls'))?.after(barra);
  }
  return barra;
}

function setEstado(estado, mensaje = '') {
  api.estado = estado;
  const barra = obtenerBarraEstado();
  barra.hidden = estado === 'ok';
  barra.textContent = mensaje;
  barra.dataset.state = estado;
  api.onEstado?.(estado, mensaje);
}

async function leerError(respuesta) {
  let detalle = '';
  try {
    const cuerpo = await respuesta.json();
    if (typeof cuerpo.detail === 'string') detalle = cuerpo.detail;
  } catch {
    // el cuerpo no era JSON
  }
 
  if (respuesta.status === 400) return detalle || 'Petición inválida.';
  if (respuesta.status === 422) return 'El arreglo no es válido: usa solo números enteros (de 1 a 50 elementos).';
  if (respuesta.status >= 500) return 'El servidor tuvo un problema. Intenta de nuevo.';
  return `El backend respondió con error ${respuesta.status}.`;
}
async function ConexionAlBackend() {
  const arreglo = window.arrayManager.getArrayParaBackend();
  const metodo = window.algoSelector.getSelected();

  const ruta = RUTAS_POR_ALGORITMO[metodo];
  if (!ruta) {
    const mensaje = `No hay una ruta de API para "${metodo}".`;
    setEstado('error', mensaje);
    throw new Error(mensaje);
  }

  const url = `${BASE_URL}/${ruta}`;
  const payload = { array: arreglo };

  setEstado('loading', 'Calculando pasos…');

  try {
    const respuesta = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

  if (!respuesta.ok) throw new Error(await leerError(respuesta));

  const datos = await respuesta.json().catch(() => null);
    if (!Array.isArray(datos?.steps) || datos.steps.length === 0) {
      throw new Error('El backend devolvió una respuesta inesperada.');
    }
  setEstado('ok');
      return datos;
    } catch (err) {
      const mensaje = err instanceof TypeError
        ? 'No se pudo conectar con el backend.'
        : err.message;
      setEstado('error', mensaje);
      throw new Error(mensaje);
    }
  }
window.api = api;
window.ConexionAlBackend = ConexionAlBackend;

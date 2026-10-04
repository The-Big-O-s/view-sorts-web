// estado.js — estado central: algoritmo, arreglo y paso actual de la animación
const appState = {
  algoritmo: null,
  arreglo: [],
  pasos: [], // BK(steps)
  indicePaso: 0,  //ini
  toast: [],
 
  // motivo: 'algoritmo' | 'arreglo' | 'pasos' | 'paso'
  fil(fn) { appState.toast.push(fn); },
 
  cambiar(motivo, datos) {
    Object.assign(appState, datos);
    appState.toast.forEach(fn => fn(appState, motivo));
  },
 
  // Cambiar algoritmo o arreglo invalida los pasos anteriores
  setAlgoritmo(algoritmo) {
    if (algoritmo !== appState.algoritmo) appState.cambiar('algoritmo', { algoritmo, pasos: [], indicePaso: 0 });
  },
  setArreglo(arreglo) {
    appState.cambiar('arreglo', { arreglo: [...arreglo], pasos: [], indicePaso: 0 });
  },
  setPasos(pasos) {
    appState.cambiar('pasos', { pasos, indicePaso: 0 });
  },
 
  irAPaso(i) {
    const max = appState.pasos.length - 1;
    const indicePaso = Math.max(0, Math.min(i, max));
    if (max >= 0 && indicePaso !== appState.indicePaso) appState.cambiar('paso', { indicePaso });
  },
 
  // false 
  siguientePaso() {
    if (appState.indicePaso >= appState.pasos.length - 1) return false;
    appState.irAPaso(appState.indicePaso + 1);
    return true;
  },
};
 
// Conexión
const algoViejo = window.algoSelector.onChange;
window.algoSelector.onChange = (algo) => { algoViejo?.(algo); appState.setAlgoritmo(algo); };
 
const arregloViejo = window.arrayManager.onChange;
window.arrayManager.onChange = (arr) => { arregloViejo?.(arr); appState.setArreglo(arr); };
 
// Valores iniciales
appState.setAlgoritmo(window.algoSelector.getSelected());
appState.setArreglo(window.arrayManager.getArray());
 
window.appState = appState;
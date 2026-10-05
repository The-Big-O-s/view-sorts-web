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
const INFO={
  Bubble:['Compara pares vecinos y los intercambia si están desordenados; el mayor "sube" al final.','n','n²','n²'],
  Selection:['Busca el mínimo del resto y lo coloca en su posición.','n²','n²','n²'],
  Insertion:['Toma cada elemento y lo inserta en su lugar dentro de la parte ya ordenada.','n','n²','n²'],
  Quick:['Elige un pivote y separa menores y mayores; repite en cada lado.','n log n','n log n','n²'],
  Gnome:['Avanza si el par está bien; si no, intercambia y retrocede un paso.','n','n²','n²'],
  Stooge:['Ordena recursivamente los primeros 2/3, los últimos 2/3 y otra vez los primeros 2/3.','n^2.71','n^2.71','n^2.71'],
  Exchange:['Compara el elemento i con todos los siguientes e intercambia si están desordenados.','n²','n²','n²'],
  Merge:['Divide el arreglo a la mitad, ordena cada parte y las mezcla.','n log n','n log n','n log n']
};
const algoTitle=document.getElementById('algo-title'),algoDesc=document.getElementById('algo-desc'),cxBox=document.getElementById('complexities'),tplCx=document.getElementById('tpl-complexity');
let algoMostrado=null;

function mostrarInfo(){
  const a=window.appState.algoritmo;
  if(a===algoMostrado||!INFO[a])return;
  algoMostrado=a;
  const[desc,...cx]=INFO[a];
  algoTitle.textContent=a;
  algoDesc.textContent=desc;
  cxBox.replaceChildren(...['Mejor','Promedio','Peor'].map((l,i)=>{
    const n=tplCx.content.firstElementChild.cloneNode(true);
    n.querySelector('.cx-label').textContent=l;
    n.querySelector('.cx-value').textContent=`O(${cx[i]})`;
    return n;
  }));
}
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
const statsBox=document.getElementById('stats'),tplStat=document.getElementById('tpl-stat');
const crearStat=l=>{const n=tplStat.content.firstElementChild.cloneNode(true);n.querySelector('.stat-label').textContent=l;statsBox.append(n);return{valor:n.querySelector('.stat-value'),sub:n.querySelector('.stat-sub')}};
const statComps=crearStat('comparaciones'),statMovs=crearStat('movimientos');
let pasosCache=null,comps=[],movs=[],msUltimo=0;

function actualizarContadores(){
  const{pasos,indicePaso:i}=window.appState;
  if(pasos!==pasosCache){
    pasosCache=pasos;comps=[];movs=[];let c=0,m=0;
    pasos.forEach(s=>{c+=s.compare?.length?1:0;m+=s.swapped?1:0;comps.push(c);movs.push(m)});
  }
  statComps.valor.textContent=comps[i]??0;
  statMovs.valor.textContent=movs[i]??0;
  statComps.sub.textContent=comps.length?`de ${comps.at(-1)} en total`:'';
  statMovs.sub.textContent=movs.length?`de ${movs.at(-1)} en total`:'';
}

const[srName,srComps,srMoves,srTotal,srBarTotal,srBarLive,srMs,srAvg]=['name','comps','moves','total','bar-total','bar-live','ms','avg'].map(x=>document.getElementById('sr-'+x));

function actualizarTabla(){
  const{pasos,indicePaso:i,algoritmo}=window.appState;
  srName.textContent=algoritmo??'';
  if(!pasos.length){
    srComps.textContent=srMoves.textContent=srTotal.textContent=srMs.textContent=srAvg.textContent='—';
    srBarTotal.style.width=srBarLive.style.width='0%';return;
  }
  const c=comps.at(-1),m=movs.at(-1),t=c+m;
  srComps.textContent=c;srMoves.textContent=m;srTotal.textContent=t;
  srBarTotal.style.width='100%';
  srBarLive.style.width=`${t?(comps[i]+movs[i])/t*100:0}%`;
  srMs.textContent=`${msUltimo.toFixed(0)} ms`;
  srAvg.textContent=`${(msUltimo/pasos.length).toFixed(2)} ms/paso`;
}

//Pedir los pasos
async function cargarPasosDelBackend() {
  try{const t=performance.now(),d=await window.ConexionAlBackend();msUltimo=performance.now()-t;window.appState.setPasos(d.steps)}
  catch(e){console.error('No se pudieron obtener los pasos:',e)}
}

// Se muestra exactamente lo que diga el estado en este momento
function dibujarPasoActual() {
  const { pasos, indicePaso, algoritmo, arreglo } = window.appState;

    actualizarContadores();
    actualizarTabla();
    mostrarInfo();

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
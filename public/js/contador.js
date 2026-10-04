// contador.js — comparaciones y movimientos acumulados hasta el paso actual
(() => {
  const cont = document.getElementById('stats');
  const tpl = document.getElementById('tpl-stat');
  let comps = [], movs = [];

  function crearStat(etiqueta) {
    const nodo = tpl.content.firstElementChild.cloneNode(true);
    nodo.querySelector('.stat-label').textContent = etiqueta;
    cont.append(nodo);
    return {
      valor: nodo.querySelector('.stat-value'),
      sub: nodo.querySelector('.stat-sub'),
    };
  }

  const sComps = crearStat('comparaciones');
  const sMovs = crearStat('movimientos');

  function acumular(pasos) {
    let c = 0, m = 0;
    comps = []; movs = [];
    pasos.forEach(p => {
      if (p.compare?.length) c++;
      if (p.swapped) m++;
      comps.push(c);
      movs.push(m);
    });
  }

  function pintar(estado) {
    const i = estado.indicePaso;
    const hay = comps.length > 0;
    sComps.valor.textContent = hay ? comps[i] : 0;
    sMovs.valor.textContent = hay ? movs[i] : 0;
    sComps.sub.textContent = hay ? `de ${comps.at(-1)}` : '';
    sMovs.sub.textContent = hay ? `de ${movs.at(-1)}` : '';
  }

  window.appState.fil((estado, motivo) => {
    if (motivo === 'pasos') acumular(estado.pasos);
    if (motivo === 'algoritmo' || motivo === 'arreglo') { comps = []; movs = []; }
    pintar(estado);
  });

  pintar(window.appState);
})();
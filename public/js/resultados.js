
(() => {
  'use strict';

  const statsBox = document.getElementById('hz-stats-texto');
  const cmpBox = document.getElementById('hz-cmp');

  cmpBox.setAttribute('role', 'group');
  cmpBox.setAttribute('aria-label', 'Comparación de tamaños');

  // ---- Formato de números (es-MX: coma de miles, punto decimal) ----
  const formato = (decimales) =>
    new Intl.NumberFormat('es-MX', {
      minimumFractionDigits: decimales,
      maximumFractionDigits: decimales,
    });
  const f0 = formato(0);
  const f1 = formato(1);
  const f2 = formato(2);

  function formatearBytes(n) {
    if (n < 1024) return `${f0.format(n)} B`;
    if (n < 1024 ** 2) return `${f1.format(n / 1024)} KB`;
    return `${f2.format(n / 1024 ** 2)} MB`;
  }

  // ---- Piezas de la interfaz (solo textContent, nunca innerHTML) ----
  function crearStat(valor, etiqueta, sub) {
    const stat = document.createElement('div');
    stat.className = 'stat';

    const v = document.createElement('span');
    v.className = 'stat-value';
    v.textContent = valor;

    const l = document.createElement('span');
    l.className = 'stat-label';
    l.textContent = etiqueta;

    const s = document.createElement('span');
    s.className = 'stat-sub';
    s.textContent = sub;

    stat.append(v, l, s);
    return stat;
  }

  function crearBarra(etiqueta, bytes, base, clase) {
    const barra = document.createElement('div');
    barra.className = 'hz-bar';

    const relleno = document.createElement('i');
    if (clase) relleno.className = clase;
    relleno.style.width = `${(bytes / base) * 100}%`;

    const texto = document.createElement('span');
    texto.textContent = `${etiqueta} · ${formatearBytes(bytes)}`;

    barra.append(relleno, texto);
    return barra;
  }

  // ---- Leer las cifras del evento (con respaldo si algún campo no viene) ----
  const sumar = (simbolos, valorDe) => simbolos.reduce((total, s) => total + valorDe(s), 0);

  function leer(x) {
    const simbolos = Array.isArray(x.simbolos) ? x.simbolos : null;
    const frecuencias = x.frequencies != null && typeof x.frequencies === 'object' ? x.frequencies : null;
    return {
      caracteres:
        x.n ??
        (frecuencias && Object.values(frecuencias).reduce((total, f) => total + f, 0)) ??
        (simbolos && sumar(simbolos, (s) => s.freq)),
      bits: x.bitsTotales ?? x.encoded_bits ?? (simbolos && sumar(simbolos, (s) => s.freq * s.codigo.length)),
      original:
        x.bytesOriginal ??
        (Number.isFinite(x.original_bits) ? x.original_bits / 8 : undefined) ??
        (typeof x.texto === 'string' ? new TextEncoder().encode(x.texto).length : undefined),
      tbos: x.bytesTbos ?? x.tbos?.size_bytes,
    };
  }

  function limpiar() {
    statsBox.replaceChildren();
    cmpBox.replaceChildren();
  }

  function mostrar(x) {
    if (!x) return;
    const { caracteres, bits, original, tbos } = leer(x);

    const valido =
      [caracteres, bits, original].every(Number.isFinite) &&
      caracteres > 0 &&
      original > 0 &&
      bits >= 0;

    if (!valido) {
      // Si el editor sí va a mostrar este resultado, no dejar cifras del texto anterior
      if (x.bytes || typeof x.bits === 'string') {
        console.warn('Resultados: faltan datos para las métricas', x);
        limpiar();
      }
      return;
    }

    const datosBytes = Math.ceil(bits / 8); // texto codificado, sin tabla
    const conTabla = Number.isFinite(tbos) && tbos >= 0;
    const codificado = conTabla ? tbos : datosBytes;
    const tablaBytes = conTabla ? Math.max(0, tbos - datosBytes) : 0; // firma + encabezado

    const ahorro = (1 - codificado / original) * 100;
    const ahorroDatos = (1 - datosBytes / original) * 100;

    let subAhorro;
    if (!conTabla) subAhorro = 'sin contar la tabla de frecuencias';
    else if (ahorro >= 0) subAhorro = `solo datos: ${f1.format(ahorroDatos)} %`;
    else subAhorro = 'la tabla pesa más que lo ahorrado';

    statsBox.replaceChildren(
      crearStat(formatearBytes(original), 'original', `${f0.format(caracteres)} caracteres`),
      crearStat(
        formatearBytes(codificado),
        'codificado',
        conTabla
          ? `datos ${formatearBytes(datosBytes)} + tabla ${formatearBytes(tablaBytes)}`
          : 'solo datos, sin la tabla'
      ),
      crearStat(`${f1.format(ahorro)} %`, 'ahorro', subAhorro),
      crearStat(
        f2.format(bits / caracteres),
        'bits por carácter',
        `original: ${f2.format((original * 8) / caracteres)}`
      )
    );

    // Todas las barras se escalan contra la más grande, para que ninguna se desborde
    const base = Math.max(original, codificado);
    const barras = [crearBarra('Original', original, base, 'orig')];
    if (conTabla) barras.push(crearBarra('Codificado + tabla (.tbos)', codificado, base));
    barras.push(crearBarra('Solo datos codificados', datosBytes, base));
    cmpBox.replaceChildren(...barras);
  }

  document.addEventListener('huffman:resultado', (e) => mostrar(e.detail));
<<<<<<< HEAD
  window.Resultados = { mostrar, limpiar }; 
=======
  window.Resultados = { mostrar, limpiar }; // por si se quiere llamar a mano desde la consola
>>>>>>> origin/main
})();
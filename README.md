# VSA — View Sorts Algorithms

Visualizador web de algoritmos: ordenamiento paso a paso y compresión de texto con Huffman.

## Integrantes

| Nombre | Usuario de GitHub |
| --- | --- |
| Ariel Rojas | [@Rxjaz](https://github.com/Rxjaz) |
| Diego Baltazar | [@BaltyG](https://github.com/BaltyG) |
| Enrique Zúñiga | [@kikinoli](https://github.com/kikinoli) |
| Abraham Moran | [@Moran-05](https://github.com/Moran-05) |

Equipo: **The Big O's**

## Descripción

VSA es una aplicación web con dos secciones, a las que se entra desde la barra superior:

- **Ordenamiento:** muestra de forma animada cómo trabajan distintos algoritmos de ordenamiento. El usuario genera un arreglo (aleatorio o escrito a mano), elige un algoritmo y ve cada comparación, intercambio y elemento que queda en su posición final, con controles para reproducir, pausar, avanzar paso a paso o saltar al final.
- **Huffman:** comprime un texto con la codificación de Huffman. El texto puede venir de un archivo `.txt` propio o de un libro de [Project Gutenberg](https://www.gutenberg.org/). La página muestra el texto codificado en bits, el árbol de Huffman, la tabla de frecuencias y códigos y cuánto se redujo el tamaño. Además permite descargar el archivo comprimido (`.tbos`) y el texto decodificado.

Toda la lógica de los algoritmos vive en un backend en Python (FastAPI). El frontend (HTML, CSS y JavaScript sin frameworks) solo se encarga de pedir los datos y dibujarlos: los pasos del ordenamiento en un `<canvas>` y el árbol de Huffman en SVG.

## Objetivo

Ayudar a entender cómo funcionan por dentro los algoritmos viéndolos en acción, en lugar de quedarse solo con la teoría y la notación Big O:

- En **ordenamiento**, comparar en la práctica la eficiencia de varios métodos sobre el mismo conjunto de datos.
- En **Huffman**, ver cómo una técnica voraz construye códigos de longitud variable y cuánto espacio se ahorra con textos reales, como un libro completo.

---

## Sección 1: Ordenamiento

### Modos

- **Individual:** un algoritmo a la vez, con resultados (comparaciones, movimientos, pasos totales y tiempo), historial de lo que está pasando y estadísticas.
- **Comparar:** varios algoritmos ordenando el mismo arreglo al mismo tiempo, con una tabla de resultados (comparaciones, movimientos, pasos totales y tiempo).

### Algoritmos implementados

| Algoritmo | Endpoint | Notas |
| --- | --- | --- |
| Bubble Sort | `POST /api/bubble` | Compara pares adyacentes y los intercambia si están desordenados. |
| Selection Sort | `POST /api/selection` | Busca el mínimo de la parte no ordenada y lo coloca al inicio. |
| Insertion Sort | `POST /api/insertion` | Inserta cada elemento (la "clave") en su lugar dentro de la parte ya ordenada. |
| Quick Sort | `POST /api/quick` | Divide y vencerás usando el último elemento como pivote. |
| Merge Sort | `POST /api/merge` | Divide el arreglo en mitades, las ordena y las mezcla. |
| Gnome Sort | `POST /api/gnome` | Avanza mientras el orden es correcto y retrocede intercambiando cuando no lo es. |
| Stooge Sort | `POST /api/stooge` | Ordena recursivamente los primeros 2/3, los últimos 2/3 y de nuevo los primeros 2/3. Limitado a 20 elementos por su alto costo. |
| Exchange Sort | `POST /api/exchange` | Compara cada elemento con todos los siguientes e intercambia cuando hace falta. |

### Contrato de la API

Todos los endpoints reciben el mismo cuerpo:

```json
{ "array": [34, 7, 23, 32, 5] }
```

y responden con la lista de pasos:

```json
{
  "steps": [
    { "array": [34, 7, 23, 32, 5], "compare": [0, 1], "swapped": true, "sorted_index": [] }
  ]
}
```

| Campo | Significado |
| --- | --- |
| `array` | Estado del arreglo en ese paso. |
| `compare` | Índices que se están comparando. |
| `swapped` | `true` si en ese paso hubo intercambio. |
| `sorted_index` | Índices que ya quedaron en su posición final. |
| `pivot`, `swap` | Solo en Quick Sort: índice del pivote e índices intercambiados. |
| `key` | Solo en Insertion Sort: la clave que se está insertando. |

El arreglo debe tener entre 1 y 50 enteros (20 como máximo para Stooge). Si no es válido, la API responde con `422` (lo rechaza Pydantic) o con `400` (límite de Stooge).

### Uso

1. **Elegir el modo** en la parte superior: *Individual* o *Comparar*.
2. **Elegir el algoritmo** en la barra de *Métodos*. En modo Comparar se pueden marcar dos o más.
3. **Preparar el arreglo:**
   - Ajustar el tamaño `n` (de 5 a 50) con el deslizador y presionar **Aleatorio**, o
   - escribir números separados por comas en el campo *Manual* (por ejemplo `34, 7, 23, 32, 5`) y presionar **Usar**.
4. **Controlar la animación:**
   - **Play / Pausa** para reproducir o detener.
   - **Paso** para avanzar un solo paso.
   - **Reiniciar** para volver al inicio.
   - **Fin** para saltar al resultado final.
   - Deslizador de velocidad para cambiar los pasos por segundo, y barra de progreso para moverse a cualquier punto.
5. **Interpretar los colores** con la leyenda: comparando, intercambio, pivote, mínimo/clave y "ya en su lugar".

En el modo Comparar, cada algoritmo tiene su propio panel con su conteo de comparaciones y movimientos, y al final se muestra una tabla con el ranking de los métodos.

---

## Sección 2: Compresión de Huffman

### Cómo funciona el algoritmo

La codificación de Huffman asigna **códigos binarios más cortos a los caracteres más frecuentes** y más largos a los raros. Ningún código es prefijo de otro, así que los bits se pueden leer de corrido sin separadores.

La implementación está en [`api/huffman/huffman.py`](api/huffman/huffman.py):

1. **Contar frecuencias** de cada carácter del texto (`count_frequencies`, con `collections.Counter`).
2. **Construir el árbol** (`build_tree`) con un *min-heap* (`heapq`):
   - cada carácter entra como una hoja con su frecuencia;
   - se sacan siempre los **dos nodos de menor frecuencia** y se unen en un nodo nuevo cuya frecuencia es la suma de ambos (técnica **voraz**);
   - se repite hasta que queda un solo nodo: la raíz.
3. **Generar los códigos** (`build_codes`) recorriendo el árbol: **izquierda = `0`** y **derecha = `1`**. El código de cada carácter es el camino desde la raíz hasta su hoja.
4. **Codificar**: se reemplaza cada carácter del texto por su código.

Decisiones importantes:

- **Árbol determinista.** Las hojas se insertan en el heap ordenadas por carácter, y los empates se resuelven con un contador de orden. Con las mismas frecuencias siempre sale el mismo árbol, así que para descomprimir basta con guardar las frecuencias: no hace falta guardar ni el árbol ni los códigos.
- **Texto con un solo carácter distinto** (por ejemplo `"aaaa"`): la raíz tiene una sola hija para que el carácter reciba el código `0` y no un código vacío.
- **Decodificar** (`decode` en [`api/huffman/decode.py`](api/huffman/decode.py)): se reconstruye el árbol a partir de las frecuencias y se recorre bit por bit; cada vez que se llega a una hoja se escribe su carácter y se vuelve a la raíz. Si los bits terminan a mitad de un código, se marca como error.

#### Ejemplo: `"abracadabra"`

| Carácter | Frecuencia | Código |
| --- | --- | --- |
| `a` | 5 | `0` |
| `b` | 2 | `110` |
| `r` | 2 | `111` |
| `c` | 1 | `100` |
| `d` | 1 | `101` |

```
            (11)
          0/    \1
        a:5     (6)
              0/    \1
            (2)      (4)
          0/  \1   0/  \1
         c:1  d:1 b:2  r:2
```

El texto original ocupa 11 × 8 = **88 bits**; codificado ocupa **23 bits** (`01101110100010101101110`), es decir, un 26 % del original.

### Formato de archivo `.tbos`

El archivo comprimido tiene extensión `.tbos` (por *The Big O's*) y se arma en [`api/huffman/tbos.py`](api/huffman/tbos.py):

| Bytes | Contenido |
| --- | --- |
| 0–3 | Firma `TBOS` (en ASCII). |
| 4–7 | Largo del encabezado en bytes (entero sin signo, *big-endian*). |
| 8 … 8 + largo | Encabezado JSON en UTF-8: `{"frequencies": {...}, "total_bits": N}`. |
| resto | Los bits codificados, empaquetados de 8 en 8. El último byte se rellena con ceros. |

- `total_bits` indica cuántos bits son datos reales, para ignorar el relleno al leer.
- Al leer (`read_tbos`) se valida la firma, que el encabezado esté completo y sea JSON válido, y que la cantidad de bytes de datos coincida con `total_bits`. Si algo falla se lanza un `ValueError` que la API convierte en un `400`.

### Endpoints

| Método y ruta | Entrada | Salida |
| --- | --- | --- |
| `POST /api/hencode` | JSON `{ "text": "..." }` | JSON con bits, códigos, frecuencias, árbol, estadísticas y el `.tbos` en base64. |
| `POST /api/hdecode` | `multipart/form-data` con el archivo `.tbos` en el campo `file` | JSON `{ "text": "..." }` |
| `GET /api/gutenberg/search?q=...` | Título o autor | JSON `{ "count", "results": [{ "id", "title", "authors", "downloads" }] }` |
| `GET /api/gutenberg/book/{id}` | Id del libro | **Texto plano** del libro, sin la cabecera ni la licencia de Project Gutenberg. |

#### `POST /api/hencode`

```json
{ "text": "abracadabra" }
```

Respuesta:

```json
{
  "bits": "01101110100010101101110",
  "codes": { "a": "0", "c": "100", "d": "101", "b": "110", "r": "111" },
  "frequencies": { "a": 5, "b": 2, "r": 2, "c": 1, "d": 1 },
  "tree": {
    "frequency": 11,
    "left": { "char": "a", "frequency": 5 },
    "right": { "frequency": 6, "left": { "...": "..." }, "right": { "...": "..." } }
  },
  "original_bits": 88,
  "encoded_bits": 23,
  "ratio": 0.2614,
  "tbos": {
    "filename": "comprimido.tbos",
    "size_bytes": 86,
    "content_base64": "VEJPUwAAAEt7ImZyZXF1..."
  }
}
```

- `tree` usa `char` solo en las hojas; los nodos internos tienen `frequency`, `left` y `right`. Así lo dibuja el frontend.
- `original_bits` se calcula sobre el texto en UTF-8, así que los acentos y la `ñ` cuentan como 2 bytes.
- `ratio` = `encoded_bits / original_bits`. En el ejemplo, el `.tbos` pesa más que el texto (86 bytes) porque el encabezado domina en textos muy cortos; con un libro completo el encabezado es despreciable.

#### `POST /api/hdecode`

```bash
curl -F "file=@comprimido.tbos" http://localhost:8000/api/hdecode
# {"text":"abracadabra"}
```

Errores:

| Código | Cuándo |
| --- | --- |
| `400` | El archivo no termina en `.tbos`, la firma o el encabezado están dañados, o los bits no corresponden a las frecuencias. |
| `413` | El archivo pesa más de 4 MB. |

#### Project Gutenberg

[`api/gutenberg.py`](api/gutenberg.py) consulta la API pública [Gutendex](https://gutendex.com/):

- **Buscar:** une los nombres de los autores en un solo texto y toma `downloads` de `download_count`.
- **Descargar:** elige el formato `text/plain` (prefiriendo UTF-8 y descartando los `.zip`), decodifica en UTF-8 con respaldo a latin-1 para libros antiguos y recorta el texto entre las marcas `*** START OF ... ***` y `*** END OF ... ***`. Si no encuentra las marcas, devuelve el texto completo.
- Responde `404` si el libro no existe o no tiene texto plano, y `502` si Gutenberg falla o no responde.

### Verificación de ida y vuelta

Al presionar **Comprimir**, el frontend hace dos peticiones:

1. `POST /api/hencode` con el texto.
2. `POST /api/hdecode` con el `.tbos` que acaba de recibir.

Después compara el texto decodificado con el original y muestra el resultado en el pie del editor. Así se comprueba en cada compresión que el `.tbos` se puede descomprimir sin perder nada. La vista *Normal* del editor muestra el texto **decodificado**, no el archivo original.

### Uso

1. **Cargar un texto**, de una de dos formas:
   - **Subir .txt:** un archivo de texto plano propio (máx. 15 MB).
   - **Buscar:** escribir un título o autor, presionar **Buscar** y elegir un libro de la lista de Project Gutenberg.
2. Presionar **Comprimir**.
3. Pestaña **Texto**:
   - **Editor** con números de línea y dos vistas: **Codificado** (los bytes del `.tbos` en binario, 8 por línea) y **Normal** (el texto decodificado). Con **Mostrar más** se cargan más líneas.
   - **Descargas:** **Descargar .tbos** (archivo comprimido) y **Descargar .txt decodificado**.
   - **Resultados:** tamaño original contra tamaño codificado, porcentaje de ahorro y cuánto ocupa el encabezado del `.tbos`.
4. Pestaña **Árbol y códigos**:
   - **Árbol de Huffman** dibujado en SVG: rama izquierda = 0, rama derecha = 1, nodos internos y hojas con su carácter y frecuencia. Los caracteres invisibles se muestran con símbolos (`␣` espacio, `↵` salto de línea, `⇥` tabulador). Con más de 500 hojas se muestra un aviso en lugar del dibujo.
   - **Tabla de frecuencias y códigos:** carácter, Unicode, frecuencia, porcentaje, código, largo del código y bits totales, de mayor a menor frecuencia.

### Limitaciones

- Vercel limita las respuestas de una función a unos **4.5 MB**. `/api/hencode` devuelve los bits como texto (1 carácter por bit) y además el `.tbos` en base64, así que con textos muy grandes la respuesta puede pasar ese límite.
- `/api/hdecode` acepta archivos `.tbos` de hasta 4 MB.

---

## Estructura del proyecto

```
view-sorts-web/
├── api/                      # Backend (FastAPI, función serverless de Vercel)
│   ├── index.py              # App principal: registra todos los routers y /api/health
│   ├── schemas.py            # Modelos de Pydantic (SortRequest, EncodeRequest)
│   ├── sorts/                # Un archivo por algoritmo de ordenamiento
│   │   ├── bubble.py  exchange.py  gnome.py  insertion.py
│   │   └── merge.py   quick.py     selection.py  stooge.py
│   ├── huffman/
│   │   ├── huffman.py        # Frecuencias, árbol, códigos y árbol en JSON
│   │   ├── tbos.py           # Escribir y leer el formato .tbos
│   │   ├── encode.py         # POST /api/hencode
│   │   └── decode.py         # POST /api/hdecode
│   └── gutenberg.py          # GET /api/gutenberg/search y /book/{id}
├── public/                   # Frontend estático
│   ├── index.html            # Barra superior; carga cada sección en un iframe
│   ├── ordenamiento.html
│   ├── huffman.html
│   ├── css/
│   │   ├── styles.css        # Estilos generales
│   │   └── huffman.css       # Estilos de la sección Huffman
│   └── js/
│       ├── navegacion.js     # Cambia de sección (#ordenamiento / #huffman)
│       │                     # ── Ordenamiento ──
│       ├── estado.js         # Estado central: algoritmo, arreglo y paso actual
│       ├── api.js            # Peticiones a /api/<algoritmo> y manejo de errores
│       ├── arreglo.js        # Tamaño, arreglo aleatorio y entrada manual
│       ├── selector.js       # Selector de algoritmo(s)
│       ├── animacion.js      # Recorre los pasos y controla la reproducción
│       ├── render.js         # Dibuja el arreglo en el <canvas>
│       ├── main.js           # Conecta controles, velocidad y modos
│       │                     # ── Huffman ──
│       ├── huffman-api.js    # Peticiones a hencode, hdecode y Gutenberg; adapta las respuestas
│       ├── huffman-estado.js # Estado central y flujo comprimir → verificar
│       ├── fuente.js         # Subir .txt y buscador de Gutenberg
│       ├── editor.js         # Editor con vistas Codificado / Normal
│       ├── resultados.js     # Estadísticas y comparación de tamaños
│       ├── arbol.js          # Árbol de Huffman en SVG
│       ├── tabla.js          # Tabla de frecuencias y códigos
│       └── descargas.js      # Descargar .tbos y .txt decodificado
├── requirements.txt
└── vercel.json
```

## Tecnologías utilizadas

- **Backend:** Python 3, [FastAPI](https://fastapi.tiangolo.com/), [Pydantic](https://docs.pydantic.dev/) para validar la entrada y [python-multipart](https://github.com/Kludex/python-multipart) para recibir el archivo `.tbos`. Para Huffman solo se usa la biblioteca estándar (`heapq`, `collections.Counter`, `json`, `base64`, `urllib`).
- **Frontend:** HTML5, CSS3 y JavaScript sin frameworks. La animación del ordenamiento usa Canvas API y el árbol de Huffman, SVG.
- **Datos externos:** [Project Gutenberg](https://www.gutenberg.org/) mediante la API [Gutendex](https://gutendex.com/).
- **Tipografía:** Lexend (Google Fonts).
- **Despliegue:** [Vercel](https://vercel.com/) (`@vercel/python` para la API y `@vercel/static` para el frontend).
- **Control de versiones:** Git y GitHub.

## Cómo ejecutar el proyecto

### Requisitos

- Python 3.10 o superior
- Node.js (solo para usar la CLI de Vercel)

### Pasos

1. Clonar el repositorio:

   ```bash
   git clone https://github.com/The-Big-O-s/view-sorts-web.git
   cd view-sorts-web
   ```

2. Crear un entorno virtual e instalar las dependencias:

   ```bash
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```

3. Levantar el proyecto completo (frontend + API) con la CLI de Vercel, que usa las mismas rutas que producción:

   ```bash
   npm install -g vercel
   vercel dev
   ```

   Abrir `http://localhost:3000` en el navegador. La sección de Huffman está en `http://localhost:3000/#huffman`.

### Solo la API

Para probar únicamente el backend:

```bash
pip install uvicorn
uvicorn api.index:app --reload
```

La documentación interactiva queda en `http://localhost:8000/api/docs` y el estado del servicio en `http://localhost:8000/api/health`. Desde `/api/docs` se pueden probar todos los endpoints, incluso subir un `.tbos` a `/api/hdecode`.

## Deployment

El proyecto está desplegado en Vercel:

**URL: https://vsa-six.vercel.app**

La configuración está en [`vercel.json`](vercel.json):

- `api/index.py` se publica como función serverless de Python y atiende todas las rutas `/api/*` (ordenamiento, Huffman y Gutenberg).
- El contenido de `public/` se sirve como sitio estático.

Para desplegar manualmente desde la terminal:

```bash
vercel          # despliegue de prueba (preview)
vercel --prod   # despliegue a producción
```

## Organización del equipo

- **Repositorio compartido** en GitHub ([The-Big-O-s/view-sorts-web](https://github.com/The-Big-O-s/view-sorts-web)), con `main` como rama estable.
- **Tareas por issue:** el trabajo se dividió en tareas numeradas.
- **Una rama por tarea** (`task/<número>-<nombre>`), integrada a `main` mediante merges y pull requests.
- **Seguimiento** en un tablero de GitHub Projects (*VSA*), con cada issue asignado a uno o más integrantes.

### División por áreas: Ordenamiento

| Integrante | Área | Tareas principales |
| --- | --- | --- |
| **Ariel Rojas** (@Rxjaz) | Despliegue, infraestructura y backend | Esqueleto de la interfaz, `vercel.json`, configuración de Vercel y deploy automático desde GitHub, manejo de errores de la API, lógica de los algoritmos (junto con Abraham). |
| **Abraham Moran** (@Moran-05) | Backend / API | `api/index.py`, endpoints de ordenamiento, validación de inputs con Pydantic y lógica de los algoritmos. |
| **Diego Baltazar** (@BaltyG) | Frontend: visualización | Selector de algoritmo, renderizado visual del arreglo en el canvas, lógica de animación y control del tamaño del arreglo (junto con Enrique). |
| **Enrique Zúñiga** (@kikinoli) | Frontend: interacción y estado | Botones de control, llamadas a la API, manejo del estado de la aplicación, estilos y control del tamaño del arreglo (junto con Diego). |

### División por áreas: Huffman

| Integrante | Área | Tareas principales |
| --- | --- | --- |
| **Ariel Rojas** (@Rxjaz) | Backend: algoritmo, formato y datos externos | Algoritmo de Huffman (`huffman.py`: frecuencias, árbol con heap, códigos y árbol en JSON), formato de archivo `.tbos` (`tbos.py`), conexión con Project Gutenberg (`gutenberg.py`), dependencia `python-multipart` y ajustes del editor para mostrar el `.tbos`. |
| **Abraham Moran** (@Moran-05) | Backend: API de Huffman | Codificar y decodificar (`encode.py`, `decode.py`), endpoints `/api/hencode` y `/api/hdecode`, subida del archivo `.tbos` y modelo `EncodeRequest`. |
| **Diego Baltazar** (@BaltyG) | Frontend: conexión y visualización | Conexión del frontend con la API (`huffman-api.js`, `huffman-estado.js`), flujo comprimir → verificar, sección de resultados (`resultados.js`) y árbol de Huffman en SVG (`arbol.js`). |
| **Enrique Zúñiga** (@kikinoli) | Frontend: interfaz | Barra de navegación entre secciones (`index.html`, `navegacion.js`), esqueleto y estilos de `huffman.html`, barra de fuente (`fuente.js`), editor de texto (`editor.js`), tabla de códigos (`tabla.js`) y descargas (`descargas.js`). |

En resumen, el backend (algoritmos y API) quedó a cargo de Ariel y Abraham en las dos secciones; el frontend se dividió entre Diego y Enrique; y Ariel se encargó además del despliegue en Vercel. En Huffman, Ariel hizo el núcleo del algoritmo, el formato `.tbos` y la conexión con Gutenberg, y Abraham expuso todo eso como endpoints.

## Uso de IA

- **Claude Design:** para hacer el boceto de la interfaz (distribución de controles, vista Individual y vista Comparar) antes de programarla.
- **Claude, Gemini, ChatGPT**
  - Para resolver dudas de arquitectura y diseño de software: cómo organizar las carpetas (`api/` con un archivo por algoritmo y `public/` con los módulos de JavaScript), cómo separar responsabilidades entre backend y frontend y qué forma debían tener las peticiones y respuestas de la API.
  - Para generar la lógica básica de **Merge Sort** y **Quick Sort**, que después adaptamos para registrar cada paso en el formato que usa la animación.
  - Para entender el frontend: algo de la estructura en HTML y, sobre todo, la lógica en JavaScript, en particular cómo funciona la animación paso a paso y cómo conectarla con el backend (hacer las peticiones a la API y usar los pasos que devuelve).
  - Para estructurar `api.js`, el módulo que conecta el frontend con el backend en Python: una ruta por algoritmo, el envío del arreglo a la API y la gestión de errores (estado de la conexión y mensajes claros para los códigos `400`, `422` y `500`).
  - Para diseñar el formato `.tbos` (firma, encabezado JSON con las frecuencias y bits empaquetados) y entender por qué un árbol de Huffman determinista permite no guardar el árbol en el archivo.
  - Para la conexión con Project Gutenberg: cómo usar Gutendex, elegir el formato de texto plano y quitar la cabecera y la licencia de los libros.
  - Para consultar comandos de Git y el uso de GitHub: crear y cambiar de ramas, mantenerlas actualizadas con `main` y hacer push correctamente.
  - Para resolver errores que aparecían al ejecutar o levantar el proyecto.
- **Claude Code:** para auditar el código (detectar errores, inconsistencias entre el formato del backend y lo que espera el frontend, y posibles mejoras) y para apoyar la redacción de este README.

## Aprendizajes y conclusiones

### Aprendizajes

- **APIs serverless en Python:** construir una API con FastAPI que corre como función serverless en Vercel. Cada petición es independiente y sin estado: recibe el arreglo o el texto, calcula el resultado y responde, sin necesidad de administrar un servidor propio.
- **Validación y manejo de errores:** declarar las reglas de entrada en modelos de Pydantic (`SortRequest`, `EncodeRequest`), que rechazan automáticamente lo inválido con un `422`; usar `HTTPException` para reglas propias (`400` para el límite de Stooge o un `.tbos` dañado, `413` para archivos demasiado grandes, `502` cuando falla Gutenberg); y traducir esos códigos en el frontend a mensajes claros para el usuario.
- **Estructuras de datos en la práctica:** usar un *min-heap* para construir el árbol de Huffman, recorrer árboles de forma recursiva para generar los códigos y para dibujarlos, y entender por qué una técnica voraz da códigos óptimos.
- **Formatos binarios:** diseñar un formato de archivo propio (`.tbos`) con firma, encabezado y datos; empaquetar bits en bytes y manejar el relleno; y transportar binarios en JSON con base64 o como `multipart/form-data`.
- **Consumir APIs externas:** buscar y descargar libros de Project Gutenberg, manejar codificaciones distintas (UTF-8 y latin-1) y limpiar el contenido que no forma parte del libro.
- **Optimización de payloads y estructuras:** diseñar la comunicación entre frontend y backend pensando en su costo: una sola petición por algoritmo con todos los pasos, cada paso solo con los campos necesarios, un tamaño máximo de arreglo y, en Huffman, tener presente el límite de respuesta de Vercel con textos grandes.
- **Gestión de datos:** seguir el recorrido de los datos de punta a punta: se crean o cargan en la interfaz, se validan, viajan a la API, vuelven procesados, se guardan en un estado central y desde ahí se dibujan.
- **Frontend con HTML y JavaScript:** trabajar sin frameworks: manipular el DOM, responder a eventos, dibujar en `<canvas>` y en SVG, controlar una animación con temporizadores y cargar contenido largo por partes.
- **Metodología Scrum y gestión del trabajo:** dividir el proyecto en tareas pequeñas (issues), repartirlas en el tablero de GitHub Projects y dar seguimiento al avance para detectar a tiempo lo que faltaba o estaba bloqueado.
- **Git y GitHub colaborativo:** trabajar con una rama por tarea, integrar los cambios a `main` mediante pull requests, hacer merges frecuentes y resolver conflictos cuando dos personas tocaban los mismos archivos.

### Conclusiones

- **Ver los algoritmos ayuda a entenderlos:** el objetivo se cumplió. Verlos paso a paso deja claro por qué algunos (Bubble, Stooge) crecen tan rápido en número de operaciones mientras que otros (Quick, Merge) escalan mucho mejor, y el modo Comparar lo hace evidente con el mismo arreglo. En Huffman, ver el árbol y la tabla de códigos de un libro real muestra de inmediato por qué los caracteres frecuentes quedan cerca de la raíz y cuánto se ahorra.
- **Separar backend y frontend fue una buena decisión:** para algunos de nosotros fue la primera vez trabajando en un equipo dividido entre backend y frontend. Que el backend haga todos los cálculos y el frontend solo los dibuje nos permitió avanzar en paralelo, siempre que ambos lados respetaran el mismo formato de datos. Definir ese contrato desde el inicio fue clave, y en Huffman, donde el frontend se empezó antes que algunos endpoints, se notó todavía más.
- **La organización pesa tanto como el código:** con cuatro personas trabajando al mismo tiempo, Scrum y un flujo ordenado en Git y GitHub fueron lo que permitió integrar el trabajo de todos sin perder el control del proyecto.
- **El código es más simple de lo que parece:** algunas partes suenan complicadas, como la animación paso a paso, la comunicación con la API o la compresión de Huffman, pero al revisar el código se ve que no es muy extenso. La dificultad no está en la cantidad de código, sino en entender la lógica de cada parte y cómo se conectan entre sí.

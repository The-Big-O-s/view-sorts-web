# VSA — View Sorts Algorithms

Visualizador web de algoritmos de ordenamiento, paso a paso.

## Integrantes

| Nombre | Usuario de GitHub |
| --- | --- |
| Ariel Rojas | [@Rxjaz](https://github.com/Rxjaz) |
| Diego Baltazar | [@BaltyG](https://github.com/BaltyG) |
| Enrique Zúñiga | [@kikinoli](https://github.com/kikinoli) |
| Abraham Moran | [@Moran-05](https://github.com/Moran-05) |

Equipo: **The Big O's**

## Descripción

VSA es una aplicación web que muestra de forma animada cómo trabajan distintos algoritmos de ordenamiento. El usuario genera un arreglo (aleatorio o escrito a mano), elige un algoritmo y ve cada comparación, intercambio y elemento que queda en su posición final, con controles para reproducir, pausar, avanzar paso a paso o saltar al final.

La lógica de los algoritmos vive en un backend en Python (FastAPI), que recibe el arreglo y devuelve la lista completa de pasos. El frontend (HTML, CSS y JavaScript sin frameworks) recorre esos pasos y los dibuja en un `<canvas>`.

La aplicación tiene dos modos:

- **Individual:** un algoritmo a la vez, resultados (comparaciones, movimientos, pasos totales y tiempo), historial de lo que está pasando y estadísticas.
- **Comparar:** varios algoritmos ordenando el mismo arreglo al mismo tiempo, con una tabla de resultados (comparaciones, movimientos, pasos totales y tiempo).

## Objetivo

Ayudar a entender el funcionamiento interno de los algoritmos de ordenamiento viéndolos en acción, y comparar su eficiencia de forma práctica sobre el mismo conjunto de datos, en lugar de quedarse solo con la teoría y la notación Big O.

## Algoritmos implementados

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

El arreglo debe tener entre 1 y 50 enteros (20 como máximo para Stooge). Si no es válido, la API responde con `422` o `400`.

## Tecnologías utilizadas

- **Backend:** Python 3, [FastAPI](https://fastapi.tiangolo.com/) y [Pydantic](https://docs.pydantic.dev/) para validar la entrada.
- **Frontend:** HTML5, CSS3 y JavaScript sin frameworks; animación dibujada con Canvas API.
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

   Abrir `http://localhost:3000` en el navegador.

### Solo la API

Para probar únicamente el backend:

```bash
pip install uvicorn
uvicorn api.index:app --reload
```

La documentación interactiva queda en `http://localhost:8000/api/docs` y el estado del servicio en `http://localhost:8000/api/health`.

## Uso de la aplicación

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

## Deployment

El proyecto está desplegado en Vercel:

**URL: https://vsa-six.vercel.app**

La configuración está en [`vercel.json`](vercel.json):

- `api/index.py` se publica como función serverless de Python y atiende todas las rutas `/api/*`.
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

### División por áreas

| Integrante | Área | Tareas principales |
| --- | --- | --- |
| **Ariel Rojas** (@Rxjaz) | Despliegue, infraestructura y backend | Esqueleto de la interfaz, `vercel.json`, configuración de Vercel y deploy automático desde GitHub, manejo de errores de la API, lógica de los algoritmos (junto con Abraham). |
| **Abraham Moran** (@Moran-05) | Backend / API | `api/index.py`, endpoints de ordenamiento, validación de inputs con Pydantic y lógica de los algoritmos. |
| **Diego Baltazar** (@BaltyG) | Frontend: visualización | Selector de algoritmo, renderizado visual del arreglo en el canvas, lógica de animación y control del tamaño del arreglo (junto con Enrique). |
| **Enrique Zúñiga** (@kikinoli) | Frontend: interacción y estado | Botones de control, llamadas a la API, manejo del estado de la aplicación, estilos y control del tamaño del arreglo (junto con Diego). |

En resumen, el backend (algoritmos y API) quedó a cargo de Ariel y Abraham; el frontend se dividió entre la parte visual y de animación (Diego) y la parte de interacción, estado y comunicación con la API (Enrique); y Ariel se encargó además del despliegue en Vercel.

## Uso de IA

- **Claude Design:** para hacer el boceto de la interfaz (distribución de controles, vista Individual y vista Comparar) antes de programarla.
- **Claude, Gemini, ChatGPT**
  - Para resolver dudas de arquitectura y diseño de software: cómo organizar las carpetas (`api/` con un archivo por algoritmo y `public/` con los módulos de JavaScript), cómo separar responsabilidades entre backend y frontend y qué forma debían tener las peticiones y respuestas de la API.
  - Para generar la lógica básica de **Merge Sort** y **Quick Sort**, que después adaptamos para registrar cada paso en el formato que usa la animación.
  - Para entender el frontend: algo de la estructura en HTML y, sobre todo, la lógica en JavaScript, en particular cómo funciona la animación paso a paso y cómo conectarla con el backend (hacer las peticiones a la API y usar los pasos que devuelve).
  - Para estructurar `api.js`, el módulo que conecta el frontend con el backend en Python: una ruta por algoritmo, el envío del arreglo a la API y la gestión de errores (estado de la conexión y mensajes claros para los códigos `400`, `422` y `500`).
  - Para consultar comandos de Git y el uso de GitHub: crear y cambiar de ramas, mantenerlas actualizadas con `main` y hacer push correctamente.
  - Para resolver errores que aparecían al ejecutar o levantar el proyecto.
- **Claude Code:** para auditar el código (detectar errores, inconsistencias entre el formato del backend y lo que espera el frontend, y posibles mejoras) y para apoyar la redacción de este README.

## Aprendizajes y conclusiones

### Aprendizajes

- **APIs serverless en Python:** construir una API con FastAPI que corre como función serverless en Vercel. Cada petición es independiente y sin estado: recibe el arreglo, calcula los pasos y responde, sin necesidad de administrar un servidor propio.
- **Validación y manejo de errores:** declarar las reglas de entrada en un solo modelo de Pydantic (`SortRequest`), que rechaza automáticamente lo inválido con un `422`; usar `HTTPException` con un `400` para reglas propias, como el límite de Stooge; y traducir esos códigos en el frontend a mensajes claros para el usuario.
- **Optimización de payloads y estructuras:** diseñar la comunicación entre frontend y backend pensando en su costo: una sola petición por algoritmo que trae todos los pasos, cada paso solo con los campos necesarios (`array`, `compare`, `swapped`, `sorted_index`) y un tamaño máximo de arreglo para mantener las respuestas pequeñas.
- **Gestión de datos:** seguir el recorrido del arreglo de punta a punta: se crea en la interfaz, se valida, viaja a la API, vuelve como lista de pasos, se guarda en un estado central y desde ahí se dibuja.
- **Frontend con HTML y JavaScript:** trabajar sin frameworks: manipular el DOM, responder a los eventos de los botones, dibujar en un `<canvas>` y controlar una animación con temporizadores.
- **Metodología Scrum y gestión del trabajo:** dividir el proyecto en tareas pequeñas (issues), repartirlas en el tablero de GitHub Projects y dar seguimiento al avance para detectar a tiempo lo que faltaba o estaba bloqueado.
- **Git y GitHub colaborativo:** trabajar con una rama por tarea, integrar los cambios a `main` mediante pull requests, hacer merges frecuentes y resolver conflictos cuando dos personas tocaban los mismos archivos.

### Conclusiones

- **Ver los algoritmos ayuda a entenderlos:** el objetivo se cumplió. Verlos paso a paso deja claro por qué algunos (Bubble, Stooge) crecen tan rápido en número de operaciones mientras que otros (Quick, Merge) escalan mucho mejor, y el modo Comparar lo hace evidente con el mismo arreglo.
- **Separar backend y frontend fue una buena decisión:** para algunos de nosotros fue la primera vez trabajando en un equipo dividido entre backend y frontend. Que el backend genere los pasos y el frontend solo los dibuje nos permitió avanzar en paralelo, siempre que ambos lados respetaran el mismo formato de datos. Definir ese contrato desde el inicio fue clave.
- **La organización pesa tanto como el código:** con cuatro personas trabajando al mismo tiempo, Scrum y un flujo ordenado en Git y GitHub fueron lo que permitió integrar el trabajo de todos sin perder el control del proyecto.
- **El código es más simple de lo que parece:** algunas partes suenan complicadas, como la animación paso a paso o la comunicación con la API, pero al revisar el código se ve que no es muy extenso. La dificultad no está en la cantidad de código, sino en entender la lógica de cada parte y cómo se conectan entre sí.

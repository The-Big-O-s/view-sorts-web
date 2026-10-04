from fastapi import APIRouter
from ..schemas import SortRequest

router = APIRouter()

@router.post("/api/merge")
def merge_sort(payload: SortRequest):
    steps = {"steps": []}
    formatj = {
        "array": [],
        "compare": [],
        "swapped": False,
        "sorted_index": []
    }

    # Array global: es la que se va actualizando y se manda al frontend
    arreglo = payload.array.copy()

    # fusion de subarrays
    def _fusionar(izquierda, derecha, start):
        """Función auxiliar para mezclar dos listas ordenadas."""
        resultado = []
        i = j = 0

        # Comparar elementos de ambas listas y agregarlos en orden
        while i < len(izquierda) and j < len(derecha):
            toma_derecha = izquierda[i] > derecha[j]  # toma de la izquierda (estable)

            # Snapshot ANTES de escribir: los valores comparados siguen intactos
            formatj["array"] = arreglo.copy()
            formatj["compare"] = [start + i, start + len(izquierda) + j]  # indices globales
            formatj["swapped"] = toma_derecha
            steps["steps"].append(formatj.copy())

            # Ahora si se escribe en el array global
            if toma_derecha:
                resultado.append(derecha[j])
                j += 1
            else:
                resultado.append(izquierda[i])
                i += 1
            arreglo[start + len(resultado) - 1] = resultado[-1]

        # Agregar los elementos restantes si quedan en alguna lista
        for valor in izquierda[i:] + derecha[j:]:
            resultado.append(valor)
            arreglo[start + len(resultado) - 1] = valor
            formatj["array"] = arreglo.copy()
            formatj["compare"] = []
            formatj["swapped"] = False
            steps["steps"].append(formatj.copy())

        return resultado

    # mergesort
    def merge_sort_list(lista, start=0):
        arr = lista.copy()

        # Caso base: si la lista tiene 0 o 1 elemento, ya esta ordenada
        if len(arr) <= 1:
            return arr

        # Dividir la lista en dos mitades
        medio = len(arr) // 2
        izquierda = merge_sort_list(arr[:medio], start)
        derecha = merge_sort_list(arr[medio:], start + medio)

        # Combinar las mitades ordenadas
        return _fusionar(izquierda, derecha, start)

    merge_sort_list(payload.array)

    # Paso final: todo ordenado
    formatj["array"] = arreglo.copy()
    formatj["compare"] = []
    formatj["swapped"] = False
    formatj["sorted_index"] = list(range(len(arreglo)))
    steps["steps"].append(formatj.copy())

    return steps
from fastapi import APIRouter
from ..schemas import SortRequest

router = APIRouter()

@router.post("/api/quick")
def quick_sort(payload: SortRequest):
    steps = {"steps" : []}
    arreglo = payload.array.copy()
    formatj = {
        "array": [],
        "compare": [],
        "swapped": False,
        "swap" : [],
        "pivot" : 0,
        "sorted_index": []
    }

    # particion
    def _particionar(bajo, alto):
        """Función auxiliar: deja el pivote en su posición final y la devuelve."""
        pivote = arreglo[alto]  # el pivote es el último elemento
        formatj["pivot"] = alto
        i = bajo - 1            # limite de los elementos menores o iguales al pivote

        for j in range(bajo, alto):
            formatj["array"] = arreglo.copy()
            formatj["swapped"] = False
            formatj["swap"] = []
            formatj["compare"] = [j, alto]
            if arreglo[j] <= pivote:
                i += 1
                formatj["swapped"] = i != j
                formatj["swap"] = [i, j] if i != j else []
                arreglo[i], arreglo[j] = arreglo[j], arreglo[i]
            steps["steps"].append(formatj.copy())

        # Colocar el pivote en su posicion final
        arreglo[i + 1], arreglo[alto] = arreglo[alto], arreglo[i + 1]
        formatj["pivot"] = i + 1
        formatj["swap"] = []
        formatj["swapped"] = False
        formatj["array"] = arreglo.copy()
        formatj["sorted_index"] = formatj["sorted_index"].copy()
        formatj["sorted_index"].append(i+1)
        formatj["compare"] = []
        steps["steps"].append(formatj.copy())
        return i + 1

    # quicksort
    def quick_sort_list(bajo, alto):
        # Caso base: si el rango tiene 0 o 1 elemento, ya esta ordenado
        if bajo >= alto:
            if bajo == alto:
                formatj["sorted_index"] = formatj["sorted_index"].copy()
                formatj["sorted_index"].append(bajo)
            return

        # Particionar y ordenar cada lado del pivote
        pos_pivote = _particionar(bajo, alto)
        quick_sort_list(bajo, pos_pivote - 1)
        quick_sort_list(pos_pivote + 1, alto)

    quick_sort_list(0, len(arreglo) - 1)

    # Paso final: todo ordenado
    formatj["array"] = arreglo.copy()
    formatj["compare"] = []
    formatj["swapped"] = False
    formatj["swap"] = []
    formatj["pivot"] = None
    formatj["sorted_index"] = list(range(len(arreglo)))
    steps["steps"].append(formatj.copy())

    return steps
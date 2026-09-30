from fastapi import APIRouter
from ..schemas import SortRequest

router = APIRouter()

@router.post("/api/merge")
def merge_sort(payload: SortRequest):
    steps = {"steps" : []}
    formatj = {
            "array": [],
            "compare": [],
            "swapped": False,
            "sorted_index": []
        }
    
    #fusion de subarrays
    def _fusionar(izquierda, derecha):
        """Función auxiliar para mezclar dos listas ordenadas."""
        resultado = []
        i = j = 0

        # Comparar elementos de ambas listas y agregarlos en orden
        while i < len(izquierda) and j < len(derecha):
            if izquierda[i] < derecha[j]:
                resultado.append(izquierda[i])
                i += 1
            else:
                resultado.append(derecha[j])
                j += 1

        # Agregar los elementos restantes si quedan en alguna lista
        resultado.extend(izquierda[i:])
        resultado.extend(derecha[j:])

        return resultado

    #mergesort
    def merge_sort_list(lista):
        arr = lista.copy()

        # Caso base: si la lista tiene 0 o 1 elemento, ya está ordenada
        if len(arr) <= 1:
            return arr

        # Dividir la lista en dos mitades
        medio = len(arr) // 2
        izquierda = merge_sort_list(arr[:medio])
        derecha = merge_sort_list(arr[medio:])

        # Combinar las mitades ordenadas
        return _fusionar(izquierda, derecha)
    
    steps["steps"] = merge_sort_list(payload.array)
    return steps
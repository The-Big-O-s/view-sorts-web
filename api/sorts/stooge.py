from fastapi import APIRouter, HTTPException
from ..schemas import SortRequest, LIMITE_STOOGE

router = APIRouter()

@router.post("/api/stooge")
def stooge_sort(payload: SortRequest):
    if len(payload.array) > LIMITE_STOOGE:
        raise HTTPException(
            status_code=400,
            detail=f"Maximo {LIMITE_STOOGE} elementos.",
        )

    steps = {"steps": []}
    arr = payload.array.copy()   # copia, para no modificar la lista de la petición
    n = len(arr)
    formatj = {
        "array": [],
        "compare": [],
        "swapped": False,
        "sorted_index": []
    }

    def stooge_sort_rec(arr, i, j):
        formatj["swapped"] = False #Falso predeterminado
        if i >= j:
            return

        formatj["compare"] = [i, j]
        formatj["array"] = arr.copy() #Le damos la lista
        formatj["swapped"] = arr[i] > arr[j] #Marca si se va a intercambiar antes de registrarlo
        steps["steps"].append(formatj.copy())

        # Si el primer elemento es mayor que el último, intercambiar
        if formatj["swapped"]: #Toma la marca anterior
            arr[i], arr[j] = arr[j], arr[i]

        # Si hay 3 o más elementos en el rango
        if j - i + 1 > 2:
            t = (j - i + 1) // 3
            # Aplicar fuerza bruta a los 3 tercios superpuestos
            stooge_sort_rec(arr, i, j - t)       # Primeros 2/3
            stooge_sort_rec(arr, i + t, j)       # Últimos 2/3
            stooge_sort_rec(arr, i, j - t)       # Primeros 2/3 de nuevo

    stooge_sort_rec(arr, 0, n - 1)
    formatj["array"] = arr.copy()
    formatj["compare"] = []
    formatj["swapped"] = False
    formatj["sorted_index"] = list(range(n))
    steps["steps"].append(formatj.copy())

    return steps
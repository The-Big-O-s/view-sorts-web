from fastapi import APIRouter
from ..schemas import SortRequest

router = APIRouter()

@router.post("/api/selection")
def selection_sort(payload: SortRequest):
    steps = {"steps" : []}
    arr = payload.array
    n = len(arr)
    formatj = {
        "array": [],
        "compare": [],
        "swapped": False,
        "sorted_index": []
    }
    for i in range(n):
        formatj["swapped"] = False #Falso predeterminado
        formatj["array"] = arr.copy() #Le damos la lista
        min_idx = i # Suponemos que el primer elemento no ordenado es el menor
        # Buscamos en el resto de la lista
        for j in range(i + 1, n):
            formatj["compare"] = [min_idx, j]
            if arr[j] < arr[min_idx]:
                formatj["swapped"] = True
                min_idx = j
            steps["steps"].append(formatj.copy())
        formatj["sorted_index"] = formatj["sorted_index"].copy()
        formatj["sorted_index"].append(i) #se agrega a la copia de sorted index ()
        formatj["compare"] = [] #Agrega un paso para identificar el index ordenado 
        steps["steps"].append(formatj.copy()) 
        arr[i], arr[min_idx] = arr[min_idx], arr[i] # Intercambiamos el menor encontrado con el primer elemento actual
    

    return steps
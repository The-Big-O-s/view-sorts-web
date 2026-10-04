from fastapi import APIRouter
from ..schemas import SortRequest

router = APIRouter()

@router.post("/api/insertion")
def insertion_sort(payload: SortRequest):
    steps = {"steps" : []}
    arr = payload.array.copy()
    formatj = {
        "array": [],
        "compare": [],
        "swapped": False,
        "key": None,
        "sorted_index": [0] if len(arr) > 0 else []
    }
    for i in range(1, len(arr)):
        formatj["array"] = arr.copy()
        formatj["swapped"] = False
        clave = arr[i]
        formatj["key"] = i
        j = i - 1
        # Compara la clave con los elementos anteriores y los desplaza
        while j >= 0 and arr[j] > clave:
            formatj["compare"] = [j, j + 1]
            formatj["array"] = arr.copy()
            formatj["swapped"] = True
            arr[j + 1] = arr[j]
            j -= 1
            steps["steps"].append(formatj.copy())
        # Colocar la clave en su posicion
        arr[j + 1] = clave
        formatj["swapped"] = False
        formatj["compare"] = []
        formatj["key"] = None
        formatj["array"] = arr.copy()
        formatj["sorted_index"] = list(range(i + 1))
        steps["steps"].append(formatj.copy())

    # Paso final: todo ordenado
    formatj["array"] = arr.copy()
    formatj["compare"] = []
    formatj["swapped"] = False
    formatj["key"] = None
    formatj["sorted_index"] = list(range(len(arr)))
    steps["steps"].append(formatj.copy())

    return steps
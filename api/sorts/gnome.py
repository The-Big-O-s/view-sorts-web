from fastapi import APIRouter
from ..schemas import SortRequest

router = APIRouter()

@router.post("/api/gnome")
def gnome_sort(payload: SortRequest):
    steps = {"steps" : []}
    arr = payload.array.copy()
    formatj = {
            "array": [],
            "compare": [],
            "swapped": False,
            "sorted_index": []
        }
    i = 0
    n = len(arr)
    
    while i < n:
        formatj["array"] = arr.copy()
        formatj["swapped"] = False
        formatj["compare"] = [i-1, i]
        if i == 0 or arr[i] >= arr[i - 1]:
            i += 1  # Avanza si está en orden
        else:
            formatj["swapped"] = True
            arr[i], arr[i - 1] = arr[i - 1], arr[i]  # Intercambia
            i -= 1  # Retrocede un paso
        steps["steps"].append(formatj.copy())
    formatj["array"] = arr.copy()
    formatj["swapped"] = False
    formatj["compare"] = []
    formatj["sorted_index"] = list(range(len(arr)))
    steps["steps"].append(formatj.copy())
 
    return steps
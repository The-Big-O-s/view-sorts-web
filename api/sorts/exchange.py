from fastapi import APIRouter
from ..schemas import SortRequest

router = APIRouter()

@router.post("/api/exchange")
def exchange_sort(payload: SortRequest):
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
        for j in range(i + 1, n):
            formatj["swapped"] = False
            formatj["array"] = arr.copy()
            formatj["compare"] = [i, j]
            # Si el elemento posterior es menor, intercambia de inmediato
            if arr[j] < arr[i]:
                formatj["swapped"] = True
                arr[i], arr[j] = arr[j], arr[i]
            steps["steps"].append(formatj.copy())
        formatj["sorted_index"] = formatj["sorted_index"].copy()
        formatj["sorted_index"].append(i)
        formatj["compare"] = []
        steps["steps"].append(formatj.copy())
    return steps
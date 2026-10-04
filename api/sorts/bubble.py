from fastapi import APIRouter
from ..schemas import SortRequest

router = APIRouter()

@router.post("/api/bubble")
def bubble_sort(payload: SortRequest):
    steps = {"steps" : []}
    arr = payload.array.copy()
    n = len(arr)
    formatj = {
        "array": [],
        "compare": [],
        "swapped": False,
        "sorted_index": []
    }
    for i in range(n):
        for j in range(0, n-i-1):
            formatj["swapped"] = False
            formatj["array"] = arr.copy()
            formatj["compare"] = [j, j+1]
            if arr[j] > arr[j+1]:
                formatj["swapped"] = True
                arr[j], arr[j+1] = arr[j+1], arr[j]
            steps["steps"].append(formatj.copy())
        formatj["array"] = arr.copy()
        formatj["swapped"] = False
        formatj["sorted_index"] = formatj["sorted_index"].copy()
        formatj["sorted_index"].append(n-i-1)
        formatj["compare"] = []
        steps["steps"].append(formatj.copy())
    return steps
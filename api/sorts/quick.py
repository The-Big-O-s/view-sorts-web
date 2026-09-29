from fastapi import APIRouter
from ..schemas import SortRequest

router = APIRouter()

@router.post("/api/quick")
def quick_sort(payload: SortRequest):
    steps = {"steps" : []}
    return steps
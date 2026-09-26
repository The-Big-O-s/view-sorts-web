from fastapi import APIRouter
from ..schemas import SortRequest

router = APIRouter()

@router.post("/api/selection")
def selection_sort(payload: SortRequest):
    steps = {"steps" : []}
    return steps
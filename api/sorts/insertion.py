from fastapi import APIRouter
from ..schemas import SortRequest

router = APIRouter()

@router.post("/api/insertion")
def insertion_sort(payload: SortRequest):
    steps = {"steps" : []}
    return steps
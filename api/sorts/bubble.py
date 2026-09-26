from fastapi import APIRouter
from ..schemas import SortRequest

router = APIRouter()

@router.post("/api/bubble")
def bubble_sort(payload: SortRequest):
    steps = {"steps" : []}
    return steps
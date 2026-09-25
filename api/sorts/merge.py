from fastapi import APIRouter
from ..schemas import SortRequest

router = APIRouter()

@router.post("/api/merge")
def merge_sort(payload: SortRequest):
    steps = {"steps" : []}
    return steps
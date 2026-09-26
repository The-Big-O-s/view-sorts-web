from fastapi import APIRouter
from ..schemas import SortRequest

router = APIRouter()

@router.post("/api/stooge")
def stooge_sort(payload: SortRequest):
    steps = {"steps" : []}
    return steps
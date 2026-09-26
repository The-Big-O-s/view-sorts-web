from fastapi import APIRouter
from ..schemas import SortRequest

router = APIRouter()

@router.post("/api/exchange")
def exchange_sort(payload: SortRequest):
    steps = {"steps" : []}
    return steps
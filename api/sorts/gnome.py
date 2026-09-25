from fastapi import APIRouter
from ..schemas import SortRequest

router = APIRouter()

@router.post("/api/gnome")
def gnome_sort(payload: SortRequest):
    steps = {"steps" : []}
    return steps
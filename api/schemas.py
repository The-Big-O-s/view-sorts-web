from pydantic import BaseModel, Field
from typing import List

class SortRequest(BaseModel):
    array: List[int] = Field(..., description="Lista de números enteros a ordenar", min_items=1)
from pydantic import BaseModel, Field

class SortRequest(BaseModel):
    array: list[int] = Field(..., description="Lista de números enteros a ordenar", min_length=1)
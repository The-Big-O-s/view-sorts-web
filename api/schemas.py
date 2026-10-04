from pydantic import BaseModel, Field

LIMITE_STOOGE = 20

class SortRequest(BaseModel):
    array: list[int] = Field(
        ...,
        min_length=1,
        max_length=50,
        description="Lista de números enteros a ordenar"
    )
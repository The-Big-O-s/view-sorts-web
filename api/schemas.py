from pydantic import BaseModel, Field

LIMITE_STOOGE = 20

class SortRequest(BaseModel):
    array: list[int] = Field(
        ...,
        min_length=1,
        max_length=50,
        description="Lista de números enteros a ordenar"
    )

LIMITE_TEXTO = 3000000

class CompressRequest(BaseModel):
    text: str = Field(
        ...,
        min_length=1,
        max_length=LIMITE_TEXTO,
        description="Texto a comprimir"
    )

class Symbol(BaseModel):
    char: str
    frequency: int
    code: str

class Stats(BaseModel):
    chars: int
    original_bytes: int
    encoded_bytes: int
    savings: float
    bits_per_char: float
    time_ms: float

class CompressResponse(BaseModel):
    symbols: list[Symbol]
    tree: dict
    encoded: str
    stats: Stats
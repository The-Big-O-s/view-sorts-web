from pydantic import BaseModel, Field

LIMITE_STOOGE = 20

class SortRequest(BaseModel):
    array: list[int] = Field(
        ...,
        min_length=1,
        max_length=50,
        description="Lista de números enteros a ordenar"
    )

class EncodeRequest(BaseModel):
    text: str = Field(
        ...,
        min_length=1,
        description="Texto a codificar con Huffman"
    )

class DecodeRequest(BaseModel):
    bits: str = Field(
        ...,
        min_length=1,
        pattern=r"^[01]+$",
        description="Cadena de bits a decodificar (solo 0 y 1)"
    )
    frequencies: dict[str, int] = Field(
        ...,
        min_length=1,
        description="Frecuencia de cada carácter, la misma que devolvió /api/hencode"
    )
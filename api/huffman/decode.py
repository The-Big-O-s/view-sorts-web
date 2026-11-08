from fastapi import APIRouter, HTTPException
from ..schemas import DecodeRequest
from huffman import build_tree

router = APIRouter()

def decode(bits: str, frequencies: dict[str, int]) -> dict:
    """Reconstruye el árbol a partir de las frecuencias y decodifica los bits."""
    if not bits:
        raise ValueError("La cadena de bits está vacía")
    if set(bits) - {"0", "1"}:
        raise ValueError("Los bits solo pueden contener '0' y '1'")
    if not frequencies or any(f <= 0 for f in frequencies.values()):
        raise ValueError("Las frecuencias deben ser enteros positivos")

    root = build_tree(frequencies)
    out = []
    node = root
    for b in bits:
        node = node.left if b == "0" else node.right
        if node is None:
            raise ValueError("Los bits no corresponden al árbol de las frecuencias dadas")
        if node.is_leaf():
            out.append(node.char)
            node = root

    if node is not root:
        raise ValueError("La cadena de bits termina a mitad de un código")

    return {"text": "".join(out)}


@router.post("/api/hdecode")
def hdecode(body: DecodeRequest):
    try:
        return decode(body.bits, body.frequencies)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
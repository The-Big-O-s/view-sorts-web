from fastapi import APIRouter, File, HTTPException, UploadFile

from .huffman import build_tree
from .tbos import read_tbos

router = APIRouter()

EXTENSION = ".tbos"
MAX_BYTES = 4 * 1024 * 1024  # 5 MB


def decode(bits: str, frequencies: dict[str, int]) -> dict:
    """Reconstruye el árbol a partir de las frecuencias y decodifica los bits."""
    if not bits:
        raise ValueError("La cadena de bits está vacía")
    if set(bits) - {"0", "1"}:
        raise ValueError("Los bits solo pueden contener '0' y '1'")
    if not frequencies or not all(
        isinstance(c, str) and len(c) == 1 and isinstance(f, int) and f > 0
        for c, f in frequencies.items()
    ):
        raise ValueError("Las frecuencias deben ser enteros positivos por carácter")

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
async def hdecode(file: UploadFile = File(...)):
    """Recibe un archivo .tbos (multipart/form-data, campo "file") y devuelve el texto."""
    if not (file.filename or "").lower().endswith(EXTENSION):
        raise HTTPException(status_code=400, detail=f"El archivo debe tener extensión {EXTENSION}")

    data = await file.read(MAX_BYTES + 1)
    if len(data) > MAX_BYTES:
        raise HTTPException(status_code=413, detail="El archivo es demasiado grande (máx. 5 MB)")

    try:
        frequencies, _total_bits, bits = read_tbos(data)
        return decode(bits, frequencies)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
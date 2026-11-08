import base64
from fastapi import APIRouter, HTTPException
from .huffman import build_codes, build_tree, count_frequencies, tree_to_dict
from ..schemas import EncodeRequest
from .tbos import write_tbos

router = APIRouter()

TBOS_FILENAME = "comprimido.tbos"

def encode(text: str) -> dict:
    """Codifica un texto con Huffman y devuelve todo lo que necesita el front."""
    if not text:
        raise ValueError("El texto está vacío")

    frequencies = count_frequencies(text)
    root = build_tree(frequencies)
    codes = build_codes(root)
    bits = "".join(codes[c] for c in text)
    original_bits = len(text) * 8
    tbos = write_tbos(frequencies, bits)

    return {
        "bits": bits,
        "codes": codes,
        "frequencies": frequencies,
        "tree": tree_to_dict(root),
        "original_bits": original_bits,
        "encoded_bits": len(bits),
        "ratio": len(bits) / original_bits,
        # Archivo .tbos listo para descargar (contenido en base64)
        "tbos": {
            "filename": TBOS_FILENAME,
            "size_bytes": len(tbos),
            "content_base64": base64.b64encode(tbos).decode("ascii"),
        },
    }


@router.post("/api/hencode")
def hencode(body: EncodeRequest):
    try:
        return encode(body.text)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
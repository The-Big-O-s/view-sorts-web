from fastapi import APIRouter, HTTPException
from ..schemas import EncodeRequest
from huffman import build_codes, build_tree, count_frequencies, tree_to_dict

router = APIRouter()

def encode(text: str) -> dict:
    """Codifica un texto con Huffman y devuelve todo lo que necesita el front."""
    if not text:
        raise ValueError("El texto está vacío")

    frequencies = count_frequencies(text)
    root = build_tree(frequencies)
    codes = build_codes(root)
    bits = "".join(codes[c] for c in text)
    original_bits = len(text) * 8

    return {
        "bits": bits,
        "codes": codes,
        "frequencies": frequencies,
        "tree": tree_to_dict(root),
        "original_bits": original_bits,
        "encoded_bits": len(bits),
        "ratio": len(bits) / original_bits,
    }


@router.post("/api/hencode")
def hencode(body: EncodeRequest):
    try:
        return encode(body.text)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
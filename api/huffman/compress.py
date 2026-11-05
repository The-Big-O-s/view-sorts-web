from fastapi import APIRouter
from ..schemas import CompressRequest, CompressResponse

router = APIRouter()

def build_stats(text: str, encoded: str, time_ms: float) -> dict:
    original_bytes = len(text.encode("utf-8"))
    encoded_bytes = (len(encoded) + 7) // 8 #bits redondeados hacia arriba a bytes
    return {
        "chars": len(text),
        "original_bytes": original_bytes,
        "encoded_bytes": encoded_bytes,
        "savings": round((1 - encoded_bytes / original_bytes) * 100, 1),
        "bits_per_char": round(len(encoded) / len(text), 2),
        "time_ms": round(time_ms, 1),
    }

@router.post("/api/huffman/compress", response_model=CompressResponse)
def compress(payload: CompressRequest):
    return
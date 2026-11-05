import json

SIGNATURE = b"TBOS"

def bits_to_bytes(bits: str) -> bytes:
    result = []

    for i in range(0, len(bits), 8):
        chunk = bits[i:i + 8]
        chunk = chunk.ljust(8, "0") # relleno del último byte
        result.append(int(chunk, 2))

    return bytes(result)

def bytes_to_bits(data: bytes, total_bits: int) -> str:
    parts = []

    for byte in data: # 110, 138, 220
        parts.append(format(byte, "08b")) # "01101110", "10001010", "11011100"
    bits = "".join(parts) # "011011101000101011011100"
    
    return bits[:total_bits]  # quita el relleno

def write_tbos(frequencies: dict, bits: str) -> bytes:
    header = {
        "frequencies": frequencies,
        "total_bits": len(bits),
    }
    header_bytes = json.dumps(header).encode("utf-8")
    header_size = len(header_bytes).to_bytes(4, "big")

    return SIGNATURE + header_size + header_bytes + bits_to_bytes(bits)

def read_tbos(data: bytes) -> tuple[dict, int, str]:
    if len(data) < 8:
        raise ValueError("Archivo demasiado corto")

    if data[0:4] != SIGNATURE:
        raise ValueError("No es un archivo .tbos")

    header_size = int.from_bytes(data[4:8], "big")
    header_end = 8 + header_size
    if len(data) < header_end:
        raise ValueError("Encabezado incompleto")

    try:
        header = json.loads(data[8:header_end].decode("utf-8"))
        frequencies = header["frequencies"]
        total_bits = header["total_bits"]
    except (UnicodeDecodeError, json.JSONDecodeError, KeyError, TypeError):
        raise ValueError("Encabezado dañado")

    if not isinstance(frequencies, dict) or not isinstance(total_bits, int):
        raise ValueError("Encabezado dañado")

    body = data[header_end:]
    if len(body) != (total_bits + 7) // 8:
        raise ValueError("Los datos no coinciden con el encabezado")

    return frequencies, total_bits, bytes_to_bits(body, total_bits)
import json
import re
import urllib.error
import urllib.parse
import urllib.request
from typing import Annotated

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import PlainTextResponse

router = APIRouter()

GUTENDEX = "https://gutendex.com/books/"
HEADERS = {"User-Agent": "vsa"}

START = re.compile(r"^\*\*\*\s*START OF (THE|THIS) PROJECT GUTENBERG EBOOK.*?\*\*\*.*$",
                   re.IGNORECASE | re.MULTILINE)
END = re.compile(r"^\*\*\*\s*END OF (THE|THIS) PROJECT GUTENBERG EBOOK.*$",
                 re.IGNORECASE | re.MULTILINE)

def _fetch(url: str) -> bytes:
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req) as res:
            return res.read()
    except urllib.error.HTTPError as e:
        if e.code == 404:
            raise HTTPException(404, "No se encontró el libro")
        raise HTTPException(502, "Project Gutenberg respondió con un error")
    except urllib.error.URLError:
        raise HTTPException(502, "No se pudo conectar con Project Gutenberg")

def _fetch_json(url: str) -> dict:
    return json.loads(_fetch(url))

def _plain_text_url(formats: dict) -> str | None:
    # Solo texto plano, descartando los .zip
    candidates = [(mime, url) for mime, url in formats.items()
                  if mime.startswith("text/plain") and not url.endswith(".zip")]
    if not candidates:
        return None
    candidates.sort(key=lambda c: "utf-8" not in c[0].lower())
    return candidates[0][1]

def _decode(data: bytes) -> str:
    try:
        text = data.decode("utf-8")
    except UnicodeDecodeError:
        text = data.decode("latin-1") # libros viejos que no están en utf-8
    return text

def _strip_license(text: str) -> str:
    # Si no están las marcas, se devuelve el texto entero
    start, end = START.search(text), END.search(text)
    if not start or not end or end.start() <= start.end():
        return text.strip()
    return text[start.end():end.start()].strip()

@router.get("/api/gutenberg/search")
def search(q: Annotated[str, Query(pattern=r"\S")]):
    data = _fetch_json(f"{GUTENDEX}?{urllib.parse.urlencode({'search': q})}")
    results = [
        {
            "id": book["id"],
            "title": book.get("title", ""),
            # Gutendex da una lista de autores; el front espera un solo texto
            "authors": "; ".join(a.get("name", "") for a in book.get("authors", [])),
            "downloads": book.get("download_count", 0),
        }
        for book in data.get("results", [])
    ]
    return {"count": data.get("count", len(results)), "results": results}


@router.get("/api/gutenberg/book/{book_id}", response_class=PlainTextResponse)
def download(book_id: int):
    book = _fetch_json(f"{GUTENDEX}{book_id}")
    url = _plain_text_url(book.get("formats", {}))
    if not url:
        raise HTTPException(404, "Ese libro no tiene versión en texto plano")
    text = _strip_license(_decode(_fetch(url)))
    return PlainTextResponse(text, media_type="text/plain; charset=utf-8")
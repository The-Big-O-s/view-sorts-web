from fastapi import FastAPI
from .sorts.bubble import router as bubble
from .sorts.exchange import router as exchange
from .sorts.gnome import router as gnome
from .sorts.insertion import router as insertion
from .sorts.merge import router as merge
from .sorts.quick import router as quick
from .sorts.selection import router as selection
from .sorts.stooge import router as stooge

app = FastAPI(title="Visualizador de Algoritmos")

routers = [bubble, exchange, gnome, insertion, merge, quick, selection, stooge]

for router in routers:
    app.include_router(router)

@app.get("/api/health")
def health_check():
    return {"status": "ok"}
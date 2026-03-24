import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from database import engine, Base
from routers import fornecedores, clientes, estoque, manufatura, pedidos, financeiro, auth

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Manufatura ERP",
    description="API para gestão de manufatura e revenda",
    version="1.0.0"
)

# CORS
origins = [
    "http://localhost",
    "http://localhost:5173", # Vite default
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(fornecedores.router)
app.include_router(clientes.router)
app.include_router(estoque.router)
app.include_router(manufatura.router)
app.include_router(pedidos.router)
app.include_router(financeiro.router)
app.include_router(auth.router)

# Serve Frontend estático se existir (para produção no mesmo container)
if os.path.isdir("static"):
    app.mount("/assets", StaticFiles(directory="static/assets"), name="assets")
    
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # Serve arquivos estáticos da raiz do dist (favicon, etc) ou index.html para o React Router
        path = f"static/{full_path}"
        if os.path.isfile(path):
            return FileResponse(path)
        return FileResponse("static/index.html")
else:
    @app.get("/")
    def read_root():
        return {"message": "Bem-vindo ao Manufatura ERP API (Modo Dev - Frontend não construído)"}

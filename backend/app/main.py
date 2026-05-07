# =============================================================
# main.py - Entry point utama aplikasi FastAPI SisaDapur
# Menginisialisasi aplikasi, middleware, dan mendaftarkan router
# =============================================================

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import ingredients, recipes
import os
from dotenv import load_dotenv

# Memuat environment variable dari file .env
load_dotenv()

# Membuat semua tabel di database secara otomatis dari model ORM
# Ini akan membuat tabel jika belum ada (tidak menghapus data yang ada)
Base.metadata.create_all(bind=engine)

# Inisialisasi aplikasi FastAPI dengan metadata untuk dokumentasi Swagger
app = FastAPI(
    title=os.getenv("APP_NAME", "SisaDapur API"),
    description="""
    ## 🍳 SisaDapur - API Rekomendasi Resep Berdasarkan Sisa Bahan

    API ini membantu pengguna menemukan resep masakan yang bisa dibuat
    dari bahan-bahan yang tersedia di kulkas mereka.

    ### Fitur Utama:
    - **POST /recipes/search-recipes** → Cari resep berdasarkan bahan yang tersedia
    - **GET /recipes** → Daftar semua resep
    - **GET /ingredients** → Daftar semua bahan
    - **POST /ingredients** → Tambah bahan baru
    - **POST /recipes** → Tambah resep baru
    """,
    version=os.getenv("APP_VERSION", "1.0.0"),
    docs_url="/docs",         # URL Swagger UI
    redoc_url="/redoc",       # URL ReDoc (dokumentasi alternatif)
    openapi_url="/openapi.json"  # URL untuk schema OpenAPI
)

# Konfigurasi CORS (Cross-Origin Resource Sharing)
# Mengizinkan frontend React (localhost:5173) mengakses API ini
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server (React)
        "http://localhost:3000",  # CRA dev server (opsional)
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],   # Izinkan semua HTTP method: GET, POST, PUT, DELETE, dll.
    allow_headers=["*"],   # Izinkan semua header
)

# Mendaftarkan router ke aplikasi utama
app.include_router(ingredients.router)  # Semua endpoint /ingredients/...
app.include_router(recipes.router)       # Semua endpoint /recipes/...


@app.get("/", tags=["Root"])
def root():
    """
    Endpoint root sebagai health check API.
    Mengembalikan informasi dasar aplikasi.
    """
    return {
        "app": "SisaDapur API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "message": "Selamat datang di SisaDapur API 🍳"
    }


@app.get("/health", tags=["Root"])
def health_check():
    """
    Endpoint health check untuk memantau status server.
    Biasa digunakan oleh load balancer atau monitoring tools.
    """
    return {"status": "healthy", "service": "sisadapur-api"}

# =============================================================
# database.py - Konfigurasi koneksi database menggunakan
# SQLAlchemy sebagai ORM dan PostgreSQL sebagai RDBMS
# =============================================================

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

# Memuat variabel lingkungan dari file .env
load_dotenv()

# URL koneksi database diambil dari environment variable
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/sisadapur")

# Membuat engine SQLAlchemy yang menghubungkan Python ke PostgreSQL
# pool_pre_ping=True memastikan koneksi selalu aktif sebelum digunakan
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    echo=False  # Ubah ke True untuk mencetak query SQL ke konsol (mode debug)
)

# SessionLocal adalah factory untuk membuat sesi database baru
# autocommit=False → perubahan harus di-commit secara eksplisit
# autoflush=False → perubahan tidak langsung dikirim ke DB sebelum commit
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base adalah kelas dasar untuk semua model ORM kita
Base = declarative_base()


def get_db():
    """
    Dependency Injection untuk mendapatkan sesi database.
    Digunakan oleh FastAPI pada setiap request.
    Memastikan sesi selalu ditutup setelah request selesai.
    """
    db = SessionLocal()
    try:
        yield db  # Memberikan sesi ke endpoint yang membutuhkan
    finally:
        db.close()  # Menutup sesi setelah request selesai

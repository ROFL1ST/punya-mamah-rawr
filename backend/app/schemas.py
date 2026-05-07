# =============================================================
# schemas.py - Definisi skema validasi data menggunakan Pydantic.
# Digunakan untuk memvalidasi request body dan menyusun response.
# =============================================================

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# ───────────────────────────────────────────────
# SCHEMAS UNTUK INGREDIENT (Bahan Masakan)
# ───────────────────────────────────────────────

class IngredientBase(BaseModel):
    """Skema dasar yang digunakan bersama untuk Create dan Read."""
    name: str = Field(..., min_length=2, max_length=100, example="Bawang Merah")
    unit: Optional[str] = Field(None, max_length=30, example="siung")


class IngredientCreate(IngredientBase):
    """Skema untuk membuat bahan baru (request body POST)."""
    pass  # Mewarisi semua field dari IngredientBase


class IngredientResponse(IngredientBase):
    """Skema untuk mengembalikan data bahan (response)."""
    id: int
    created_at: datetime

    class Config:
        from_attributes = True  # Mengizinkan konversi dari ORM model ke Pydantic


# ───────────────────────────────────────────────
# SCHEMAS UNTUK RECIPE INGREDIENT (Bahan dalam Resep)
# ───────────────────────────────────────────────

class RecipeIngredientBase(BaseModel):
    """Skema bahan beserta jumlahnya dalam sebuah resep."""
    ingredient_id: int = Field(..., example=1)
    quantity: Optional[float] = Field(None, example=2.0)
    unit: Optional[str] = Field(None, max_length=30, example="siung")


class RecipeIngredientResponse(BaseModel):
    """Skema response bahan dalam resep dengan nama bahan."""
    ingredient_id: int
    ingredient_name: str  # Nama bahan (join dari tabel ingredients)
    quantity: Optional[float]
    unit: Optional[str]

    class Config:
        from_attributes = True


# ───────────────────────────────────────────────
# SCHEMAS UNTUK RECIPE (Resep Masakan)
# ───────────────────────────────────────────────

class RecipeBase(BaseModel):
    """Skema dasar resep."""
    name: str = Field(..., min_length=3, max_length=200, example="Nasi Goreng Spesial")
    description: Optional[str] = Field(None, example="Nasi goreng lezat dengan bumbu rahasia")
    instructions: str = Field(..., example="1. Panaskan minyak...\n2. Tumis bawang...")
    cooking_time: Optional[int] = Field(None, ge=1, example=15)  # Minimal 1 menit
    servings: Optional[int] = Field(1, ge=1, example=2)  # Minimal 1 porsi
    image_url: Optional[str] = Field(None, example="https://example.com/nasi-goreng.jpg")
    difficulty: Optional[str] = Field("Sedang", example="Mudah")


class RecipeCreate(RecipeBase):
    """Skema untuk membuat resep baru, termasuk daftar bahan."""
    ingredients: List[RecipeIngredientBase] = Field(
        ...,
        min_length=1,
        example=[
            {"ingredient_id": 1, "quantity": 2, "unit": "siung"},
            {"ingredient_id": 2, "quantity": 100, "unit": "gram"}
        ]
    )


class RecipeResponse(RecipeBase):
    """Skema response resep lengkap dengan daftar bahan."""
    id: int
    created_at: datetime
    ingredients: List[RecipeIngredientResponse] = []

    class Config:
        from_attributes = True


# ───────────────────────────────────────────────
# SCHEMAS UNTUK PENCARIAN RESEP (Fitur Utama)
# ───────────────────────────────────────────────

class SearchRecipeRequest(BaseModel):
    """
    Skema request untuk endpoint POST /search-recipes.
    User mengirimkan daftar nama bahan yang tersedia di kulkas.
    """
    ingredients: List[str] = Field(
        ...,
        min_length=1,
        description="Daftar nama bahan yang tersedia di kulkas user",
        example=["telur", "bawang merah", "nasi", "kecap"]
    )
    limit: Optional[int] = Field(10, ge=1, le=50, description="Jumlah resep yang dikembalikan")


class RecipeMatchResponse(BaseModel):
    """
    Skema response untuk setiap resep yang cocok dengan bahan yang dimiliki.
    Menyertakan skor kecocokan (match_score) untuk ranking.
    """
    id: int
    name: str
    description: Optional[str]
    cooking_time: Optional[int]
    servings: Optional[int]
    image_url: Optional[str]
    difficulty: Optional[str]
    match_count: int = Field(..., description="Jumlah bahan yang cocok")
    total_ingredients: int = Field(..., description="Total bahan yang dibutuhkan resep")
    match_score: float = Field(..., description="Persentase kecocokan bahan (0.0 - 1.0)")
    matched_ingredients: List[str] = Field(..., description="Nama bahan yang cocok")
    missing_ingredients: List[str] = Field(..., description="Bahan yang belum tersedia")
    ingredients: List[RecipeIngredientResponse] = []

    class Config:
        from_attributes = True


class SearchRecipeResponse(BaseModel):
    """
    Skema response keseluruhan hasil pencarian resep.
    """
    query_ingredients: List[str] = Field(..., description="Bahan yang dicari user")
    total_found: int = Field(..., description="Jumlah resep yang ditemukan")
    recipes: List[RecipeMatchResponse] = Field(..., description="Daftar resep yang cocok")


# ───────────────────────────────────────────────
# SCHEMAS UMUM
# ───────────────────────────────────────────────

class MessageResponse(BaseModel):
    """Skema response sederhana untuk pesan sukses atau error."""
    message: str = Field(..., example="Operasi berhasil dilakukan")
    status: str = Field("success", example="success")

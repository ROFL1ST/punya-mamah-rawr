# =============================================================
# routers/ingredients.py - Endpoint untuk manajemen bahan masakan
# Menangani operasi CRUD: Create, Read, Update, Delete
# =============================================================

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..database import get_db

# Membuat router dengan prefix dan tag untuk dokumentasi Swagger
router = APIRouter(
    prefix="/ingredients",
    tags=["Ingredients - Manajemen Bahan Masakan"]
)


@router.post("/", response_model=schemas.IngredientResponse, status_code=status.HTTP_201_CREATED)
def create_ingredient(ingredient: schemas.IngredientCreate, db: Session = Depends(get_db)):
    """
    Membuat bahan masakan baru.
    - **name**: Nama bahan (wajib, unik)
    - **unit**: Satuan bahan (opsional)
    """
    # Cek apakah bahan dengan nama yang sama sudah ada
    existing = db.query(models.Ingredient).filter(
        models.Ingredient.name.ilike(ingredient.name)  # ilike = case-insensitive
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Bahan '{ingredient.name}' sudah terdaftar di database"
        )

    # Membuat objek model dari data yang diterima
    db_ingredient = models.Ingredient(
        name=ingredient.name.strip().lower(),  # Normalisasi: lowercase
        unit=ingredient.unit
    )
    db.add(db_ingredient)
    db.commit()
    db.refresh(db_ingredient)  # Memuat ulang data dari DB (termasuk ID yang di-generate)
    return db_ingredient


@router.get("/", response_model=List[schemas.IngredientResponse])
def get_all_ingredients(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Mengambil semua daftar bahan masakan dengan dukungan pagination.
    - **skip**: Lewati N data pertama (default: 0)
    - **limit**: Maksimal data yang dikembalikan (default: 100)
    """
    ingredients = db.query(models.Ingredient).offset(skip).limit(limit).all()
    return ingredients


@router.get("/{ingredient_id}", response_model=schemas.IngredientResponse)
def get_ingredient_by_id(ingredient_id: int, db: Session = Depends(get_db)):
    """
    Mengambil detail satu bahan berdasarkan ID.
    """
    ingredient = db.query(models.Ingredient).filter(
        models.Ingredient.id == ingredient_id
    ).first()
    if not ingredient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Bahan dengan ID {ingredient_id} tidak ditemukan"
        )
    return ingredient


@router.delete("/{ingredient_id}", response_model=schemas.MessageResponse)
def delete_ingredient(ingredient_id: int, db: Session = Depends(get_db)):
    """
    Menghapus bahan masakan berdasarkan ID.
    """
    ingredient = db.query(models.Ingredient).filter(
        models.Ingredient.id == ingredient_id
    ).first()
    if not ingredient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Bahan dengan ID {ingredient_id} tidak ditemukan"
        )
    db.delete(ingredient)
    db.commit()
    return {"message": f"Bahan '{ingredient.name}' berhasil dihapus", "status": "success"}

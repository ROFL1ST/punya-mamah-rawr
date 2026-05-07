# =============================================================
# routers/recipes.py - Endpoint untuk manajemen dan pencarian resep
# Termasuk endpoint utama POST /search-recipes
# =============================================================

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import List
from .. import models, schemas
from ..database import get_db

# Router untuk resep dengan prefix dan tag dokumentasi
router = APIRouter(
    prefix="/recipes",
    tags=["Recipes - Manajemen Resep Masakan"]
)


def build_recipe_response(recipe: models.Recipe) -> dict:
    """
    Helper function: Mengkonversi model Recipe ORM ke format dict
    yang sesuai dengan skema RecipeResponse.
    """
    return {
        "id": recipe.id,
        "name": recipe.name,
        "description": recipe.description,
        "instructions": recipe.instructions,
        "cooking_time": recipe.cooking_time,
        "servings": recipe.servings,
        "image_url": recipe.image_url,
        "difficulty": recipe.difficulty,
        "created_at": recipe.created_at,
        "ingredients": [
            {
                "ingredient_id": ri.ingredient_id,
                "ingredient_name": ri.ingredient.name,
                "quantity": ri.quantity,
                "unit": ri.unit
            }
            for ri in recipe.recipe_ingredients
        ]
    }


@router.post("/", response_model=schemas.RecipeResponse, status_code=status.HTTP_201_CREATED)
def create_recipe(recipe: schemas.RecipeCreate, db: Session = Depends(get_db)):
    """
    Membuat resep baru beserta daftar bahan yang dibutuhkan.
    """
    # Validasi: pastikan semua ingredient_id yang dikirim ada di database
    for item in recipe.ingredients:
        ingredient = db.query(models.Ingredient).filter(
            models.Ingredient.id == item.ingredient_id
        ).first()
        if not ingredient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Bahan dengan ID {item.ingredient_id} tidak ditemukan"
            )

    # Membuat objek resep baru
    db_recipe = models.Recipe(
        name=recipe.name,
        description=recipe.description,
        instructions=recipe.instructions,
        cooking_time=recipe.cooking_time,
        servings=recipe.servings,
        image_url=recipe.image_url,
        difficulty=recipe.difficulty
    )
    db.add(db_recipe)
    db.flush()  # Flush agar recipe.id tersedia sebelum commit

    # Menambahkan setiap bahan ke tabel recipe_ingredients
    for item in recipe.ingredients:
        db_ri = models.RecipeIngredient(
            recipe_id=db_recipe.id,
            ingredient_id=item.ingredient_id,
            quantity=item.quantity,
            unit=item.unit
        )
        db.add(db_ri)

    db.commit()
    db.refresh(db_recipe)

    # Eager load relasi agar bisa di-serialize
    db_recipe = db.query(models.Recipe).options(
        joinedload(models.Recipe.recipe_ingredients).joinedload(models.RecipeIngredient.ingredient)
    ).filter(models.Recipe.id == db_recipe.id).first()

    return build_recipe_response(db_recipe)


@router.get("/", response_model=List[schemas.RecipeResponse])
def get_all_recipes(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    """
    Mengambil semua resep dengan pagination.
    """
    recipes = db.query(models.Recipe).options(
        joinedload(models.Recipe.recipe_ingredients).joinedload(models.RecipeIngredient.ingredient)
    ).offset(skip).limit(limit).all()
    return [build_recipe_response(r) for r in recipes]


@router.get("/{recipe_id}", response_model=schemas.RecipeResponse)
def get_recipe_by_id(recipe_id: int, db: Session = Depends(get_db)):
    """
    Mengambil detail satu resep berdasarkan ID.
    """
    recipe = db.query(models.Recipe).options(
        joinedload(models.Recipe.recipe_ingredients).joinedload(models.RecipeIngredient.ingredient)
    ).filter(models.Recipe.id == recipe_id).first()

    if not recipe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Resep dengan ID {recipe_id} tidak ditemukan"
        )
    return build_recipe_response(recipe)


@router.delete("/{recipe_id}", response_model=schemas.MessageResponse)
def delete_recipe(recipe_id: int, db: Session = Depends(get_db)):
    """
    Menghapus resep beserta semua data bahannya (cascade delete).
    """
    recipe = db.query(models.Recipe).filter(models.Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Resep dengan ID {recipe_id} tidak ditemukan"
        )
    db.delete(recipe)
    db.commit()
    return {"message": f"Resep '{recipe.name}' berhasil dihapus", "status": "success"}


# ═══════════════════════════════════════════════════════════════
# ENDPOINT UTAMA: POST /recipes/search-recipes
# Algoritma pencocokan bahan dengan skor kecocokan tertinggi
# ═══════════════════════════════════════════════════════════════

@router.post("/search-recipes", response_model=schemas.SearchRecipeResponse)
def search_recipes_by_ingredients(
    search_data: schemas.SearchRecipeRequest,
    db: Session = Depends(get_db)
):
    """
    **Endpoint Utama SisaDapur** 🍳

    Menerima daftar nama bahan yang user miliki, lalu mengembalikan
    daftar resep yang diurutkan berdasarkan persentase kecocokan bahan
    tertinggi ke terendah.

    **Algoritma Pencocokan:**
    1. Normalisasi nama bahan dari input user (lowercase, strip whitespace)
    2. Cari semua resep di database beserta bahan-bahannya
    3. Hitung berapa bahan milik user yang cocok dengan bahan setiap resep
    4. Hitung match_score = jumlah_cocok / total_bahan_resep
    5. Urutkan dari match_score tertinggi
    6. Kembalikan N resep teratas sesuai parameter `limit`
    """
    # Langkah 1: Normalisasi bahan yang dikirim user
    user_ingredients = [
        ing.strip().lower() for ing in search_data.ingredients
    ]

    # Langkah 2: Ambil semua resep dengan eager loading bahan-bahannya
    all_recipes = db.query(models.Recipe).options(
        joinedload(models.Recipe.recipe_ingredients).joinedload(models.RecipeIngredient.ingredient)
    ).all()

    # Langkah 3: Hitung skor kecocokan untuk setiap resep
    recipe_matches = []
    for recipe in all_recipes:
        # Ambil semua nama bahan yang dibutuhkan resep ini
        recipe_ingredient_names = [
            ri.ingredient.name.strip().lower()
            for ri in recipe.recipe_ingredients
        ]
        total_ingredients = len(recipe_ingredient_names)

        if total_ingredients == 0:
            continue  # Lewati resep tanpa bahan

        # Hitung bahan yang cocok (pencocokan parsial / substring)
        matched = []
        missing = []
        for req_ing in recipe_ingredient_names:
            # Cek apakah ada bahan user yang cocok (exact atau substring)
            is_match = any(
                req_ing in user_ing or user_ing in req_ing
                for user_ing in user_ingredients
            )
            if is_match:
                matched.append(req_ing)
            else:
                missing.append(req_ing)

        match_count = len(matched)
        match_score = round(match_count / total_ingredients, 4)  # Nilai 0.0 - 1.0

        # Hanya sertakan resep yang memiliki minimal 1 bahan cocok
        if match_count > 0:
            recipe_matches.append({
                "id": recipe.id,
                "name": recipe.name,
                "description": recipe.description,
                "cooking_time": recipe.cooking_time,
                "servings": recipe.servings,
                "image_url": recipe.image_url,
                "difficulty": recipe.difficulty,
                "match_count": match_count,
                "total_ingredients": total_ingredients,
                "match_score": match_score,
                "matched_ingredients": matched,
                "missing_ingredients": missing,
                "ingredients": [
                    {
                        "ingredient_id": ri.ingredient_id,
                        "ingredient_name": ri.ingredient.name,
                        "quantity": ri.quantity,
                        "unit": ri.unit
                    }
                    for ri in recipe.recipe_ingredients
                ]
            })

    # Langkah 4: Urutkan berdasarkan match_score tertinggi, lalu match_count
    recipe_matches.sort(key=lambda x: (x["match_score"], x["match_count"]), reverse=True)

    # Langkah 5: Batasi jumlah hasil sesuai parameter limit
    limited_results = recipe_matches[:search_data.limit]

    return {
        "query_ingredients": search_data.ingredients,
        "total_found": len(limited_results),
        "recipes": limited_results
    }

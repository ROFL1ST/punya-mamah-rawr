# =============================================================
# models.py - Definisi skema tabel database menggunakan
# SQLAlchemy ORM. Setiap class merepresentasikan satu tabel.
# =============================================================

from sqlalchemy import (
    Column, Integer, String, Text, Float,
    ForeignKey, DateTime, func
)
from sqlalchemy.orm import relationship
from .database import Base


class Ingredient(Base):
    """
    Tabel 'ingredients' — menyimpan daftar bahan masakan yang tersedia.
    Contoh: bawang merah, telur, tomat, dll.
    """
    __tablename__ = "ingredients"

    id = Column(Integer, primary_key=True, index=True)  # Primary key auto-increment
    name = Column(String(100), unique=True, nullable=False, index=True)  # Nama bahan, unik
    unit = Column(String(30), nullable=True)  # Satuan: gram, buah, sendok, dll.
    created_at = Column(DateTime(timezone=True), server_default=func.now())  # Waktu dibuat

    # Relasi one-to-many: satu bahan bisa ada di banyak RecipeIngredient
    recipe_ingredients = relationship("RecipeIngredient", back_populates="ingredient")


class Recipe(Base):
    """
    Tabel 'recipes' — menyimpan data resep masakan.
    Contoh: Nasi Goreng, Mie Goreng, Ayam Bakar, dll.
    """
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True, index=True)  # Primary key auto-increment
    name = Column(String(200), nullable=False, index=True)  # Nama resep
    description = Column(Text, nullable=True)  # Deskripsi singkat resep
    instructions = Column(Text, nullable=False)  # Langkah-langkah memasak
    cooking_time = Column(Integer, nullable=True)  # Estimasi waktu memasak (menit)
    servings = Column(Integer, default=1)  # Untuk berapa porsi
    image_url = Column(String(500), nullable=True)  # URL gambar resep
    difficulty = Column(String(20), default="Sedang")  # Mudah / Sedang / Sulit
    created_at = Column(DateTime(timezone=True), server_default=func.now())  # Waktu dibuat

    # Relasi one-to-many: satu resep memiliki banyak bahan
    recipe_ingredients = relationship(
        "RecipeIngredient",
        back_populates="recipe",
        cascade="all, delete-orphan"  # Hapus bahan saat resep dihapus
    )


class RecipeIngredient(Base):
    """
    Tabel 'recipe_ingredients' — tabel penghubung (junction table)
    antara resep dan bahan. Menyimpan berapa banyak bahan dibutuhkan
    oleh suatu resep. Relasi: Many-to-Many antara Recipe dan Ingredient.
    """
    __tablename__ = "recipe_ingredients"

    id = Column(Integer, primary_key=True, index=True)  # Primary key
    recipe_id = Column(
        Integer,
        ForeignKey("recipes.id", ondelete="CASCADE"),  # Hapus jika resep dihapus
        nullable=False
    )
    ingredient_id = Column(
        Integer,
        ForeignKey("ingredients.id", ondelete="CASCADE"),  # Hapus jika bahan dihapus
        nullable=False
    )
    quantity = Column(Float, nullable=True)  # Jumlah bahan yang dibutuhkan
    unit = Column(String(30), nullable=True)  # Satuan: gram, sdm, buah, dll.

    # Relasi balik ke tabel Recipe dan Ingredient
    recipe = relationship("Recipe", back_populates="recipe_ingredients")
    ingredient = relationship("Ingredient", back_populates="recipe_ingredients")

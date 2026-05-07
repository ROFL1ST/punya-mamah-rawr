# =============================================================
# seed_data.py - Script untuk mengisi database dengan data awal
# Jalankan sekali dengan: python -m app.seed_data
# =============================================================

from .database import SessionLocal, engine, Base
from . import models

def seed():
    """Mengisi database dengan data bahan dan resep awal untuk testing."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Cek jika sudah ada data
    if db.query(models.Ingredient).count() > 0:
        print("Database sudah memiliki data. Seed dibatalkan.")
        db.close()
        return

    print("Mengisi data bahan masakan...")
    bahan_list = [
        models.Ingredient(name="bawang merah", unit="siung"),
        models.Ingredient(name="telur", unit="butir"),
        models.Ingredient(name="nasi", unit="gram"),
        models.Ingredient(name="kecap manis", unit="sdm"),
        models.Ingredient(name="garam", unit="sdt"),
        models.Ingredient(name="ayam", unit="gram"),
        models.Ingredient(name="mie", unit="bungkus"),
        models.Ingredient(name="tomat", unit="buah"),
        models.Ingredient(name="kentang", unit="gram"),
        models.Ingredient(name="wortel", unit="gram"),
        models.Ingredient(name="bawang putih", unit="siung"),
        models.Ingredient(name="minyak goreng", unit="sdm"),
        models.Ingredient(name="cabai merah", unit="buah"),
        models.Ingredient(name="santan", unit="ml"),
        models.Ingredient(name="tahu", unit="buah"),
        models.Ingredient(name="tempe", unit="gram"),
    ]
    db.add_all(bahan_list)
    db.commit()
    print(f"{len(bahan_list)} bahan berhasil ditambahkan.")

    # Ambil ID yang ter-generate
    bawang_merah = db.query(models.Ingredient).filter_by(name="bawang merah").first()
    telur = db.query(models.Ingredient).filter_by(name="telur").first()
    nasi = db.query(models.Ingredient).filter_by(name="nasi").first()
    kecap = db.query(models.Ingredient).filter_by(name="kecap manis").first()
    garam = db.query(models.Ingredient).filter_by(name="garam").first()
    ayam = db.query(models.Ingredient).filter_by(name="ayam").first()
    mie = db.query(models.Ingredient).filter_by(name="mie").first()
    kentang = db.query(models.Ingredient).filter_by(name="kentang").first()
    wortel = db.query(models.Ingredient).filter_by(name="wortel").first()
    bawang_putih = db.query(models.Ingredient).filter_by(name="bawang putih").first()
    cabai = db.query(models.Ingredient).filter_by(name="cabai merah").first()
    santan = db.query(models.Ingredient).filter_by(name="santan").first()
    tahu = db.query(models.Ingredient).filter_by(name="tahu").first()
    tempe = db.query(models.Ingredient).filter_by(name="tempe").first()

    print("Mengisi data resep...")
    resep_list = [
        {
            "recipe": models.Recipe(
                name="Nasi Goreng Spesial",
                description="Nasi goreng lezat dengan telur dan kecap manis",
                instructions="1. Panaskan minyak.\n2. Tumis bawang merah.\n3. Orak-arik telur.\n4. Masukkan nasi, kecap, garam. Aduk rata.",
                cooking_time=15, servings=2, difficulty="Mudah"
            ),
            "ingredients": [
                (bawang_merah, 3, "siung"), (telur, 2, "butir"),
                (nasi, 200, "gram"), (kecap, 2, "sdm"), (garam, 1, "sdt")
            ]
        },
        {
            "recipe": models.Recipe(
                name="Mie Goreng Ayam",
                description="Mie goreng gurih dengan potongan ayam",
                instructions="1. Rebus mie.\n2. Tumis bawang + ayam.\n3. Masukkan mie + bumbu.",
                cooking_time=20, servings=2, difficulty="Sedang"
            ),
            "ingredients": [
                (bawang_merah, 4, "siung"), (ayam, 150, "gram"),
                (mie, 1, "bungkus"), (kecap, 2, "sdm"), (garam, 1, "sdt")
            ]
        },
        {
            "recipe": models.Recipe(
                name="Perkedel Kentang",
                description="Gorengan perkedel kentang gurih dan lezat",
                instructions="1. Rebus kentang, haluskan.\n2. Campur telur, garam, bawang putih.\n3. Bentuk bulat dan goreng.",
                cooking_time=30, servings=4, difficulty="Sedang"
            ),
            "ingredients": [
                (kentang, 300, "gram"), (telur, 1, "butir"),
                (bawang_putih, 3, "siung"), (garam, 1, "sdt")
            ]
        },
        {
            "recipe": models.Recipe(
                name="Ayam Goreng Bumbu Kuning",
                description="Ayam goreng renyah dengan bumbu kuning khas Indonesia",
                instructions="1. Haluskan bumbu.\n2. Ungkep ayam dengan bumbu 30 menit.\n3. Goreng hingga keemasan.",
                cooking_time=45, servings=4, difficulty="Sulit"
            ),
            "ingredients": [
                (ayam, 500, "gram"), (bawang_merah, 5, "siung"),
                (bawang_putih, 4, "siung"), (garam, 2, "sdt")
            ]
        },
        {
            "recipe": models.Recipe(
                name="Tempe Orek Pedas",
                description="Tempe goreng dengan bumbu manis pedas yang menggugah selera",
                instructions="1. Potong tempe, goreng setengah matang.\n2. Tumis bumbu halus.\n3. Masukkan tempe + kecap + cabai.",
                cooking_time=20, servings=3, difficulty="Mudah"
            ),
            "ingredients": [
                (tempe, 200, "gram"), (cabai, 3, "buah"),
                (bawang_merah, 3, "siung"), (kecap, 2, "sdm"), (garam, 1, "sdt")
            ]
        },
    ]

    for item in resep_list:
        db.add(item["recipe"])
        db.flush()
        for ing, qty, unit in item["ingredients"]:
            db.add(models.RecipeIngredient(
                recipe_id=item["recipe"].id,
                ingredient_id=ing.id,
                quantity=qty,
                unit=unit
            ))

    db.commit()
    print(f"{len(resep_list)} resep berhasil ditambahkan.")
    print("\n✅ Seed data selesai! Database siap digunakan.")
    db.close()


if __name__ == "__main__":
    seed()

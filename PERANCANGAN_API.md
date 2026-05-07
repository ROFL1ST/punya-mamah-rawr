# 📋 Perancangan REST API — SisaDapur

> Dokumen ini ditujukan untuk keperluan Penulisan Ilmiah dan mengikuti standar REST API.

---

## 1. Informasi Umum API

| Item | Detail |
|------|--------|
| Base URL | `http://localhost:8000` |
| Format Data | JSON |
| Autentikasi | Tidak (pengembangan awal) |
| Dokumentasi | `http://localhost:8000/docs` (Swagger UI) |

---

## 2. Daftar Endpoint

### 2.1 Ingredients (Bahan Masakan)

| Method | Endpoint | Deskripsi | Status Code |
|--------|----------|-----------|-------------|
| `GET` | `/ingredients/` | Ambil semua bahan | 200 OK |
| `GET` | `/ingredients/{id}` | Ambil bahan berdasarkan ID | 200 OK / 404 |
| `POST` | `/ingredients/` | Tambah bahan baru | 201 Created |
| `DELETE` | `/ingredients/{id}` | Hapus bahan | 200 OK / 404 |

### 2.2 Recipes (Resep Masakan)

| Method | Endpoint | Deskripsi | Status Code |
|--------|----------|-----------|-------------|
| `GET` | `/recipes/` | Ambil semua resep | 200 OK |
| `GET` | `/recipes/{id}` | Ambil resep berdasarkan ID | 200 OK / 404 |
| `POST` | `/recipes/` | Tambah resep baru | 201 Created |
| `DELETE` | `/recipes/{id}` | Hapus resep | 200 OK / 404 |
| `POST` | `/recipes/search-recipes` | **Cari resep dari bahan** ⭐ | 200 OK |

---

## 3. Detail Endpoint Utama: POST /recipes/search-recipes

### Request
```
POST /recipes/search-recipes
Content-Type: application/json
```

**Request Body:**
```json
{
  "ingredients": ["telur", "nasi", "bawang merah", "kecap manis"],
  "limit": 10
}
```

| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|------------|
| `ingredients` | `array[string]` | ✅ | Daftar nama bahan yang dimiliki user |
| `limit` | `integer` | ❌ | Jumlah resep yang dikembalikan (default: 10, maks: 50) |

### Response (200 OK)
```json
{
  "query_ingredients": ["telur", "nasi", "bawang merah", "kecap manis"],
  "total_found": 2,
  "recipes": [
    {
      "id": 1,
      "name": "Nasi Goreng Spesial",
      "description": "Nasi goreng lezat dengan telur dan kecap manis",
      "cooking_time": 15,
      "servings": 2,
      "difficulty": "Mudah",
      "image_url": null,
      "match_count": 4,
      "total_ingredients": 5,
      "match_score": 0.8,
      "matched_ingredients": ["bawang merah", "telur", "nasi", "kecap manis"],
      "missing_ingredients": ["garam"],
      "ingredients": [
        {"ingredient_id": 1, "ingredient_name": "bawang merah", "quantity": 3, "unit": "siung"},
        {"ingredient_id": 2, "ingredient_name": "telur", "quantity": 2, "unit": "butir"}
      ]
    }
  ]
}
```

### Response Error (422 Unprocessable Entity)
```json
{
  "detail": [
    {
      "loc": ["body", "ingredients"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

---

## 4. Skema Database

```
ingredients
├── id           INT PK AUTO_INCREMENT
├── name         VARCHAR(100) UNIQUE NOT NULL
├── unit         VARCHAR(30)
└── created_at   TIMESTAMP DEFAULT NOW()

recipes
├── id           INT PK AUTO_INCREMENT
├── name         VARCHAR(200) NOT NULL
├── description  TEXT
├── instructions TEXT NOT NULL
├── cooking_time INT (menit)
├── servings     INT DEFAULT 1
├── image_url    VARCHAR(500)
├── difficulty   VARCHAR(20) DEFAULT 'Sedang'
└── created_at   TIMESTAMP DEFAULT NOW()

recipe_ingredients  ← Junction Table
├── id             INT PK AUTO_INCREMENT
├── recipe_id      INT FK → recipes.id ON DELETE CASCADE
├── ingredient_id  INT FK → ingredients.id ON DELETE CASCADE
├── quantity       FLOAT
└── unit           VARCHAR(30)
```

---

## 5. Algoritma Pencocokan Bahan

```
match_score = jumlah_bahan_cocok / total_bahan_resep
```

Contoh:
- Resep Nasi Goreng butuh 5 bahan
- User punya 4 dari 5 bahan
- match_score = 4/5 = 0.8 (80%)
- Hasil diurutkan dari match_score tertinggi ke terendah

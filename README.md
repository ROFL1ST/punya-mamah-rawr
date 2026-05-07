# 🍳 SisaDapur

Aplikasi web yang menyarankan resep masakan berdasarkan sisa bahan di kulkas pengguna.

## Tech Stack
- **Backend**: FastAPI + SQLAlchemy + PostgreSQL
- **Frontend**: ReactJS + Tailwind CSS
- **API Testing**: REST Client (VS Code) / Swagger UI

## Struktur Folder
```
sisadapur/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── database.py
│   │   └── routers/
│   │       ├── __init__.py
│   │       ├── ingredients.py
│   │       └── recipes.py
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   └── App.jsx
    ├── package.json
    └── tailwind.config.js
```

## Cara Menjalankan

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

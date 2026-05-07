// =============================================================
// App.jsx - Komponen utama SisaDapur dengan navigasi halaman
// =============================================================

import React, { useState } from 'react';
import IngredientInput from './components/IngredientInput';
import RecipeCard from './components/RecipeCard';
import AdminPage from './pages/AdminPage';
import { searchRecipes } from './api/sisadapurApi';

function App() {
  // Halaman aktif: 'home' atau 'admin'
  const [activePage, setActivePage] = useState('home');

  // State halaman Home
  const [ingredients, setIngredients] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleAddIngredient = (ingredient) => {
    setIngredients(prev => [...prev, ingredient]);
  };

  const handleRemoveIngredient = (ingredient) => {
    setIngredients(prev => prev.filter(ing => ing !== ingredient));
  };

  const handleSearch = async () => {
    if (ingredients.length === 0) return;
    setLoading(true);
    setError(null);
    setHasSearched(true);
    try {
      const data = await searchRecipes(ingredients, 12);
      setResults(data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        'Gagal terhubung ke server. Pastikan backend sudah berjalan.'
      );
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-amber-50">

      {/* ── HEADER + NAVIGASI ── */}
      <header className="bg-gradient-to-r from-orange-500 to-red-500 shadow-lg sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => setActivePage('home')}
            className="flex items-center gap-3 hover:opacity-90 transition-opacity"
          >
            <span className="text-3xl">🍳</span>
            <div className="text-left">
              <h1 className="text-xl font-bold text-white leading-tight">SisaDapur</h1>
              <p className="text-orange-100 text-xs">Masak dari sisa bahan kulkas</p>
            </div>
          </button>

          {/* Navigasi Tab */}
          <nav className="flex gap-1 bg-orange-600 bg-opacity-40 p-1 rounded-xl">
            <button
              onClick={() => setActivePage('home')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activePage === 'home'
                  ? 'bg-white text-orange-600 shadow'
                  : 'text-white hover:bg-white hover:bg-opacity-20'
              }`}
            >
              🔍 Cari Resep
            </button>
            <button
              onClick={() => setActivePage('admin')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activePage === 'admin'
                  ? 'bg-white text-orange-600 shadow'
                  : 'text-white hover:bg-white hover:bg-opacity-20'
              }`}
            >
              ⚙️ Admin
            </button>
          </nav>
        </div>
      </header>

      {/* ── KONTEN HALAMAN ── */}
      <main className="max-w-4xl mx-auto px-4 py-8">

        {/* ═ HALAMAN HOME: Cari Resep ═ */}
        {activePage === 'home' && (
          <div>
            <IngredientInput
              ingredients={ingredients}
              onAdd={handleAddIngredient}
              onRemove={handleRemoveIngredient}
              onSearch={handleSearch}
              loading={loading}
            />

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 mb-6">
                <p className="font-semibold">⚠️ Terjadi Kesalahan</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            )}

            {results && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-bold text-gray-800">Hasil Pencarian</h2>
                  <span className="bg-orange-100 text-orange-700 text-sm font-semibold px-3 py-1 rounded-full">
                    {results.total_found} resep ditemukan
                  </span>
                </div>

                <p className="text-sm text-gray-500 mb-6">
                  Berdasarkan:{' '}
                  {results.query_ingredients.map((ing, i) => (
                    <span key={ing}>
                      <span className="font-medium text-orange-600">{ing}</span>
                      {i < results.query_ingredients.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </p>

                {results.recipes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {results.recipes.map((recipe, index) => (
                      <RecipeCard key={recipe.id} recipe={recipe} rank={index + 1} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <span className="text-6xl block mb-4">😔</span>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Tidak Ada Resep yang Cocok</h3>
                    <p className="text-gray-500">Coba tambahkan lebih banyak bahan atau tambah resep baru di halaman Admin.</p>
                  </div>
                )}
              </div>
            )}

            {!hasSearched && !loading && (
              <div className="text-center py-12">
                <span className="text-7xl block mb-4">🥗</span>
                <h2 className="text-2xl font-bold text-gray-700 mb-3">Apa yang ada di kulkasmu?</h2>
                <p className="text-gray-500 max-w-md mx-auto">
                  Tambahkan bahan yang kamu punya, lalu klik
                  <strong className="text-orange-600"> Cari Resep</strong> untuk mendapatkan rekomendasi!
                </p>
              </div>
            )}
          </div>
        )}

        {/* ═ HALAMAN ADMIN ═ */}
        {activePage === 'admin' && <AdminPage />}
      </main>

      {/* FOOTER */}
      <footer className="text-center text-gray-400 text-sm py-6 mt-8">
        <p>🍳 SisaDapur © 2025 — Dibuat dengan FastAPI + React + Tailwind CSS</p>
      </footer>
    </div>
  );
}

export default App;

// =============================================================
// App.jsx - Komponen utama aplikasi SisaDapur
// Mengelola state global dan mengatur alur aplikasi
// =============================================================

import React, { useState } from 'react';
import IngredientInput from './components/IngredientInput';
import RecipeCard from './components/RecipeCard';
import { searchRecipes } from './api/sisadapurApi';

/**
 * Komponen utama App SisaDapur.
 * State management:
 * - ingredients: daftar bahan yang dimasukkan user
 * - results: hasil pencarian resep dari API
 * - loading: status loading saat request API
 * - error: pesan error jika request gagal
 * - hasSearched: apakah user sudah pernah melakukan pencarian
 */
function App() {
  const [ingredients, setIngredients] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  /**
   * Menambah bahan ke daftar state.
   * @param {string} ingredient - Nama bahan yang akan ditambah
   */
  const handleAddIngredient = (ingredient) => {
    setIngredients(prev => [...prev, ingredient]);
  };

  /**
   * Menghapus bahan dari daftar state.
   * @param {string} ingredient - Nama bahan yang akan dihapus
   */
  const handleRemoveIngredient = (ingredient) => {
    setIngredients(prev => prev.filter(ing => ing !== ingredient));
  };

  /**
   * Melakukan pencarian resep ke backend FastAPI.
   * Mengirim daftar bahan dan menerima resep yang cocok.
   */
  const handleSearch = async () => {
    if (ingredients.length === 0) return;

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      // Memanggil API pencarian resep
      const data = await searchRecipes(ingredients, 12);
      setResults(data);
    } catch (err) {
      // Menangani error koneksi atau server
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
      {/* ── HEADER ── */}
      <header className="bg-gradient-to-r from-orange-500 to-red-500 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-5 flex items-center gap-3">
          <span className="text-4xl">🍳</span>
          <div>
            <h1 className="text-2xl font-bold text-white leading-tight">SisaDapur</h1>
            <p className="text-orange-100 text-sm">Masak lezat dari sisa bahan di kulkasmu</p>
          </div>
        </div>
      </header>

      {/* ── KONTEN UTAMA ── */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Komponen input bahan */}
        <IngredientInput
          ingredients={ingredients}
          onAdd={handleAddIngredient}
          onRemove={handleRemoveIngredient}
          onSearch={handleSearch}
          loading={loading}
        />

        {/* Tampilkan pesan error jika ada */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 mb-6">
            <p className="font-semibold">⚠️ Terjadi Kesalahan</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {/* ── HASIL PENCARIAN ── */}
        {results && (
          <div>
            {/* Info jumlah resep ditemukan */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-800">
                Hasil Pencarian
              </h2>
              <span className="bg-orange-100 text-orange-700 text-sm font-semibold
                               px-3 py-1 rounded-full">
                {results.total_found} resep ditemukan
              </span>
            </div>

            {/* Bahan yang dicari (ditampilkan ulang sebagai konfirmasi) */}
            <p className="text-sm text-gray-500 mb-6">
              Berdasarkan: {
                results.query_ingredients.map(ing => (
                  <span key={ing} className="font-medium text-orange-600">{ing}</span>
                )).reduce((prev, curr) => [prev, ', ', curr])
              }
            </p>

            {/* Grid kartu resep */}
            {results.recipes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
                {results.recipes.map((recipe, index) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    rank={index + 1}  // Peringkat dimulai dari 1
                  />
                ))}
              </div>
            ) : (
              /* Pesan jika tidak ada resep yang cocok */
              <div className="text-center py-16">
                <span className="text-6xl block mb-4">😔</span>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Tidak Ada Resep yang Cocok
                </h3>
                <p className="text-gray-500">
                  Coba tambahkan lebih banyak bahan atau variasikan nama bahan yang kamu masukkan.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tampilkan panduan awal sebelum pencarian */}
        {!hasSearched && !loading && (
          <div className="text-center py-12">
            <span className="text-7xl block mb-4">🥗</span>
            <h2 className="text-2xl font-bold text-gray-700 mb-3">
              Apa yang ada di kulkasmu?
            </h2>
            <p className="text-gray-500 max-w-md mx-auto">
              Tambahkan bahan-bahan yang kamu punya, lalu klik tombol
              <strong className="text-orange-600"> Cari Resep</strong> untuk
              mendapatkan rekomendasi masakan yang bisa kamu buat!
            </p>
          </div>
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer className="text-center text-gray-400 text-sm py-6 mt-8">
        <p>🍳 SisaDapur © 2025 — Dibuat dengan FastAPI + React + Tailwind CSS</p>
      </footer>
    </div>
  );
}

export default App;

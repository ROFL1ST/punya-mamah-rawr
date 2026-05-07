// =============================================================
// components/RecipeCard.jsx
// Komponen kartu resep yang menampilkan detail resep beserta
// skor kecocokan bahan dan informasi tambahan
// =============================================================

import React, { useState } from 'react';

/**
 * Menentukan warna badge tingkat kesulitan.
 * @param {string} difficulty - Tingkat kesulitan: Mudah / Sedang / Sulit
 */
const getDifficultyColor = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case 'mudah': return 'bg-green-100 text-green-700';
    case 'sedang': return 'bg-yellow-100 text-yellow-700';
    case 'sulit': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-600';
  }
};

/**
 * Menentukan warna progress bar berdasarkan skor kecocokan.
 * @param {number} score - Nilai 0.0 hingga 1.0
 */
const getScoreColor = (score) => {
  if (score >= 0.8) return 'bg-green-500';
  if (score >= 0.5) return 'bg-yellow-500';
  return 'bg-orange-400';
};

/**
 * Komponen kartu resep lengkap dengan skor kecocokan.
 * @param {object} recipe - Data resep dari API
 * @param {number} rank - Peringkat resep dalam hasil pencarian
 */
const RecipeCard = ({ recipe, rank }) => {
  // State untuk toggle tampilan langkah memasak
  const [showInstructions, setShowInstructions] = useState(false);

  // Konversi match_score ke persentase (0.0 → 0%, 1.0 → 100%)
  const matchPercent = Math.round(recipe.match_score * 100);

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300
                    overflow-hidden animate-slide-up border border-orange-50">
      {/* Header kartu dengan gambar atau placeholder */}
      <div className="relative">
        {recipe.image_url ? (
          <img
            src={recipe.image_url}
            alt={recipe.name}
            className="w-full h-44 object-cover"
            onError={(e) => { e.target.style.display = 'none'; }} // Sembunyikan jika gagal load
          />
        ) : (
          // Placeholder gradien jika tidak ada gambar
          <div className="w-full h-44 bg-gradient-to-br from-orange-200 to-red-200
                          flex items-center justify-center">
            <span className="text-5xl">🍳</span>
          </div>
        )}

        {/* Badge peringkat di sudut kiri atas */}
        <div className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold
                        px-2.5 py-1 rounded-full shadow">
          #{rank}
        </div>

        {/* Badge tingkat kesulitan di sudut kanan atas */}
        <div className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-1
                         rounded-full shadow ${getDifficultyColor(recipe.difficulty)}`}>
          {recipe.difficulty}
        </div>
      </div>

      {/* Konten kartu */}
      <div className="p-5">
        {/* Nama resep */}
        <h3 className="text-lg font-bold text-gray-800 mb-1">{recipe.name}</h3>

        {/* Deskripsi singkat */}
        {recipe.description && (
          <p className="text-gray-500 text-sm mb-3 line-clamp-2">{recipe.description}</p>
        )}

        {/* Informasi cepat: waktu & porsi */}
        <div className="flex gap-4 text-sm text-gray-500 mb-4">
          {recipe.cooking_time && (
            <span className="flex items-center gap-1">
              ⏱️ {recipe.cooking_time} menit
            </span>
          )}
          {recipe.servings && (
            <span className="flex items-center gap-1">
              🍽️ {recipe.servings} porsi
            </span>
          )}
        </div>

        {/* ── SKOR KECOCOKAN BAHAN ── */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-sm font-semibold text-gray-700">Kecocokan Bahan</span>
            <span className="text-sm font-bold text-orange-600">
              {recipe.match_count}/{recipe.total_ingredients} bahan ({matchPercent}%)
            </span>
          </div>
          {/* Progress bar kecocokan */}
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all duration-500 ${getScoreColor(recipe.match_score)}`}
              style={{ width: `${matchPercent}%` }}
            />
          </div>
        </div>

        {/* ── DAFTAR BAHAN ── */}
        <div className="mb-4">
          {/* Bahan yang cocok (hijau) */}
          {recipe.matched_ingredients.length > 0 && (
            <div className="mb-2">
              <p className="text-xs font-semibold text-green-700 mb-1.5">✅ Bahan yang kamu punya:</p>
              <div className="flex flex-wrap gap-1.5">
                {recipe.matched_ingredients.map((ing, i) => (
                  <span key={i} className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-lg">
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}
          {/* Bahan yang kurang (merah) */}
          {recipe.missing_ingredients.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-red-600 mb-1.5">❌ Bahan yang belum ada:</p>
              <div className="flex flex-wrap gap-1.5">
                {recipe.missing_ingredients.map((ing, i) => (
                  <span key={i} className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-lg">
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── TOMBOL LIHAT CARA MEMASAK ── */}
        <button
          onClick={() => setShowInstructions(!showInstructions)}
          className="w-full text-sm text-orange-600 hover:text-orange-700 font-medium
                     py-2 border border-orange-200 hover:border-orange-400
                     rounded-xl transition-colors duration-200"
        >
          {showInstructions ? '▲ Sembunyikan' : '▼ Lihat Cara Memasak'}
        </button>

        {/* Langkah-langkah memasak (toggle) */}
        {showInstructions && recipe.instructions && (
          <div className="mt-3 p-4 bg-orange-50 rounded-xl text-sm text-gray-700 leading-relaxed">
            <p className="font-semibold text-orange-700 mb-2">📋 Cara Memasak:</p>
            <pre className="whitespace-pre-wrap font-sans">{recipe.instructions}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeCard;

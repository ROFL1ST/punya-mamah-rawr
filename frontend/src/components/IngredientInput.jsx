// =============================================================
// components/IngredientInput.jsx
// Komponen input bahan secara dinamis - user bisa menambah/hapus bahan
// =============================================================

import React, { useState } from 'react';

/**
 * Komponen untuk memasukkan daftar bahan secara dinamis.
 * @param {string[]} ingredients - Daftar bahan yang sudah ditambahkan
 * @param {function} onAdd - Callback saat bahan ditambahkan
 * @param {function} onRemove - Callback saat bahan dihapus
 * @param {function} onSearch - Callback saat tombol Cari diklik
 * @param {boolean} loading - Status loading saat API dipanggil
 */
const IngredientInput = ({ ingredients, onAdd, onRemove, onSearch, loading }) => {
  // State untuk menyimpan nilai input sementara
  const [inputValue, setInputValue] = useState('');

  /**
   * Menambahkan bahan ke daftar saat tombol + diklik atau Enter ditekan.
   */
  const handleAdd = () => {
    const trimmed = inputValue.trim().toLowerCase();
    // Validasi: tidak kosong dan belum ada di daftar
    if (trimmed && !ingredients.includes(trimmed)) {
      onAdd(trimmed);
      setInputValue(''); // Reset input setelah menambah
    }
  };

  // Menambahkan bahan saat user menekan Enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleAdd();
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
      {/* Judul Section */}
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        🧅 Bahan yang Kamu Punya
      </h2>

      {/* Area input bahan */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ketik nama bahan, contoh: telur"
          className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm
                     focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent
                     transition-all duration-200"
        />
        {/* Tombol tambah bahan */}
        <button
          onClick={handleAdd}
          disabled={!inputValue.trim()}
          className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300
                     text-white px-4 py-2.5 rounded-xl font-medium text-sm
                     transition-colors duration-200 flex items-center gap-1"
        >
          <span className="text-lg leading-none">+</span> Tambah
        </button>
      </div>

      {/* Daftar bahan yang sudah ditambahkan (tampilan tag/chip) */}
      {ingredients.length > 0 ? (
        <div className="flex flex-wrap gap-2 mb-5">
          {ingredients.map((ing, index) => (
            <span
              key={index}
              className="bg-orange-100 text-orange-800 px-3 py-1.5 rounded-full text-sm
                         font-medium flex items-center gap-1.5 animate-fade-in"
            >
              {ing}
              {/* Tombol hapus bahan (×) */}
              <button
                onClick={() => onRemove(ing)}
                className="text-orange-600 hover:text-red-600 font-bold text-base
                           leading-none transition-colors duration-150"
                title={`Hapus ${ing}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      ) : (
        /* Pesan panduan saat belum ada bahan */
        <p className="text-gray-400 text-sm italic mb-5">
          Belum ada bahan. Tambahkan bahan yang tersedia di kulkasmu! 🥚
        </p>
      )}

      {/* Tombol utama Cari Resep */}
      <button
        onClick={onSearch}
        disabled={ingredients.length === 0 || loading}
        className="w-full bg-gradient-to-r from-orange-500 to-red-500
                   hover:from-orange-600 hover:to-red-600
                   disabled:from-gray-300 disabled:to-gray-300
                   text-white py-3 rounded-xl font-semibold text-base
                   transition-all duration-200 shadow-md hover:shadow-lg
                   flex items-center justify-center gap-2"
      >
        {loading ? (
          // Tampilkan spinner saat loading
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Mencari Resep...
          </>
        ) : (
          <>🔍 Cari Resep</>  
        )}
      </button>
    </div>
  );
};

export default IngredientInput;

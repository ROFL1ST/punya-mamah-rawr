// =============================================================
// pages/AdminPage.jsx
// Halaman admin untuk menambahkan bahan dan resep baru
// =============================================================

import React, { useState, useEffect } from 'react';
import { getAllIngredients, addIngredient, addRecipe } from '../api/sisadapurApi';

// ── Komponen Form Tambah Bahan ──
const TambahBahanForm = ({ onSuccess }) => {
  const [form, setForm] = useState({ name: '', unit: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null); // { type: 'success'|'error', text: '' }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      await addIngredient(form);
      setMsg({ type: 'success', text: `Bahan "${form.name}" berhasil ditambahkan!` });
      setForm({ name: '', unit: '' }); // Reset form
      onSuccess(); // Refresh daftar bahan di parent
    } catch (err) {
      setMsg({
        type: 'error',
        text: err.response?.data?.detail || 'Gagal menambahkan bahan.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Bahan *</label>
        <input
          type="text"
          required
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          placeholder="contoh: bawang merah"
          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm
                     focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Satuan</label>
        <input
          type="text"
          value={form.unit}
          onChange={e => setForm({ ...form, unit: e.target.value })}
          placeholder="contoh: siung, gram, butir, sdm"
          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm
                     focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
      </div>

      {/* Pesan sukses / error */}
      {msg && (
        <div className={`text-sm px-4 py-2.5 rounded-xl font-medium ${
          msg.type === 'success'
            ? 'bg-green-100 text-green-700'
            : 'bg-red-100 text-red-700'
        }`}>
          {msg.type === 'success' ? '✅' : '❌'} {msg.text}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300
                   text-white py-2.5 rounded-xl font-semibold text-sm transition-colors"
      >
        {loading ? 'Menyimpan...' : '+ Tambah Bahan'}
      </button>
    </form>
  );
};


// ── Komponen Form Tambah Resep ──
const TambahResepForm = ({ allIngredients, onSuccess }) => {
  // State untuk field-field resep
  const [form, setForm] = useState({
    name: '',
    description: '',
    instructions: '',
    cooking_time: '',
    servings: 1,
    difficulty: 'Sedang',
    image_url: '',
  });

  // State untuk daftar bahan yang dipilih beserta jumlahnya
  const [selectedIngredients, setSelectedIngredients] = useState([
    { ingredient_id: '', quantity: '', unit: '' }
  ]);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  // Menambah baris input bahan baru
  const addIngredientRow = () => {
    setSelectedIngredients(prev => [
      ...prev,
      { ingredient_id: '', quantity: '', unit: '' }
    ]);
  };

  // Menghapus baris input bahan
  const removeIngredientRow = (index) => {
    setSelectedIngredients(prev => prev.filter((_, i) => i !== index));
  };

  // Update nilai pada baris bahan tertentu
  const updateIngredientRow = (index, field, value) => {
    setSelectedIngredients(prev =>
      prev.map((item, i) => i === index ? { ...item, [field]: value } : item)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    // Validasi: semua baris harus ada ingredient_id-nya
    const validIngredients = selectedIngredients.filter(i => i.ingredient_id !== '');
    if (validIngredients.length === 0) {
      setMsg({ type: 'error', text: 'Tambahkan minimal 1 bahan untuk resep ini.' });
      setLoading(false);
      return;
    }

    try {
      // Susun payload sesuai skema RecipeCreate
      const payload = {
        ...form,
        cooking_time: form.cooking_time ? parseInt(form.cooking_time) : null,
        servings: parseInt(form.servings),
        ingredients: validIngredients.map(i => ({
          ingredient_id: parseInt(i.ingredient_id),
          quantity: i.quantity ? parseFloat(i.quantity) : null,
          unit: i.unit || null,
        }))
      };

      await addRecipe(payload);
      setMsg({ type: 'success', text: `Resep "${form.name}" berhasil ditambahkan!` });
      // Reset semua form
      setForm({ name: '', description: '', instructions: '', cooking_time: '', servings: 1, difficulty: 'Sedang', image_url: '' });
      setSelectedIngredients([{ ingredient_id: '', quantity: '', unit: '' }]);
      onSuccess();
    } catch (err) {
      setMsg({
        type: 'error',
        text: err.response?.data?.detail || 'Gagal menambahkan resep.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Nama Resep */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Resep *</label>
        <input
          type="text" required
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          placeholder="contoh: Nasi Goreng Spesial"
          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
      </div>

      {/* Deskripsi */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
        <input
          type="text"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          placeholder="Deskripsi singkat resep"
          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
      </div>

      {/* Langkah Memasak */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Langkah Memasak *</label>
        <textarea
          required
          rows={5}
          value={form.instructions}
          onChange={e => setForm({ ...form, instructions: e.target.value })}
          placeholder="1. Panaskan minyak...&#10;2. Tumis bawang...&#10;3. Masukkan telur..."
          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
        />
      </div>

      {/* Waktu, Porsi, Kesulitan */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Waktu (menit)</label>
          <input
            type="number" min="1"
            value={form.cooking_time}
            onChange={e => setForm({ ...form, cooking_time: e.target.value })}
            placeholder="15"
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Porsi</label>
          <input
            type="number" min="1"
            value={form.servings}
            onChange={e => setForm({ ...form, servings: e.target.value })}
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kesulitan</label>
          <select
            value={form.difficulty}
            onChange={e => setForm({ ...form, difficulty: e.target.value })}
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <option>Mudah</option>
            <option>Sedang</option>
            <option>Sulit</option>
          </select>
        </div>
      </div>

      {/* URL Gambar */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">URL Gambar (opsional)</label>
        <input
          type="url"
          value={form.image_url}
          onChange={e => setForm({ ...form, image_url: e.target.value })}
          placeholder="https://contoh.com/gambar.jpg"
          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
      </div>

      {/* Pilih Bahan */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">Bahan-bahan *</label>
          <button
            type="button"
            onClick={addIngredientRow}
            className="text-xs bg-orange-100 text-orange-700 hover:bg-orange-200 px-3 py-1 rounded-lg font-medium transition-colors"
          >
            + Tambah Baris
          </button>
        </div>

        <div className="space-y-2">
          {selectedIngredients.map((row, index) => (
            <div key={index} className="flex gap-2 items-center">
              {/* Dropdown pilih bahan dari database */}
              <select
                value={row.ingredient_id}
                onChange={e => updateIngredientRow(index, 'ingredient_id', e.target.value)}
                className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="">-- Pilih Bahan --</option>
                {allIngredients.map(ing => (
                  <option key={ing.id} value={ing.id}>
                    {ing.name} {ing.unit ? `(${ing.unit})` : ''}
                  </option>
                ))}
              </select>
              {/* Jumlah */}
              <input
                type="number" min="0" step="0.1"
                value={row.quantity}
                onChange={e => updateIngredientRow(index, 'quantity', e.target.value)}
                placeholder="Jml"
                className="w-20 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              {/* Satuan */}
              <input
                type="text"
                value={row.unit}
                onChange={e => updateIngredientRow(index, 'unit', e.target.value)}
                placeholder="Satuan"
                className="w-24 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              {/* Tombol hapus baris (tidak tampil jika hanya 1 baris) */}
              {selectedIngredients.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeIngredientRow(index)}
                  className="text-red-400 hover:text-red-600 font-bold text-xl leading-none px-1"
                  title="Hapus bahan ini"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Pesan sukses / error */}
      {msg && (
        <div className={`text-sm px-4 py-2.5 rounded-xl font-medium ${
          msg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {msg.type === 'success' ? '✅' : '❌'} {msg.text}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-orange-500 to-red-500
                   hover:from-orange-600 hover:to-red-600 disabled:from-gray-300 disabled:to-gray-300
                   text-white py-3 rounded-xl font-semibold text-sm transition-all shadow-md"
      >
        {loading ? 'Menyimpan Resep...' : '🍳 Simpan Resep'}
      </button>
    </form>
  );
};


// ── Halaman Utama Admin ──
const AdminPage = () => {
  // Tab aktif: 'bahan' atau 'resep'
  const [activeTab, setActiveTab] = useState('bahan');
  // Daftar bahan dari database (dibutuhkan oleh form tambah resep)
  const [allIngredients, setAllIngredients] = useState([]);

  // Mengambil semua bahan dari API saat halaman pertama kali dimuat
  const fetchIngredients = async () => {
    try {
      const data = await getAllIngredients();
      setAllIngredients(data);
    } catch (err) {
      console.error('Gagal memuat bahan:', err);
    }
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  return (
    <div>
      {/* Judul Halaman */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">⚙️ Panel Admin</h2>
        <p className="text-gray-500 text-sm mt-1">Kelola bahan dan resep masakan SisaDapur</p>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-2xl">
        <button
          onClick={() => setActiveTab('bahan')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'bahan'
              ? 'bg-white text-orange-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          🧅 Tambah Bahan
        </button>
        <button
          onClick={() => setActiveTab('resep')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'resep'
              ? 'bg-white text-orange-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          🍳 Tambah Resep
        </button>
      </div>

      {/* Konten Tab */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        {activeTab === 'bahan' ? (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Tambah Bahan Baru</h3>
            <TambahBahanForm onSuccess={fetchIngredients} />

            {/* Preview daftar bahan yang sudah ada */}
            {allIngredients.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-semibold text-gray-600 mb-3">
                  Bahan tersedia ({allIngredients.length} item):
                </p>
                <div className="flex flex-wrap gap-2">
                  {allIngredients.map(ing => (
                    <span key={ing.id} className="bg-orange-50 border border-orange-200
                                                   text-orange-700 text-xs px-2.5 py-1 rounded-lg">
                      {ing.name} {ing.unit ? `· ${ing.unit}` : ''}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Tambah Resep Baru</h3>
            {allIngredients.length === 0 ? (
              // Peringatan jika belum ada bahan di database
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800
                              rounded-xl p-4 text-sm mb-4">
                ⚠️ Belum ada bahan di database. Tambahkan bahan terlebih dahulu
                di tab <strong>Tambah Bahan</strong> sebelum membuat resep.
              </div>
            ) : null}
            <TambahResepForm
              allIngredients={allIngredients}
              onSuccess={() => {}}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;

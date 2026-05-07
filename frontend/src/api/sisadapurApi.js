// =============================================================
// api/sisadapurApi.js - Konfigurasi dan fungsi pemanggilan API
// Semua komunikasi dengan backend FastAPI dilakukan di sini
// =============================================================

import axios from 'axios';

// URL base API backend (FastAPI)
const BASE_URL = 'http://localhost:8000';

// Membuat instance axios dengan konfigurasi default
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Timeout 10 detik
});

/**
 * Mencari resep berdasarkan daftar bahan yang dimiliki user.
 * @param {string[]} ingredients - Daftar nama bahan
 * @param {number} limit - Jumlah maksimal resep yang dikembalikan
 */
export const searchRecipes = async (ingredients, limit = 10) => {
  const response = await apiClient.post('/recipes/search-recipes', {
    ingredients,
    limit,
  });
  return response.data;
};

/**
 * Mengambil semua resep dari database.
 */
export const getAllRecipes = async () => {
  const response = await apiClient.get('/recipes/');
  return response.data;
};

/**
 * Mengambil semua bahan yang tersedia di database.
 */
export const getAllIngredients = async () => {
  const response = await apiClient.get('/ingredients/');
  return response.data;
};

/**
 * Menambahkan bahan baru ke database.
 * @param {{ name: string, unit?: string }} data - Data bahan
 */
export const addIngredient = async (data) => {
  const response = await apiClient.post('/ingredients/', data);
  return response.data;
};

/**
 * Menambahkan resep baru ke database.
 * @param {object} data - Data resep lengkap dengan daftar bahan
 */
export const addRecipe = async (data) => {
  const response = await apiClient.post('/recipes/', data);
  return response.data;
};

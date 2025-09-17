import instance from './axios';

export async function listProducts(params = {}) {
  const res = await instance.get('/api/products', { params });
  return res.data; // expected paginated
}

export async function getProduct(idOrSlug) {
  const res = await instance.get(`/api/products/${idOrSlug}`);
  return res.data; // product object or { item }
}

export async function createProduct(data) {
  const res = await instance.post('/api/products', data);
  return res.data;
}

export async function updateProduct(id, data) {
  const res = await instance.put(`/api/products/${id}`, data);
  return res.data;
}

export async function deleteProduct(id) {
  const res = await instance.delete(`/api/products/${id}`);
  return res.data;
}

export default {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};

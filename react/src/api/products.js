import instance from './axios';

export async function listProducts(params) {
  const res = await instance.get('/api/products', { params });
  return res.data;
}

export async function getProduct(idOrSlug) {
  const res = await instance.get(`/api/products/${idOrSlug}`);
  return res.data;
}

export async function listProductReviews(productId) {
  const res = await instance.get(`/api/products/${productId}/reviews`);
  return res.data;
}

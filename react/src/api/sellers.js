import instance from './axios';

export async function getSeller(id) {
  const res = await instance.get(`/api/sellers/${id}`);
  return res.data;
}

export async function listSellerProducts(id, params = {}) {
  const res = await instance.get(`/api/sellers/${id}/products`, { params });
  return res.data;
}

export async function registerSeller(data) {
  const res = await instance.post('/api/sellers/register', data);
  return res.data;
}

export default {
  getSeller,
  listSellerProducts,
  registerSeller,
};

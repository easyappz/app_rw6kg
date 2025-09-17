import instance from './axios';

export async function listCategories(params) {
  const res = await instance.get('/api/categories', { params });
  return res.data;
}

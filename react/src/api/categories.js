import instance from './axios';

export async function listCategories(params = {}) {
  const res = await instance.get('/api/categories', { params });
  return res.data; // { items, page, limit, total, totalPages }
}

export default { listCategories };

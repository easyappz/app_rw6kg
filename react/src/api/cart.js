import instance from './axios';

export async function getCart() {
  const res = await instance.get('/api/cart');
  return res.data;
}

export async function addOrUpdateItem({ productId, qty }) {
  const res = await instance.post('/api/cart/items', { productId, qty });
  return res.data;
}

export async function updateItem(productId, qty) {
  const res = await instance.patch(`/api/cart/items/${productId}`, { qty });
  return res.data;
}

export async function removeItem(productId) {
  const res = await instance.delete(`/api/cart/items/${productId}`);
  return res.data;
}

export async function clearCart() {
  const res = await instance.delete('/api/cart');
  return res.data;
}

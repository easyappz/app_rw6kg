import instance from './axios';

export async function createOrder(data) {
  const res = await instance.post('/api/orders', data);
  return res.data; // { order }
}

export async function getMyOrders(params = {}) {
  const res = await instance.get('/api/orders/my', { params });
  return res.data; // paginated { items: Order[] }
}

export async function getOrder(id) {
  const res = await instance.get(`/api/orders/${id}`);
  return res.data; // { order }
}

export async function updateOrderStatus(id, status) {
  const res = await instance.patch(`/api/orders/${id}/status`, { status });
  return res.data;
}

export default {
  createOrder,
  getMyOrders,
  getOrder,
  updateOrderStatus,
};

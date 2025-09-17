import instance from './axios';

export async function createOrder({ shippingAddress, paymentMethod }) {
  const res = await instance.post('/api/orders', { shippingAddress, paymentMethod });
  return res.data;
}

export async function listMyOrders(params) {
  const res = await instance.get('/api/orders/my', { params });
  return res.data;
}

export async function getOrderById(id) {
  const res = await instance.get(`/api/orders/${id}`);
  return res.data;
}

export async function updateOrderStatus(id, status) {
  const res = await instance.patch(`/api/orders/${id}/status`, { status });
  return res.data;
}

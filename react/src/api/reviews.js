import instance from './axios';

export async function listProductReviews(productId) {
  const res = await instance.get(`/api/products/${productId}/reviews`);
  return res.data; // list of reviews or paginated depending on server
}

export async function addReview(productId, data) {
  const res = await instance.post(`/api/products/${productId}/reviews`, data);
  return res.data;
}

export async function deleteReview(reviewId) {
  const res = await instance.delete(`/api/reviews/${reviewId}`);
  return res.data;
}

export default {
  listProductReviews,
  addReview,
  deleteReview,
};

const express = require('express');
const { requireAuth } = require('@src/middleware/auth');
const controller = require('@src/controllers/reviewController');

const router = express.Router();

// GET /api/products/:id/reviews
router.get('/products/:id/reviews', controller.listProductReviews);

// POST /api/products/:id/reviews
router.post('/products/:id/reviews', requireAuth, controller.addProductReview);

// DELETE /api/reviews/:id
router.delete('/reviews/:id', requireAuth, controller.deleteReview);

module.exports = router;

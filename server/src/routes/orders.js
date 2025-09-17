const express = require('express');
const { requireAuth } = require('@src/middleware/auth');
const controller = require('@src/controllers/orderController');

const router = express.Router();

// All order routes require auth
router.use(requireAuth);

// POST /api/orders — create order from cart
router.post('/', controller.createOrder);

// GET /api/orders/my — my orders paginated
router.get('/my', controller.listMyOrders);

// GET /api/orders/:id — get order (owner or admin)
router.get('/:id', controller.getOrderById);

// PATCH /api/orders/:id/status — update status
router.patch('/:id/status', controller.updateOrderStatus);

module.exports = router;

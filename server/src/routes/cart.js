const express = require('express');
const { requireAuth } = require('@src/middleware/auth');
const controller = require('@src/controllers/cartController');

const router = express.Router();

// All cart routes require auth
router.use(requireAuth);

// GET /api/cart — get current user's cart
router.get('/', controller.getCart);

// POST /api/cart/items — add/update item { productId, qty }
router.post('/items', controller.addOrUpdateItem);

// PATCH /api/cart/items/:productId — change qty
router.patch('/items/:productId', controller.patchItemQty);

// DELETE /api/cart/items/:productId — remove item
router.delete('/items/:productId', controller.deleteItem);

// DELETE /api/cart — clear cart
router.delete('/', controller.clearCart);

module.exports = router;

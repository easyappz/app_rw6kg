const mongoose = require('mongoose');
const Cart = require('@src/models/Cart');
const Order = require('@src/models/Order');
const Product = require('@src/models/Product');

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function validateShippingAddress(addr) {
  const required = ['label', 'country', 'city', 'street', 'zip'];
  if (!addr || typeof addr !== 'object') return 'shippingAddress is required';
  for (const key of required) {
    const val = addr[key];
    if (typeof val !== 'string' || val.trim().length === 0) {
      return `shippingAddress.${key} is required`;
    }
  }
  return null;
}

const PAYMENT_METHODS = ['cod', 'card-mock'];
const ORDER_STATUSES = ['created', 'paid', 'shipped', 'delivered', 'cancelled'];

exports.createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { shippingAddress, paymentMethod } = req.body || {};

    const addrError = validateShippingAddress(shippingAddress);
    if (addrError) {
      return res.status(400).json({ error: true, message: addrError });
    }
    if (!PAYMENT_METHODS.includes(paymentMethod)) {
      return res.status(400).json({ error: true, message: `paymentMethod must be one of: ${PAYMENT_METHODS.join(', ')}` });
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: true, message: 'Cart is empty' });
    }

    // Calculate amount from snapshots to keep price consistency
    const amount = cart.items.reduce((sum, it) => sum + it.priceSnapshot * it.qty, 0);

    await session.withTransaction(async () => {
      // Reserve stock atomically per item
      for (const it of cart.items) {
        const upd = await Product.updateOne(
          { _id: it.product, stock: { $gte: it.qty } },
          { $inc: { stock: -it.qty } },
          { session }
        );
        if (upd.modifiedCount === 0) {
          // Fetch product title for precise error
          const p = await Product.findById(it.product).session(session);
          const title = p?.title || it.titleSnapshot || 'product';
          throw new Error(`Not enough stock for ${title}`);
        }
      }

      const orderDoc = await Order.create([
        {
          user: req.user.id,
          items: cart.items.map((i) => ({
            product: i.product,
            qty: i.qty,
            priceSnapshot: i.priceSnapshot,
            titleSnapshot: i.titleSnapshot,
            imageSnapshot: i.imageSnapshot,
          })),
          amount,
          shippingAddress,
          paymentMethod,
          status: paymentMethod === 'card-mock' ? 'paid' : 'created',
        },
      ], { session });

      // Clear cart
      cart.items = [];
      await cart.save({ session });

      const created = orderDoc[0];
      return res.status(201).json({ order: created });
    });
  } catch (err) {
    // If inside transaction throws, we return the specific error message
    return res.status(400).json({ error: true, message: err.message, details: err.stack });
  } finally {
    session.endSession();
  }
};

exports.listMyOrders = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Order.find({ user: req.user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments({ user: req.user.id }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return res.json({ items, page, limit, total, totalPages });
  } catch (err) {
    return res.status(500).json({ error: true, message: err.message, details: err.stack });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: true, message: 'Invalid order id' });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ error: true, message: 'Order not found' });
    }

    const isOwner = String(order.user) === String(req.user.id);
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: true, message: 'Forbidden: not allowed to view this order' });
    }

    return res.json({ order });
  } catch (err) {
    return res.status(500).json({ error: true, message: err.message, details: err.stack });
  }
};

function canUpdateStatus(user, order, nextStatus) {
  const role = user.role || 'buyer';
  const isOwner = String(order.user) === String(user.id);
  const current = order.status;

  if (!ORDER_STATUSES.includes(nextStatus)) return false;

  if (nextStatus === 'paid') {
    if (current !== 'created') return false;
    if (role === 'admin' || role === 'seller') return true;
    if (role === 'buyer' && isOwner && order.paymentMethod === 'card-mock') return true;
    return false;
  }

  if (nextStatus === 'shipped') {
    return (current === 'paid') && (role === 'admin' || role === 'seller');
  }

  if (nextStatus === 'delivered') {
    return (current === 'shipped') && (role === 'admin' || role === 'seller');
  }

  if (nextStatus === 'cancelled') {
    if (current === 'delivered' || current === 'cancelled') return false;
    if (role === 'admin' || role === 'seller') return true;
    if (role === 'buyer' && isOwner && current === 'created') return true;
    return false;
  }

  return false;
}

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: true, message: 'Invalid order id' });
    }
    if (!status || typeof status !== 'string') {
      return res.status(400).json({ error: true, message: 'status is required' });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ error: true, message: 'Order not found' });
    }

    if (!canUpdateStatus(req.user, order, status)) {
      return res.status(403).json({ error: true, message: 'Forbidden: invalid status transition or insufficient permissions' });
    }

    order.status = status;
    await order.save();

    return res.json({ order });
  } catch (err) {
    return res.status(500).json({ error: true, message: err.message, details: err.stack });
  }
};

const mongoose = require('mongoose');
const Cart = require('@src/models/Cart');
const Product = require('@src/models/Product');

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
}

function pickProductSnapshot(product) {
  const price = typeof product.discountPrice === 'number' && product.discountPrice >= 0
    ? product.discountPrice
    : product.price;
  const title = product.title || '';
  const image = Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : '';
  return { price, title, image };
}

function validateQty(qty) {
  if (typeof qty !== 'number' || Number.isNaN(qty)) return { ok: false, message: 'qty must be a number' };
  if (!Number.isInteger(qty)) return { ok: false, message: 'qty must be an integer' };
  if (qty < 0) return { ok: false, message: 'qty must be >= 0' };
  if (qty > 999) return { ok: false, message: 'qty must be <= 999' };
  return { ok: true };
}

exports.getCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    return res.json({ cart });
  } catch (err) {
    return res.status(500).json({ error: true, message: err.message, details: err.stack });
  }
};

exports.addOrUpdateItem = async (req, res) => {
  try {
    const { productId, qty } = req.body || {};
    if (!isValidObjectId(productId)) {
      return res.status(400).json({ error: true, message: 'Invalid productId' });
    }
    const qtyCheck = validateQty(qty);
    if (!qtyCheck.ok) {
      return res.status(400).json({ error: true, message: qtyCheck.message });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: true, message: 'Product not found' });
    }

    const cart = await getOrCreateCart(req.user.id);

    if (qty === 0) {
      const newItems = cart.items.filter((it) => String(it.product) !== String(productId));
      cart.items = newItems;
      await cart.save();
      return res.json({ cart });
    }

    // Ensure not exceeding stock if product has limited stock
    const maxQty = Math.max(0, product.stock || 0);
    if (maxQty <= 0) {
      return res.status(400).json({ error: true, message: 'Product is out of stock' });
    }
    const finalQty = Math.min(qty, maxQty);
    if (finalQty !== qty) {
      // Inform client that qty was adjusted to stock
    }

    const snap = pickProductSnapshot(product);

    const idx = cart.items.findIndex((it) => String(it.product) === String(productId));
    if (idx >= 0) {
      cart.items[idx].qty = finalQty;
      cart.items[idx].priceSnapshot = snap.price;
      cart.items[idx].titleSnapshot = snap.title;
      cart.items[idx].imageSnapshot = snap.image;
    } else {
      cart.items.push({
        product: product._id,
        qty: finalQty,
        priceSnapshot: snap.price,
        titleSnapshot: snap.title,
        imageSnapshot: snap.image,
      });
    }

    await cart.save();
    return res.status(200).json({ cart });
  } catch (err) {
    return res.status(500).json({ error: true, message: err.message, details: err.stack });
  }
};

exports.patchItemQty = async (req, res) => {
  try {
    const { productId } = req.params;
    const { qty } = req.body || {};

    if (!isValidObjectId(productId)) {
      return res.status(400).json({ error: true, message: 'Invalid productId' });
    }
    const qtyCheck = validateQty(qty);
    if (!qtyCheck.ok) {
      return res.status(400).json({ error: true, message: qtyCheck.message });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: true, message: 'Product not found' });
    }

    const cart = await getOrCreateCart(req.user.id);
    const idx = cart.items.findIndex((it) => String(it.product) === String(productId));
    if (idx < 0) {
      return res.status(404).json({ error: true, message: 'Item not found in cart' });
    }

    if (qty === 0) {
      cart.items.splice(idx, 1);
      await cart.save();
      return res.json({ cart });
    }

    const maxQty = Math.max(0, product.stock || 0);
    if (maxQty <= 0) {
      return res.status(400).json({ error: true, message: 'Product is out of stock' });
    }
    const finalQty = Math.min(qty, maxQty);

    const snap = pickProductSnapshot(product);
    cart.items[idx].qty = finalQty;
    cart.items[idx].priceSnapshot = snap.price;
    cart.items[idx].titleSnapshot = snap.title;
    cart.items[idx].imageSnapshot = snap.image;

    await cart.save();
    return res.json({ cart });
  } catch (err) {
    return res.status(500).json({ error: true, message: err.message, details: err.stack });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!isValidObjectId(productId)) {
      return res.status(400).json({ error: true, message: 'Invalid productId' });
    }
    const cart = await getOrCreateCart(req.user.id);
    const before = cart.items.length;
    cart.items = cart.items.filter((it) => String(it.product) !== String(productId));
    if (cart.items.length === before) {
      return res.status(404).json({ error: true, message: 'Item not found in cart' });
    }
    await cart.save();
    return res.json({ cart });
  } catch (err) {
    return res.status(500).json({ error: true, message: err.message, details: err.stack });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    cart.items = [];
    await cart.save();
    return res.json({ cart });
  } catch (err) {
    return res.status(500).json({ error: true, message: err.message, details: err.stack });
  }
};

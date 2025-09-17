const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    qty: { type: Number, required: true, min: 1 },
    priceSnapshot: { type: Number, required: true, min: 0 },
    titleSnapshot: { type: String, required: true },
    imageSnapshot: { type: String, default: '' },
  },
  { _id: false }
);

const CartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
    items: { type: [CartItemSchema], default: [] },
  },
  { timestamps: true }
);

CartSchema.index({ user: 1 }, { unique: true });

module.exports = mongoose.model('Cart', CartSchema);

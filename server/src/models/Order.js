const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    qty: { type: Number, required: true, min: 1 },
    priceSnapshot: { type: Number, required: true, min: 0 },
    titleSnapshot: { type: String, required: true },
    imageSnapshot: { type: String, default: '' },
  },
  { _id: false }
);

const ShippingAddressSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    street: { type: String, required: true, trim: true },
    zip: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: { type: [OrderItemSchema], required: true },
    amount: { type: Number, required: true, min: 0 },
    shippingAddress: { type: ShippingAddressSchema, required: true },
    paymentMethod: { type: String, enum: ['cod', 'card-mock'], required: true },
    status: { type: String, enum: ['created', 'paid', 'shipped', 'delivered', 'cancelled'], default: 'created' },
  },
  { timestamps: true }
);

OrderSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Order', OrderSchema);

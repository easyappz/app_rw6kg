const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, sparse: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    images: [{ type: String }],
    stock: { type: Number, default: 0, min: 0 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller' },
    ratingAvg: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },
    attributes: { type: Object, default: {} },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Text index for full-text search by title and description
ProductSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Product', ProductSchema);

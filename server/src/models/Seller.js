const mongoose = require('mongoose');

const SellerSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
    shopName: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    rating: { type: Number, default: 0 },
    followers: { type: Number, default: 0 },
    avatarUrl: { type: String },
    bannerUrl: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Seller', SellerSchema);

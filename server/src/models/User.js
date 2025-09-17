const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true },
    country: { type: String, trim: true },
    city: { type: String, trim: true },
    street: { type: String, trim: true },
    zip: { type: String, trim: true },
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['buyer', 'seller', 'admin'], default: 'buyer' },
    avatarUrl: { type: String, trim: true },
    phone: { type: String, trim: true },
    addresses: { type: [AddressSchema], default: [] },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('User', UserSchema);

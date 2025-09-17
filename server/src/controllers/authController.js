const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('@src/models/User');

const JWT_SECRET = 'EASYAPPZ_MARKETPLACE_SECRET';

function buildUserResponse(user) {
  if (!user) return null;
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl || null,
    phone: user.phone || null,
    addresses: Array.isArray(user.addresses) ? user.addresses : [],
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function signToken(user) {
  return jwt.sign({ _id: user._id.toString(), role: user.role }, JWT_SECRET, { expiresIn: '7d' });
}

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ error: true, message: 'Name, email, and password are required' });
    }

    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: true, message: 'Password must be at least 6 characters long' });
    }

    const existing = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ error: true, message: 'Email already in use' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: String(name).trim(),
      email: String(email).toLowerCase().trim(),
      passwordHash,
      role: 'buyer',
    });

    const token = signToken(user);
    return res.status(201).json({ success: true, token, user: buildUserResponse(user) });
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({ error: true, message: 'Email already exists', details: err.message });
    }
    return res.status(500).json({ error: true, message: err.message, details: err.stack });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: true, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ error: true, message: 'Invalid email or password' });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ error: true, message: 'Invalid email or password' });
    }

    const token = signToken(user);
    return res.json({ success: true, token, user: buildUserResponse(user) });
  } catch (err) {
    return res.status(500).json({ error: true, message: err.message, details: err.stack });
  }
};

exports.me = async (req, res) => {
  try {
    const userId = req.user && req.user._id;
    if (!userId) {
      return res.status(401).json({ error: true, message: 'Unauthorized: missing user context' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: true, message: 'User not found' });
    }

    return res.json({ success: true, user: buildUserResponse(user) });
  } catch (err) {
    return res.status(500).json({ error: true, message: err.message, details: err.stack });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user && req.user._id;
    if (!userId) {
      return res.status(401).json({ error: true, message: 'Unauthorized: missing user context' });
    }

    const { name, phone, avatarUrl, addresses } = req.body || {};

    const update = {};
    if (typeof name === 'string') update.name = name.trim();
    if (typeof phone === 'string') update.phone = phone.trim();
    if (typeof avatarUrl === 'string') update.avatarUrl = avatarUrl.trim();
    if (Array.isArray(addresses)) update.addresses = addresses;

    const updated = await User.findByIdAndUpdate(
      userId,
      { $set: update },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: true, message: 'User not found' });
    }

    return res.json({ success: true, user: buildUserResponse(updated) });
  } catch (err) {
    return res.status(500).json({ error: true, message: err.message, details: err.stack });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const userId = req.user && req.user._id;
    if (!userId) {
      return res.status(401).json({ error: true, message: 'Unauthorized: missing user context' });
    }

    const { oldPassword, newPassword } = req.body || {};

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: true, message: 'Both oldPassword and newPassword are required' });
    }

    if (typeof newPassword !== 'string' || newPassword.length < 6) {
      return res.status(400).json({ error: true, message: 'New password must be at least 6 characters long' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: true, message: 'User not found' });
    }

    const match = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!match) {
      return res.status(400).json({ error: true, message: 'Old password is incorrect' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = newHash;
    await user.save();

    return res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    return res.status(500).json({ error: true, message: err.message, details: err.stack });
  }
};

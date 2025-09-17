const mongoose = require('mongoose');
const Seller = require('@src/models/Seller');
const Product = require('@src/models/Product');
const Category = require('@src/models/Category');

function toInt(val, def, min, max) {
  let n = parseInt(val, 10);
  if (Number.isNaN(n)) n = def;
  if (min !== undefined) n = Math.max(min, n);
  if (max !== undefined) n = Math.min(max, n);
  return n;
}

function buildSort(sort) {
  switch (sort) {
    case 'price_asc':
      return { price: 1 };
    case 'price_desc':
      return { price: -1 };
    case 'createdAt_asc':
      return { createdAt: 1 };
    case 'createdAt_desc':
      return { createdAt: -1 };
    case 'rating_desc':
      return { ratingAvg: -1 };
    case 'rating_asc':
      return { ratingAvg: 1 };
    default:
      return { createdAt: -1 };
  }
}

exports.getSeller = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: true, message: 'Invalid seller id' });
    const seller = await Seller.findById(id);
    if (!seller) return res.status(404).json({ error: true, message: 'Seller not found' });
    return res.json({ item: seller });
  } catch (err) {
    return res.status(500).json({ error: true, message: err.message, details: err.stack });
  }
};

exports.registerSeller = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: true, message: 'Unauthorized' });
    const { shopName, description, avatarUrl, bannerUrl } = req.body;
    if (!shopName) return res.status(400).json({ error: true, message: 'shopName is required' });

    const exists = await Seller.findOne({ user: userId });
    if (exists) return res.status(400).json({ error: true, message: 'Seller profile already exists' });

    const seller = await Seller.create({ user: userId, shopName, description, avatarUrl, bannerUrl });
    return res.status(201).json({ item: seller });
  } catch (err) {
    return res.status(400).json({ error: true, message: err.message, details: err.stack });
  }
};

exports.getSellerProducts = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: true, message: 'Invalid seller id' });

    const page = toInt(req.query.page, 1, 1);
    const limit = toInt(req.query.limit, 20, 1, 100);
    const skip = (page - 1) * limit;

    const { q, category, priceMin, priceMax, sort } = req.query;

    const filter = { seller: id, isActive: true };

    if (category) {
      if (mongoose.isValidObjectId(category)) {
        filter.category = category;
      } else {
        const cat = await Category.findOne({ slug: category });
        if (cat) filter.category = cat._id;
      }
    }

    if (priceMin !== undefined || priceMax !== undefined) {
      filter.price = {};
      if (priceMin !== undefined) filter.price.$gte = Number(priceMin);
      if (priceMax !== undefined) filter.price.$lte = Number(priceMax);
    }

    const sortObj = buildSort(sort);

    let query = Product.find(filter).populate('category', 'name slug').populate('seller', 'shopName');

    if (q) {
      query = query.find({ $text: { $search: q } }).select({ score: { $meta: 'textScore' } });
      // If no specific sort passed, order by relevance
      if (!sort) {
        query = query.sort({ score: { $meta: 'textScore' } });
      }
    }

    if (sort) {
      query = query.sort(sortObj);
    }

    const [items, total] = await Promise.all([
      query.skip(skip).limit(limit),
      Product.countDocuments(q ? { ...filter, $text: { $search: q } } : filter),
    ]);

    return res.json({ items, page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    return res.status(500).json({ error: true, message: err.message, details: err.stack });
  }
};

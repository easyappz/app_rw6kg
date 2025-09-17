const mongoose = require('mongoose');
const Product = require('@src/models/Product');
const Category = require('@src/models/Category');
const Seller = require('@src/models/Seller');

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

async function getSellerIdForUser(userId) {
  const seller = await Seller.findOne({ user: userId });
  return seller ? seller._id.toString() : null;
}

exports.listProducts = async (req, res) => {
  try {
    const page = toInt(req.query.page, 1, 1);
    const limit = toInt(req.query.limit, 20, 1, 100);
    const skip = (page - 1) * limit;

    const { category, seller, q, priceMin, priceMax, sort, isActive } = req.query;

    const filter = {};

    // isActive filter, default true for public listings
    if (isActive === undefined) {
      filter.isActive = true;
    } else {
      filter.isActive = String(isActive) === 'true';
    }

    if (category) {
      if (mongoose.isValidObjectId(category)) {
        filter.category = category;
      } else {
        const cat = await Category.findOne({ slug: category });
        if (cat) filter.category = cat._id;
      }
    }

    if (seller && mongoose.isValidObjectId(seller)) {
      filter.seller = seller;
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

exports.getProductByIdOrSlug = async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    let product = null;
    if (mongoose.isValidObjectId(idOrSlug)) {
      product = await Product.findById(idOrSlug).populate('category', 'name slug').populate('seller', 'shopName');
    } else {
      product = await Product.findOne({ slug: idOrSlug }).populate('category', 'name slug').populate('seller', 'shopName');
    }
    if (!product) return res.status(404).json({ error: true, message: 'Product not found' });
    return res.json({ item: product });
  } catch (err) {
    return res.status(500).json({ error: true, message: err.message, details: err.stack });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { title, slug, description, price, discountPrice, images, stock, category, seller: sellerIdFromBody, attributes, isActive } = req.body;
    if (!title) return res.status(400).json({ error: true, message: 'title is required' });
    if (price === undefined || price === null) return res.status(400).json({ error: true, message: 'price is required' });

    let sellerId = null;
    if (req.user?.role === 'admin' && sellerIdFromBody && mongoose.isValidObjectId(sellerIdFromBody)) {
      sellerId = sellerIdFromBody;
    } else {
      sellerId = await getSellerIdForUser(req.user?.id);
    }
    if (!sellerId) return res.status(400).json({ error: true, message: 'Seller profile not found for the current user' });

    const data = {
      title,
      slug,
      description,
      price,
      discountPrice,
      images: Array.isArray(images) ? images : images ? [images] : [],
      stock: stock ?? 0,
      category: category && mongoose.isValidObjectId(category) ? category : undefined,
      seller: sellerId,
      attributes: attributes || {},
      isActive: isActive === undefined ? true : Boolean(isActive),
    };

    const created = await Product.create(data);
    return res.status(201).json({ item: created });
  } catch (err) {
    return res.status(400).json({ error: true, message: err.message, details: err.stack });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ error: true, message: 'Product not found' });

    const isAdmin = req.user?.role === 'admin';
    let isOwner = false;
    if (!isAdmin) {
      const sellerId = await getSellerIdForUser(req.user?.id);
      isOwner = sellerId && product.seller?.toString() === sellerId;
    }

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: true, message: 'Forbidden: not an owner' });
    }

    const { title, slug, description, price, discountPrice, images, stock, category, attributes, isActive } = req.body;

    const update = {};
    if (title !== undefined) update.title = title;
    if (slug !== undefined) update.slug = slug;
    if (description !== undefined) update.description = description;
    if (price !== undefined) update.price = price;
    if (discountPrice !== undefined) update.discountPrice = discountPrice;
    if (images !== undefined) update.images = Array.isArray(images) ? images : images ? [images] : [];
    if (stock !== undefined) update.stock = stock;
    if (category !== undefined) update.category = mongoose.isValidObjectId(category) ? category : undefined;
    if (attributes !== undefined) update.attributes = attributes;
    if (isActive !== undefined) update.isActive = Boolean(isActive);

    const updated = await Product.findByIdAndUpdate(id, { $set: update }, { new: true, runValidators: true });
    return res.json({ item: updated });
  } catch (err) {
    return res.status(400).json({ error: true, message: err.message, details: err.stack });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ error: true, message: 'Product not found' });

    const isAdmin = req.user?.role === 'admin';
    let isOwner = false;
    if (!isAdmin) {
      const sellerId = await getSellerIdForUser(req.user?.id);
      isOwner = sellerId && product.seller?.toString() === sellerId;
    }

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: true, message: 'Forbidden: not an owner' });
    }

    await product.deleteOne();
    return res.json({ success: true });
  } catch (err) {
    return res.status(400).json({ error: true, message: err.message, details: err.stack });
  }
};

const mongoose = require('mongoose');
const Review = require('@src/models/Review');
const Product = require('@src/models/Product');

async function recalcProductRating(productId) {
  const stats = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId) } },
    { $group: { _id: '$product', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const avg = stats[0]?.avg || 0;
  const count = stats[0]?.count || 0;
  await Product.findByIdAndUpdate(productId, { $set: { ratingAvg: avg, reviewsCount: count } });
}

exports.listProductReviews = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: true, message: 'Invalid product id' });
    const reviews = await Review.find({ product: id }).sort({ createdAt: -1 });
    return res.json({ items: reviews });
  } catch (err) {
    return res.status(500).json({ error: true, message: err.message, details: err.stack });
  }
};

exports.addProductReview = async (req, res) => {
  try {
    const { id } = req.params; // product id
    const userId = req.user?.id;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: true, message: 'Invalid product id' });
    const { rating, comment } = req.body;

    if (rating === undefined || rating === null) return res.status(400).json({ error: true, message: 'rating is required' });
    const numRating = Number(rating);
    if (Number.isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ error: true, message: 'rating must be between 1 and 5' });
    }

    const existing = await Review.findOne({ product: id, user: userId });
    if (existing) return res.status(400).json({ error: true, message: 'You have already reviewed this product' });

    const review = await Review.create({ product: id, user: userId, rating: numRating, comment: comment || '' });
    await recalcProductRating(id);

    return res.status(201).json({ item: review });
  } catch (err) {
    // Duplicate error safety
    if (err && err.code === 11000) {
      return res.status(400).json({ error: true, message: 'Duplicate review not allowed', details: err.message });
    }
    return res.status(400).json({ error: true, message: err.message, details: err.stack });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params; // review id
    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ error: true, message: 'Review not found' });

    const isAdmin = req.user?.role === 'admin';
    const isOwner = review.user?.toString() === req.user?.id;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: true, message: 'Forbidden: not allowed to delete this review' });
    }

    const productId = review.product?.toString();
    await review.deleteOne();
    if (productId) await recalcProductRating(productId);

    return res.json({ success: true });
  } catch (err) {
    return res.status(400).json({ error: true, message: err.message, details: err.stack });
  }
};

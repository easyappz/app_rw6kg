const Category = require('@src/models/Category');

function toInt(val, def, min, max) {
  let n = parseInt(val, 10);
  if (Number.isNaN(n)) n = def;
  if (min !== undefined) n = Math.max(min, n);
  if (max !== undefined) n = Math.min(max, n);
  return n;
}

exports.listCategories = async (req, res) => {
  try {
    const page = toInt(req.query.page, 1, 1);
    const limit = toInt(req.query.limit, 20, 1, 100);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Category.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Category.countDocuments({}),
    ]);

    return res.json({ items, page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    return res.status(500).json({ error: true, message: err.message, details: err.stack });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, slug, description } = req.body;
    if (!name) return res.status(400).json({ error: true, message: 'Name is required' });

    const category = await Category.create({ name, slug, description });
    return res.status(201).json({ item: category });
  } catch (err) {
    return res.status(400).json({ error: true, message: err.message, details: err.stack });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description } = req.body;
    const updated = await Category.findByIdAndUpdate(
      id,
      { $set: { name, slug, description } },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: true, message: 'Category not found' });
    return res.json({ item: updated });
  } catch (err) {
    return res.status(400).json({ error: true, message: err.message, details: err.stack });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Category.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: true, message: 'Category not found' });
    return res.json({ success: true });
  } catch (err) {
    return res.status(400).json({ error: true, message: err.message, details: err.stack });
  }
};

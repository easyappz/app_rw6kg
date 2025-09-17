const path = require('path');
const fs = require('fs');
const multer = require('multer');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safeName}`;
    cb(null, unique);
  },
});

const upload = multer({ storage });

exports.uploadMiddlewareAny = upload.any();

exports.handleImagesUpload = async (req, res) => {
  try {
    const files = req.files || [];
    // Also support single field name 'image' or multiple 'files[]' -> handled by .any()
    const urls = files.map((f) => `/uploads/${f.filename}`);
    return res.status(201).json({ urls });
  } catch (err) {
    return res.status(400).json({ error: true, message: err.message, details: err.stack });
  }
};

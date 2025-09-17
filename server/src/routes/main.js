const express = require('express');

const router = express.Router();

try {
  // Existing resource routers
  router.use('/auth', require('@src/routes/auth'));
} catch (err) {
  // If auth routes are not present, continue without failing
}
try {
  router.use('/users', require('@src/routes/users'));
} catch (err) {
  // If users routes are not present, continue without failing
}

// New resource routers (catalog)
try {
  router.use('/categories', require('@src/routes/categories'));
} catch (err) {
  console.error('Failed to mount categories routes:', err.message);
}
try {
  router.use('/sellers', require('@src/routes/sellers'));
} catch (err) {
  console.error('Failed to mount sellers routes:', err.message);
}
try {
  router.use('/products', require('@src/routes/products'));
} catch (err) {
  console.error('Failed to mount products routes:', err.message);
}
try {
  router.use('/', require('@src/routes/reviews'));
} catch (err) {
  console.error('Failed to mount reviews routes:', err.message);
}
try {
  router.use('/upload', require('@src/routes/upload'));
} catch (err) {
  console.error('Failed to mount upload routes:', err.message);
}

// GET /api/hello
router.get('/hello', async (req, res) => {
  try {
    return res.json({ message: 'Hello from API!' });
  } catch (err) {
    return res.status(500).json({ error: true, message: err.message, details: err.stack });
  }
});

// GET /api/status
router.get('/status', async (req, res) => {
  try {
    return res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(500).json({ error: true, message: err.message, details: err.stack });
  }
});

module.exports = router;

const express = require('express');

const router = express.Router();

// Resource routers
router.use('/auth', require('@src/routes/auth'));
router.use('/users', require('@src/routes/users'));

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

const express = require('express');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    return res.json({ resource: 'categories', ok: true });
  } catch (err) {
    return res.status(500).json({ error: true, message: err.message, details: err.stack });
  }
});

module.exports = router;

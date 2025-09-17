const jwt = require('jsonwebtoken');

const JWT_SECRET = 'EASYAPPZ_MARKETPLACE_SECRET';

function auth(req, res, next) {
  try {
    const header = req.headers['authorization'] || req.headers['Authorization'];
    if (!header) {
      return res.status(401).json({
        error: true,
        message: 'Authorization header missing. Expected "Authorization: Bearer <token>"',
      });
    }

    const parts = header.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1]) {
      return res.status(401).json({
        error: true,
        message: 'Authorization header malformed. Expected "Authorization: Bearer <token>"',
      });
    }

    const token = parts[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded || !decoded._id) {
      return res.status(401).json({ error: true, message: 'Invalid token payload' });
    }

    req.user = { _id: decoded._id, role: decoded.role };
    return next();
  } catch (err) {
    const isJwtError = err && (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError');
    const status = isJwtError ? 401 : 500;
    return res.status(status).json({ error: true, message: err.message, details: err.stack });
  }
}

// Expose secret for reference if needed elsewhere
auth.JWT_SECRET = JWT_SECRET;

module.exports = auth;

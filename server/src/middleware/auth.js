const jwt = require('jsonwebtoken');

// Store secrets in code as per requirements (no .env for this task)
const JWT_SECRET = 'easyappz_marketplace_demo_secret_change_me';

function getTokenFromHeader(req) {
  const auth = req.headers['authorization'] || '';
  if (!auth.startsWith('Bearer ')) return null;
  return auth.replace('Bearer ', '').trim();
}

function requireAuth(req, res, next) {
  try {
    const token = getTokenFromHeader(req);
    if (!token) {
      return res.status(401).json({ error: true, message: 'Unauthorized: missing token' });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: decoded.id || decoded._id || decoded.userId,
      role: decoded.role || 'user',
    };
    return next();
  } catch (err) {
    return res.status(401).json({ error: true, message: `Unauthorized: ${err.message}`, details: err.stack });
  }
}

function requireRoles(...roles) {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: true, message: 'Unauthorized: user not set' });
      }
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ error: true, message: 'Forbidden: insufficient role' });
      }
      return next();
    } catch (err) {
      return res.status(500).json({ error: true, message: err.message, details: err.stack });
    }
  };
}

module.exports = {
  requireAuth,
  requireRoles,
  JWT_SECRET,
};

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'jewellery_jwt_super_secret_key_2024';

/**
 * verifyToken middleware
 * Extracts JWT from Authorization: Bearer <token> header,
 * verifies it, and attaches decoded payload to req.user.
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  // Check header exists and starts with "Bearer "
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided. Use Authorization: Bearer <token>',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { user_id, role, iat, exp }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token has expired. Please log in again.' });
    }
    return res.status(403).json({ success: false, message: 'Invalid token. Access forbidden.' });
  }
};

/**
 * requireAdmin middleware — use after verifyToken
 * Checks that the decoded token has role === 'admin'
 */
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ success: false, message: 'Access forbidden. Admins only.' });
};

module.exports = { verifyToken, requireAdmin };

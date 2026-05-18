const express  = require('express');
const router   = express.Router();
const jwt      = require('jsonwebtoken');
const User     = require('../models/User');
const Product  = require('../models/Product');
const Order    = require('../models/Order');
const { verifyToken } = require('../middleware/verifyToken');

const JWT_SECRET = process.env.JWT_SECRET || 'jewellery_jwt_super_secret_key_2024';

// ─────────────────────────────────────────────────
// PUBLIC ENDPOINTS
// ─────────────────────────────────────────────────

/**
 * POST /api/v1/auth/login
 * Authenticate user and return a signed JWT
 */
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Sign the JWT — encode user_id and role in payload
    const token = jwt.sign(
      { user_id: user._id, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

/**
 * GET /api/v1/products
 * Returns paginated + filtered product list (JSON)
 */
router.get('/products', async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, page = 1, limit = 8 } = req.query;
    const filter = {};

    if (search) filter.name = { $regex: search, $options: 'i' };
    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter).skip(skip).limit(Number(limit));

    return res.status(200).json({
      success: true,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      totalProducts: total,
      count: products.length,
      products,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

/**
 * GET /api/v1/products/:id
 * Returns a single product by ID
 */
router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    return res.status(200).json({ success: true, product });
  } catch (err) {
    // Handle invalid ObjectId format
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid product ID format.' });
    }
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─────────────────────────────────────────────────
// PROTECTED ENDPOINTS (requires valid JWT)
// ─────────────────────────────────────────────────

/**
 * GET /api/v1/user/profile
 * Returns the authenticated user's profile
 */
router.get('/user/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.user_id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    return res.status(200).json({ success: true, user });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

/**
 * POST /api/v1/orders
 * Allows a logged-in user to place an order
 * Body: { items: [{ product, name, price, quantity }] }
 */
router.post('/orders', verifyToken, async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must contain at least one item.' });
    }

    // Validate that all product IDs exist and stock is sufficient
    for (const item of items) {
      if (!item.product || !item.quantity || item.quantity < 1) {
        return res.status(400).json({ success: false, message: 'Each item must have a valid product ID and quantity.' });
      }
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product ID ${item.product} not found.` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.stock}`,
        });
      }
    }

    // Calculate total
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = await Order.create({
      user: req.user.user_id,
      items,
      totalAmount,
    });

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order,
    });
  } catch (err) {
    console.error(err);
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid product ID in order items.' });
    }
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;

const express  = require('express');
const router   = express.Router();
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');
const Product  = require('../models/Product');
const { isAdmin } = require('../middleware/auth');

// Protect all admin routes
router.use(isAdmin);

const CATEGORIES = ['Rings', 'Earrings', 'Necklaces', 'Bangles', 'Bracelets', 'Pendants'];

// ── Multer Setup ─────────────────────────────────
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) =>
    cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname).toLowerCase());
  },
});

const fileFilter = (req, file, cb) => {
  const ok = /jpeg|jpg|png|webp/.test(
    path.extname(file.originalname).toLowerCase()
  );
  cb(ok ? null : new Error('Only jpg/png/webp images allowed'), ok);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// ── GET /admin — Dashboard ────────────────────────
router.get('/', async (req, res) => {
  try {
    const products      = await Product.find().sort({ createdAt: -1 }).lean();
    const totalProducts = products.length;
    const lowStock      = products.filter(p => p.stock > 0 && p.stock < 10).length;
    const outOfStock    = products.filter(p => p.stock === 0).length;

    res.render('admin/dashboard', {
      products, totalProducts, lowStock, outOfStock,
      totalCategories: CATEGORIES.length,
      success: req.query.success || null,
      error:   req.query.error   || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// ── GET /admin/add — Add Form ─────────────────────
router.get('/add', (req, res) => {
  res.render('admin/add', {
    categories: CATEGORIES,
    error: req.query.error || null,
  });
});

// ── POST /admin/add — Create Product ─────────────
router.post('/add', upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, category, rating, stock } = req.body;

    if (!name || !price || !category || stock === undefined || stock === '') {
      return res.redirect('/admin/add?error=Please+fill+in+all+required+fields');
    }

    const imagePath = req.file
      ? '/uploads/' + req.file.filename
      : '/images/pr1.jpg';

    await Product.create({
      name: name.trim(),
      description: (description || '').trim(),
      price:    parseFloat(price),
      category,
      rating:   parseFloat(rating) || 0,
      stock:    parseInt(stock),
      image:    imagePath,
    });

    res.redirect('/admin?success=Product+added+successfully!');
  } catch (err) {
    console.error(err);
    res.redirect('/admin/add?error=' + encodeURIComponent(err.message));
  }
});

// ── GET /admin/edit/:id — Edit Form ──────────────
router.get('/edit/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) return res.redirect('/admin?error=Product+not+found');

    res.render('admin/edit', {
      product,
      categories: CATEGORIES,
      error: req.query.error || null,
    });
  } catch (err) {
    console.error(err);
    res.redirect('/admin?error=Something+went+wrong');
  }
});

// ── POST /admin/edit/:id — Update Product ────────
router.post('/edit/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, category, rating, stock } = req.body;

    if (!name || !price || !category || stock === undefined || stock === '') {
      return res.redirect(
        `/admin/edit/${req.params.id}?error=Please+fill+in+all+required+fields`
      );
    }

    const updateData = {
      name: name.trim(),
      description: (description || '').trim(),
      price:    parseFloat(price),
      category,
      rating:   parseFloat(rating) || 0,
      stock:    parseInt(stock),
    };

    if (req.file) updateData.image = '/uploads/' + req.file.filename;

    await Product.findByIdAndUpdate(req.params.id, updateData, { runValidators: true });
    res.redirect('/admin?success=Product+updated+successfully!');
  } catch (err) {
    console.error(err);
    res.redirect(
      `/admin/edit/${req.params.id}?error=` + encodeURIComponent(err.message)
    );
  }
});

// ── POST /admin/delete/:id — Delete Product ───────
router.post('/delete/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.redirect('/admin?success=Product+deleted+successfully!');
  } catch (err) {
    console.error(err);
    res.redirect('/admin?error=Could+not+delete+product');
  }
});

module.exports = router;

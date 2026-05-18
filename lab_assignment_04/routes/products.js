const express = require('express');
const router  = express.Router();
const Product = require('../models/Product');

const PRODUCTS_PER_PAGE = 8;
const CATEGORIES = ['Rings', 'Earrings', 'Necklaces', 'Bangles', 'Bracelets', 'Pendants'];

router.get('/', async (req, res) => {
  try {
    const page     = Math.max(1, parseInt(req.query.page) || 1);
    const search   = req.query.search   || '';
    const category = req.query.category || '';
    const minPrice = req.query.minPrice || '';
    const maxPrice = req.query.maxPrice || '';

    const filter = {};
    if (search)   filter.name     = { $regex: search, $options: 'i' };
    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    const totalProducts = await Product.countDocuments(filter);
    const totalPages    = Math.max(1, Math.ceil(totalProducts / PRODUCTS_PER_PAGE));
    const currentPage   = Math.min(page, totalPages);
    const products      = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * PRODUCTS_PER_PAGE)
      .limit(PRODUCTS_PER_PAGE)
      .lean();

    res.render('products', {
      products, currentPage, totalPages, totalProducts,
      search, category, minPrice, maxPrice, categories: CATEGORIES,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

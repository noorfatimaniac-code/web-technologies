const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Use existing auth middleware
const { isLoggedIn, isAdmin } = require('../middleware/auth');

// Helper function to perform the sales aggregations
async function getSalesData() {
  // 1. Calculate Total Revenue
  const revenueAgg = await Order.aggregate([
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalAmount' },
        totalOrders: { $sum: 1 }
      }
    }
  ]);

  const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;
  const totalOrders = revenueAgg.length > 0 ? revenueAgg[0].totalOrders : 0;

  // 2. Find Top Selling Product
  const topProductAgg = await Order.aggregate([
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product',
        totalQuantity: { $sum: '$items.quantity' }
      }
    },
    { $sort: { totalQuantity: -1 } },
    { $limit: 1 },
    {
      $lookup: {
        from: 'products', // The MongoDB collection name for Product model
        localField: '_id',
        foreignField: '_id',
        as: 'productDetails'
      }
    },
    { $unwind: '$productDetails' }
  ]);

  let topProduct = null;
  if (topProductAgg.length > 0) {
    topProduct = {
      name: topProductAgg[0].productDetails.name,
      price: topProductAgg[0].productDetails.price,
      totalSold: topProductAgg[0].totalQuantity
    };
  }

  return { totalRevenue, totalOrders, topProduct };
}

// Route A: Server-Side Rendered Page
router.get('/sales', isLoggedIn, isAdmin, async (req, res) => {
  try {
    const { totalRevenue, totalOrders, topProduct } = await getSalesData();
    
    // Recent orders (limit 5)
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email');

    // Make sure res.locals.layout doesn't throw if ejs-mate is parsed
    res.locals.layout = function() {}; 

    res.render('sales', {
      layout: 'layouts/main',
      totalRevenue,
      totalOrders,
      topProduct,
      recentOrders
    });
  } catch (err) {
    console.error('Error loading sales page:', err);
    res.status(500).send('Server Error');
  }
});

// Route B: JSON polling endpoint
router.get('/api/sales-data', async (req, res) => {
  try {
    const data = await getSalesData();
    // Return EXACTLY the required JSON shape
    res.json(data);
  } catch (err) {
    console.error('Error fetching sales data:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;

require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./models/Order');
const Product = require('./models/Product');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/jewellery_store';

async function seedOrders() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Handle case where no products or users exist
    const users = await User.find({});
    const products = await Product.find({});

    if (users.length === 0 || products.length === 0) {
      console.warn('⚠️ Warning: No products or users found. Please add users and products before seeding orders. Exiting gracefully.');
      process.exit(0);
    }

    // Clear existing Orders collection
    await Order.deleteMany({});
    console.log('🗑️ Cleared existing orders');

    const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    const ordersToInsert = [];

    // Insert 15 realistic sample orders
    for (let i = 0; i < 15; i++) {
      // Pick a random user
      const randomUser = users[Math.floor(Math.random() * users.length)];

      // Pick 1 to 3 random products
      const numItems = Math.floor(Math.random() * 3) + 1;
      const items = [];
      let totalAmount = 0;

      for (let j = 0; j < numItems; j++) {
        const randomProduct = products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 3) + 1; // 1 to 3 qty
        
        items.push({
          product: randomProduct._id,
          name: randomProduct.name,
          price: randomProduct.price,
          quantity: quantity
        });

        totalAmount += (randomProduct.price * quantity);
      }

      // Generate a random date within the last 30 days
      const past30Days = new Date();
      past30Days.setDate(past30Days.getDate() - Math.floor(Math.random() * 30));

      // Random status
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

      ordersToInsert.push({
        user: randomUser._id,
        items: items,
        totalAmount: totalAmount,
        status: randomStatus,
        createdAt: past30Days,
        updatedAt: past30Days
      });
    }

    await Order.insertMany(ordersToInsert);
    console.log('🌱 Successfully inserted 15 sample orders');

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to seed orders:', err.message);
    process.exit(1);
  }
}

seedOrders();

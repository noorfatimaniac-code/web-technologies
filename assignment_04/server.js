require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const path     = require('path');

const app = express();

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Body parsing (for admin forms)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// ── Routes ───────────────────────────────────────
const productsRouter = require('./routes/products');
const adminRouter    = require('./routes/admin');

app.use('/products', productsRouter);
app.use('/admin',    adminRouter);

// Home page
app.get('/', (req, res) => res.render('homepage'));

// ── MongoDB + Start ──────────────────────────────
const PORT      = process.env.PORT      || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/jewellery_store';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () =>
      console.log(`🚀 Server running at http://localhost:${PORT}`)
    );
  })
  .catch(err => {
    console.error('❌ MongoDB error:', err.message);
    process.exit(1);
  });

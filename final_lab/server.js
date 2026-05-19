require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const path     = require('path');

const app = express();

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
const expressLayouts = require('express-ejs-layouts');
app.use(expressLayouts);
app.set('layout', false); // Disable by default to not break existing views


// Body parsing (for admin forms)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static files
app.use(express.static(path.join(__dirname, 'public')));

const session = require('express-session');
const MongoStore = require('connect-mongo').default;
const flash = require('connect-flash');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/jewellery_store';

// ── Session & Flash ──────────────────────────────
app.use(session({
  secret: process.env.SESSION_SECRET || 'jewellery_super_secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: MONGO_URI }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

app.use(flash());

// Global variables for views
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// ── Routes ───────────────────────────────────────
const productsRouter = require('./routes/products');
const adminRouter    = require('./routes/admin');
const authRouter     = require('./routes/auth');
const apiRouter      = require('./routes/api');
const salesRouter    = require('./routes/sales');

app.use('/products', productsRouter);
app.use('/admin',    adminRouter);
app.use('/auth',     authRouter);
app.use('/api/v1',   apiRouter);
app.use('/',         salesRouter);

// Home page
app.get('/', (req, res) => res.render('homepage'));

// Checkout page (Protected)
const { isLoggedIn } = require('./middleware/auth');
app.get('/checkout', isLoggedIn, (req, res) => {
  res.render('checkout');
});

// ── MongoDB + Start ──────────────────────────────
const PORT      = process.env.PORT      || 3000;

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

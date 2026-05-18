const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /auth/register
router.get('/register', (req, res) => {
  res.render('auth/register');
});

// POST /auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      req.flash('error', 'All fields are required.');
      return res.redirect('/auth/register');
    }
    if (password.length < 6) {
      req.flash('error', 'Password must be at least 6 characters long.');
      return res.redirect('/auth/register');
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash('error', 'Email is already registered.');
      return res.redirect('/auth/register');
    }

    // Create user
    const newUser = await User.create({ name, email, password });
    
    // Log user in after register
    req.session.user = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    };

    req.flash('success', `Welcome to Jewellery, ${newUser.name}!`);
    res.redirect('/');
  } catch (err) {
    console.error(err);
    req.flash('error', 'An error occurred during registration.');
    res.redirect('/auth/register');
  }
});

// GET /auth/login
router.get('/login', (req, res) => {
  res.render('auth/login');
});

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      req.flash('error', 'Please provide email and password.');
      return res.redirect('/auth/login');
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      req.flash('error', 'Invalid email or password.');
      return res.redirect('/auth/login');
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      req.flash('error', 'Invalid email or password.');
      return res.redirect('/auth/login');
    }

    // Set session
    req.session.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    req.flash('success', `Welcome back, ${user.name}!`);
    
    // Redirect admins to dashboard, customers to home
    if (user.role === 'admin') {
      res.redirect('/admin');
    } else {
      res.redirect('/');
    }
  } catch (err) {
    console.error(err);
    req.flash('error', 'An error occurred during login.');
    res.redirect('/auth/login');
  }
});

// GET /auth/logout
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error(err);
    // Cannot use req.flash here easily because session is destroyed
    res.redirect('/');
  });
});

module.exports = router;

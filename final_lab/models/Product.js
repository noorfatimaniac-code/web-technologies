const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price:       { type: Number, required: true, min: 0 },
    category: {
      type: String,
      required: true,
      enum: ['Rings', 'Earrings', 'Necklaces', 'Bangles', 'Bracelets', 'Pendants'],
    },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    stock:  { type: Number, default: 0, min: 0 },
    image:  { type: String, default: '/images/pr1.jpg' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);

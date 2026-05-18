require('dotenv').config();

const mongoose = require('mongoose');
const Product = require('./models/Product');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/jewellery_store';

const images = [
  '/images/pr1.jpg',
  '/images/pr2.jpg',
  '/images/pr3.jpg',
  '/images/pr4.jpg',
  '/images/by-prouct1.jpg',
  '/images/by-product2.jpg',
  '/images/by-product3.jpg',
  '/images/by-product4.jpg',
  '/images/by-product5.jpg',
];

const products = [
  { name: 'Desi Gold Chunky Bangles', description: 'Traditional Pakistani gold-plated chunky bangles for weddings and festive occasions.', price: 2000, category: 'Bangles', rating: 4.8, stock: 15, image: images[0] },
  { name: 'Gold Chunky Ring', description: 'Bold statement gold chunky ring for the modern desi woman.', price: 700, category: 'Rings', rating: 4.5, stock: 25, image: images[1] },
  { name: 'Gold Flower Pendant', description: 'Delicate gold flower pendant with intricate traditional craftsmanship.', price: 1600, category: 'Pendants', rating: 4.7, stock: 20, image: images[2] },
  { name: 'Gold Chunky Earrings', description: 'Eye-catching chunky gold earrings that complement any festive outfit.', price: 2499, category: 'Earrings', rating: 4.6, stock: 18, image: images[3] },
  { name: 'Jhumka Earrings Set', description: 'Classic Pakistani jhumka earrings with traditional bell design and ruby accents.', price: 1800, category: 'Earrings', rating: 4.9, stock: 30, image: images[4] },
  { name: 'Polki Ring', description: 'Stunning polki ring with uncut diamonds set in 22K gold — bridal favourite.', price: 8500, category: 'Rings', rating: 4.8, stock: 8, image: images[5] },
  { name: 'Kundan Necklace Set', description: 'Royal Kundan necklace set perfect for bridal wear with matching earrings.', price: 12000, category: 'Necklaces', rating: 5.0, stock: 5, image: images[6] },
  { name: 'Gold Kara Bracelet', description: 'Traditional gold kara bracelet with intricate hand-engraving.', price: 3500, category: 'Bracelets', rating: 4.7, stock: 12, image: images[7] },
  { name: 'Meenakari Pendant', description: 'Colorful meenakari pendant with enamel work in traditional Mughal motifs.', price: 2200, category: 'Pendants', rating: 4.6, stock: 22, image: images[8] },
  { name: 'Chandbali Earrings', description: 'Moon-shaped chandbali earrings with fresh-water pearl drops.', price: 3200, category: 'Earrings', rating: 4.8, stock: 16, image: images[0] },
  { name: 'Antique Gold Bangle Set', description: 'Set of 6 antique gold bangles with rich oxidized finish — timeless classic.', price: 4500, category: 'Bangles', rating: 4.7, stock: 10, image: images[1] },
  { name: 'Twisted Gold Ring', description: 'Elegant twisted gold band ring, ideal for stacking with other rings.', price: 950, category: 'Rings', rating: 4.4, stock: 35, image: images[2] },
  { name: 'Temple Necklace', description: 'South-Asian inspired temple necklace with ruby and emerald stones.', price: 9800, category: 'Necklaces', rating: 4.9, stock: 6, image: images[3] },
  { name: 'Pearl Chain Bracelet', description: 'Dainty freshwater pearl bracelet strung on a delicate gold chain.', price: 1500, category: 'Bracelets', rating: 4.5, stock: 28, image: images[4] },
  { name: 'Teardrop Amethyst Pendant', description: 'Classic teardrop pendant with amethyst stone in a gold bezel setting.', price: 1900, category: 'Pendants', rating: 4.6, stock: 20, image: images[5] },
  { name: 'Rani Haar Necklace', description: 'Long Rani Haar necklace with layered gold chains and floral motifs — bridal.', price: 15000, category: 'Necklaces', rating: 5.0, stock: 4, image: images[6] },
  { name: 'Filigree Bangle Pair', description: 'Delicate filigree work bangles crafted in 18K gold, sold as a pair.', price: 6000, category: 'Bangles', rating: 4.8, stock: 9, image: images[7] },
  { name: 'Emerald Drop Earrings', description: 'Elegant emerald drop earrings in a gold setting for special occasions.', price: 5500, category: 'Earrings', rating: 4.7, stock: 11, image: images[8] },
  { name: 'Kundan Cocktail Ring', description: 'Statement kundan cocktail ring with multi-colored precious stones.', price: 3800, category: 'Rings', rating: 4.6, stock: 14, image: images[0] },
  { name: 'Layered Chain Necklace', description: 'Trendy layered gold chain necklace for everyday wear with a minimalist look.', price: 2800, category: 'Necklaces', rating: 4.5, stock: 24, image: images[1] },
  { name: 'Sitara Bangle Set of 4', description: 'Star-motif gold bangles set — a modern twist on the traditional design.', price: 5200, category: 'Bangles', rating: 4.7, stock: 8, image: images[2] },
  { name: 'Charm Bracelet', description: 'Gold charm bracelet adorned with traditional Pakistani motif charms.', price: 2100, category: 'Bracelets', rating: 4.4, stock: 20, image: images[3] },
  { name: 'Mang Tikka Pendant', description: 'Ornate bridal mang tikka repurposed as a show-stopping pendant.', price: 4200, category: 'Pendants', rating: 4.8, stock: 7, image: images[4] },
  { name: 'Hoop Earrings with Beads', description: 'Gold hoop earrings adorned with colorful glass beads — festival ready.', price: 1200, category: 'Earrings', rating: 4.3, stock: 32, image: images[5] },
  { name: 'Rose Gold Tennis Bracelet', description: 'Elegant rose gold tennis bracelet set with sparkling CZ stones all around.', price: 3100, category: 'Bracelets', rating: 4.6, stock: 15, image: images[6] },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    await Product.deleteMany({});
    console.log('🗑️  Cleared existing products');

    await Product.insertMany(products);
    console.log(`🌱 Inserted ${products.length} products successfully`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
}

seed();

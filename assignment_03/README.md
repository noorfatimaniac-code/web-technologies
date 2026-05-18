# 🗃️ Assignment 03 — Dynamic Product Catalog (Express + MongoDB + EJS) — Viva Study Guide

## ✅ Project Overview (Beginner Level)

This folder is a **full-stack web app** (server + database + pages) that shows a jewellery product catalog.

### 🧠 Big picture flow

1. Browser visits `http://localhost:3000/` → Express renders `views/homepage.ejs`
2. Browser clicks “Shop” → requests `/products`
3. Express route `/products` queries MongoDB using **Mongoose**
4. Express renders `views/products.ejs` with the list of products
5. User can search/filter/paginate → sends query parameters like:
   - `/products?search=ring&category=Rings&page=2&minPrice=1000`

---

## 📚 Table of Contents

- [📁 Folder Structure](#-folder-structure)
- [⚙️ Setup & Run](#️-setup--run)
- [🔐 Environment Variables (.env)](#-environment-variables-env)
- [🧠 File: server.js](#-file-serverjs)
- [🌱 File: seed.js](#-file-seedjs)
- [📦 File: models/Product.js](#-file-modelsproductjs)
- [🛣️ File: routes/products.js](#️-file-routesproductsjs)
- [🧩 Views (EJS)](#-views-ejs)
  - [views/homepage.ejs](#viewshomepageejs)
  - [views/products.ejs](#viewsproductsejs)
  - [views/partials/header.ejs](#viewspartialsheaderejs)
  - [views/partials/footer.ejs](#viewspartialsfooterejs)
- [🧪 Viva Questions](#-viva-questions)

---

## 📁 Folder Structure

- `server.js` — main Express server + DB connection
- `seed.js` — inserts demo products into MongoDB
- `models/Product.js` — Mongoose schema/model (Product)
- `routes/products.js` — `/products` route with filtering + pagination
- `views/` — EJS templates (homepage, products, partials)
- `public/` — static files (CSS/JS/images)
- `.env` / `.env.example` — environment configuration

---

## ⚙️ Setup & Run

### 1) Install dependencies

```bash
# Install dependencies for this project
npm install
```

### 2) Start MongoDB

Make sure MongoDB is running locally OR set `MONGO_URI` to a cloud DB.

### 3) Seed database (optional but recommended)

```bash
# Run a Node.js script file
node seed.js
```

### 4) Run server

```bash
# Start the development server
npm run dev
```

---

## 🔐 Environment Variables (.env)

### ✅ Concept

An `.env` file stores configuration like database URL and port.

### ✅ Why used here

- Keeps secrets/config out of code
- Allows different settings on different machines

### Typical variables

- `PORT` — which port your server listens on
- `MONGO_URI` — MongoDB connection string

**If removed:** Code falls back to defaults (port 3000 + local MongoDB URL).

---

## 🧠 File: server.js

### 📌 Code

```js
// Load configuration/dependency using require()
require("dotenv").config();

// Import a module into constant express
const express = require("express");
// Import a module into constant mongoose
const mongoose = require("mongoose");
// Import a module into constant path
const path = require("path");

// Declare constant app
const app = express();

// View engine
// Execute this statement
app.set("view engine", "ejs");
// Execute this statement
app.set("views", path.join(__dirname, "views"));

// Static files
// Register Express middleware or mount a router
app.use(express.static(path.join(__dirname, "public")));

// Routes
// Import a module into constant productsRouter
const productsRouter = require("./routes/products");
// Register Express middleware or mount a router
app.use("/products", productsRouter);

// Home page
// Define an Express GET route handler
app.get("/", (req, res) => {
  // Render an EJS view template as HTML response
  res.render("homepage");
// Close the current function/block call
});

// Connect to MongoDB then start server
// Declare constant PORT
const PORT = process.env.PORT || 3000;
// Declare constant MONGO_URI
const MONGO_URI =
  // Execute this statement
  process.env.MONGO_URI || "mongodb://localhost:27017/jewellery_store";

// JavaScript line (part of the program logic)
mongoose
  // JavaScript line (part of the program logic)
  .connect(MONGO_URI)
  // JavaScript line (part of the program logic)
  .then(() => {
    // Execute this statement
    console.log("✅ Connected to MongoDB");
    // JavaScript line (part of the program logic)
    app.listen(PORT, () => {
      // Execute this statement
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    // Close the current function/block call
    });
  // JavaScript line (part of the program logic)
  })
  // JavaScript line (part of the program logic)
  .catch((err) => {
    // Execute this statement
    console.error("❌ MongoDB connection error:", err.message);
    // Execute this statement
    process.exit(1);
// Close the current function/block call
  });
```

### ✅ Explanation (Concept • Why • Syntax • Analogy • If removed)

- **`require('dotenv').config()`**
  - **Concept:** Loads variables from `.env` into `process.env`.
  - **Why:** You want `MONGO_URI` and `PORT` without hardcoding.
  - **Analogy:** Reading settings from a note before starting work.
  - **If removed:** `process.env.MONGO_URI` won’t load from file.

- **`const express = require('express')` / `mongoose` / `path`**
  - **Concept:** Import libraries.
  - **Why:** Express for server, Mongoose for DB, path for safe file paths.
  - **If removed:** You can’t use those features.

- **`app.set('view engine', 'ejs')`**
  - **Concept:** Tells Express to render `.ejs` files.
  - **If removed:** `res.render(...)` fails.

- **`express.static(...)`**
  - **Concept:** Serve static files.
  - **Why:** Browser needs `/css/...`, `/js/...`, `/images/...`.
  - **If removed:** CSS/JS/images 404.

- **`app.use('/products', productsRouter)`**
  - **Concept:** Mount a router module.
  - **Why:** Keeps code clean and separated.
  - **Analogy:** Different departments in a company.

- **Connect DB THEN `app.listen`**
  - **Concept:** Start server only after DB is ready.
  - **Why:** `/products` depends on MongoDB; without DB you’d crash.
  - **If removed:** Server might start but routes fail due to no DB.

---

## 🌱 File: seed.js

### ✅ Concept

A “seeding” script fills the database with sample products.

### ✅ Why used here

So your catalog has data immediately (great for demo/viva).

### Key function: `seed()`

```js
// Declare an async function (can use await)
async function seed() {
  // Start a try block to catch runtime errors
  try {
    // Wait for an async operation (like DB call) to finish
    await mongoose.connect(MONGO_URI);
    // Wait for an async operation (like DB call) to finish
    await Product.deleteMany({});
    // Wait for an async operation (like DB call) to finish
    await Product.insertMany(products);
    // Execute this statement
    process.exit(0);
  // JavaScript line (part of the program logic)
  } catch (err) {
    // Execute this statement
    process.exit(1);
  // End of a code block
  }
// End of a code block
}

// Execute this statement
seed();
```

- **Concept:** `async/await` to run database operations in order.
- **Why:** DB calls are asynchronous (they take time).
- **Analogy:** Waiting for each cooking step to finish before the next.
- **If removed:** You’d have to manually insert products in MongoDB.

---

## 📦 File: models/Product.js

### ✅ Concept

A **Mongoose Schema** describes the _shape_ of documents in MongoDB.
A **Model** gives you methods like `Product.find()` and `Product.insertMany()`.

### 📌 Code

```js
// Declare constant productSchema
const productSchema = new mongoose.Schema(
  // Start of a code block
  {
    // JavaScript line (part of the program logic)
    name: { type: String, required: true, trim: true },
    // JavaScript line (part of the program logic)
    description: { type: String, default: "" },
    // JavaScript line (part of the program logic)
    price: { type: Number, required: true, min: 0 },
    // JavaScript line (part of the program logic)
    category: {
      // JavaScript line (part of the program logic)
      type: String,
      // JavaScript line (part of the program logic)
      required: true,
      // JavaScript line (part of the program logic)
      enum: [
        // JavaScript line (part of the program logic)
        "Rings",
        // JavaScript line (part of the program logic)
        "Earrings",
        // JavaScript line (part of the program logic)
        "Necklaces",
        // JavaScript line (part of the program logic)
        "Bangles",
        // JavaScript line (part of the program logic)
        "Bracelets",
        // JavaScript line (part of the program logic)
        "Pendants",
      // JavaScript line (part of the program logic)
      ],
    // JavaScript line (part of the program logic)
    },
    // JavaScript line (part of the program logic)
    rating: { type: Number, default: 0, min: 0, max: 5 },
    // JavaScript line (part of the program logic)
    stock: { type: Number, default: 0, min: 0 },
    // JavaScript line (part of the program logic)
    image: { type: String, default: "/images/pr1.jpg" },
  // JavaScript line (part of the program logic)
  },
  // JavaScript line (part of the program logic)
  { timestamps: true },
// Close the current function/block call
);

// Export functions so other files can import them
module.exports = mongoose.model("Product", productSchema);
```

### ✅ Why used here

- Makes sure every product has a valid `name`, `price`, and `category`
- Prevents invalid data (negative price, rating > 5, etc.)

### 🧪 Viva-style questions

- **Q:** What is the difference between Schema and Model?
  - **Ideal A:** Schema defines structure and validation; Model is the interface to create/query documents.
- **Q:** What does `enum` do?
  - **Ideal A:** Restricts values to a fixed allowed list.

---

## 🛣️ File: routes/products.js

### ✅ Concept

An Express **Router** organizes routes in a separate file.

### 📌 What this route supports

- Pagination (`page=1`, `page=2`)
- Search by name (`search=ring`)
- Filter by category (`category=Rings`)
- Price range (`minPrice`, `maxPrice`)

### Key handler (main logic)

```js
// Define a router endpoint (route handler)
router.get("/", async (req, res) => {
  // Declare constant page
  const page = Math.max(1, parseInt(req.query.page) || 1);
  // Declare constant search
  const search = req.query.search || "";
  // Declare constant category
  const category = req.query.category || "";
  // Declare constant minPrice
  const minPrice = req.query.minPrice || "";
  // Declare constant maxPrice
  const maxPrice = req.query.maxPrice || "";

  // Declare constant filter
  const filter = {};

  // Check a condition and run code only if true
  if (search) {
    // Execute this statement
    filter.name = { $regex: search, $options: "i" };
  // End of a code block
  }
  // Check a condition and run code only if true
  if (category) {
    // Execute this statement
    filter.category = category;
  // End of a code block
  }
  // Check a condition and run code only if true
  if (minPrice || maxPrice) {
    // Execute this statement
    filter.price = {};
    // Check a condition and run code only if true
    if (minPrice) filter.price.$gte = parseFloat(minPrice);
    // Check a condition and run code only if true
    if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
  // End of a code block
  }

  // Declare constant totalProducts
  const totalProducts = await Product.countDocuments(filter);
  // Declare constant totalPages
  const totalPages = Math.max(1, Math.ceil(totalProducts / PRODUCTS_PER_PAGE));
  // Declare constant currentPage
  const currentPage = Math.min(page, totalPages);
  // Declare constant skip
  const skip = (currentPage - 1) * PRODUCTS_PER_PAGE;

  // Declare constant products
  const products = await Product.find(filter)
    // JavaScript line (part of the program logic)
    .sort({ createdAt: -1 })
    // JavaScript line (part of the program logic)
    .skip(skip)
    // JavaScript line (part of the program logic)
    .limit(PRODUCTS_PER_PAGE)
    // Execute this statement
    .lean();

  // Render an EJS view template as HTML response
  res.render("products", {
    // JavaScript line (part of the program logic)
    products,
    // JavaScript line (part of the program logic)
    currentPage,
    // JavaScript line (part of the program logic)
    totalPages,
    // JavaScript line (part of the program logic)
    totalProducts,
    // JavaScript line (part of the program logic)
    search,
    // JavaScript line (part of the program logic)
    category,
    // JavaScript line (part of the program logic)
    minPrice,
    // JavaScript line (part of the program logic)
    maxPrice,
    // JavaScript line (part of the program logic)
    categories: CATEGORIES,
  // Close the current function/block call
  });
// Close the current function/block call
});
```

### ✅ Explanation highlights

- **Query parameters (`req.query`)**
  - **Concept:** Data in URL after `?`.
  - **Why:** Filter/search without extra pages.

- **MongoDB filter object**
  - **Concept:** A plain JS object that describes what to match.
  - **Why:** You build it dynamically depending on which filters the user provided.

- **`$regex` with `$options: 'i'`**
  - **Concept:** Case-insensitive text search.
  - **Analogy:** Searching a book without caring about capitalization.

- **Pagination math**
  - `skip = (currentPage - 1) * perPage`
  - **Concept:** Skip earlier results.
  - **Analogy:** If each page shows 8 items, page 2 skips first 8.

- **`.lean()`**
  - **Concept:** Returns plain objects instead of full Mongoose documents.
  - **Why:** Faster rendering in EJS.

---

## 🧩 Views (EJS)

### views/homepage.ejs

- **Concept:** EJS template for homepage.
- **Why:** Keeps markup in a view file; easy to render from Express.
- Uses **partials**:
  - `<%- include('partials/header') %>`
  - `<%- include('partials/footer') %>`

**Analogy:** Partials are like reusable LEGO pieces (header/footer reused on many pages).

### views/products.ejs

This is the main catalog page.

Important EJS concepts inside:

- **Output value:** `<%= value %>` (escapes HTML)
- **Run JS logic:** `<% if (...) { %> ... <% } %>`
- **Loops:** `<% products.forEach(function(product) { %> ... <% }) %>`

Pagination uses a helper function:

```ejs
<!-- Start a <%> element -->
<%
  <!-- Text content shown on the page -->
  function buildUrl(p) {
    <!-- Text content shown on the page -->
    var params = new URLSearchParams();
    <!-- Text content shown on the page -->
    if (search) params.set('search', search);
    <!-- Text content shown on the page -->
    ...
    <!-- Text content shown on the page -->
    params.set('page', p);
    <!-- Text content shown on the page -->
    return '/products?' + params.toString();
  <!-- Text content shown on the page -->
  }
<!-- Text content shown on the page -->
%>
```

- **Concept:** Build correct links that keep the current filters.
- **Why:** When you click “Next”, you shouldn’t lose your search/category.

### views/partials/header.ejs

- Holds the navbar and links.
- Reused on homepage and products.

### views/partials/footer.ejs

- Holds footer links and script include.

---

## 🧪 Viva Questions

- **Q:** Why use Mongoose instead of raw MongoDB queries?
  - **Ideal A:** Mongoose adds schema validation, models, and easier querying patterns.
- **Q:** Why start the server only after connecting to MongoDB?
  - **Ideal A:** Because routes depend on DB; if DB is down, the app can’t serve product data correctly.
- **Q:** What is the difference between `<%= %>` and `<%- %>` in EJS?
  - **Ideal A:** `<%= %>` escapes HTML (safer). `<%- %>` outputs raw HTML (use carefully).

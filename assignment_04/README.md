# 🛠️ Assignment 04 — Admin Panel (CRUD) + Image Uploads (Multer) — Viva Study Guide

## ✅ Project Overview (Beginner Level)

This project extends Assignment 03 by adding an **Admin panel**.

### 🧠 Big idea

- **Store side (public):** Browse products at `/products`
- **Admin side (private-ish):** Manage products at `/admin`
  - Add product ➕
  - Edit product ✏️
  - Delete product 🗑️
  - Upload product images 📸

Tech used:

- **Express** for routing
- **MongoDB + Mongoose** for storing products
- **EJS** for rendering pages
- **Multer** for handling file uploads

---

## 📚 Table of Contents

- [📁 Folder Structure](#-folder-structure)
- [⚙️ Setup & Run](#️-setup--run)
- [🧠 File: server.js](#-file-serverjs)
- [📦 File: models/Product.js](#-file-modelsproductjs)
- [🛣️ File: routes/products.js](#️-file-routesproductsjs)
- [🔐 File: routes/admin.js](#-file-routesadminjs)
  - [Multer Setup](#multer-setup)
  - [Admin Dashboard](#admin-dashboard)
  - [Add Product](#add-product)
  - [Edit Product](#edit-product)
  - [Delete Product](#delete-product)
- [🧩 Views (EJS)](#-views-ejs)
- [🚨 Common Issues](#-common-issues)
- [🧪 Viva Questions](#-viva-questions)

---

## 📁 Folder Structure

- `server.js` — app setup + DB connection
- `routes/products.js` — public catalog
- `routes/admin.js` — admin CRUD routes
- `models/Product.js` — product schema
- `views/` — EJS templates
  - `views/admin/dashboard.ejs`
  - `views/admin/add.ejs`
  - `views/admin/edit.ejs`
  - `views/admin/partials/sidebar.ejs`
- `public/` — static CSS/JS/images
- `uploads/` — (folder exists, but upload destination in code is different; see Common Issues)

---

## ⚙️ Setup & Run

```bash
# Install dependencies for this project
npm install
# Run a Node.js script file
node seed.js   # optional
# Start the development server
npm run dev
```

---

## 🧠 File: server.js

```js
// Register Express middleware or mount a router
app.use(express.urlencoded({ extended: true }));
// Register Express middleware or mount a router
app.use(express.json());
```

- **Concept:** Body parsing middleware.
- **Why here:** Admin forms send data via POST; Express must read `req.body`.
- **Analogy:** Opening an envelope to read the letter inside.
- **If removed:** `req.body` will be `undefined` in admin routes.

```js
// Register Express middleware or mount a router
app.use("/admin", adminRouter);
```

- **Concept:** Router mounting.
- **Why:** Keeps admin logic in a separate file.

---

## 📦 File: models/Product.js

Same idea as Assignment 03: schema validation for fields like name/price/category.

**Viva focus:** `enum`, `required`, `min/max`, and `timestamps`.

---

## 🛣️ File: routes/products.js

Public catalog route with search/filter/pagination.

**Viva focus:** `req.query`, building MongoDB filters, pagination math.

---

## 🔐 File: routes/admin.js

This is the most important file for viva in Assignment 04.

### ✅ Concept: CRUD

CRUD means:

- **C**reate → add new product
- **R**ead → view list of products
- **U**pdate → edit product
- **D**elete → remove product

Real-life analogy: A shopkeeper managing inventory.

---

### Multer Setup

```js
// Declare constant storage
const storage = multer.diskStorage({
  // JavaScript line (part of the program logic)
  destination: (req, file, cb) =>
    // JavaScript line (part of the program logic)
    cb(null, path.join(__dirname, "../public/uploads")),
  // JavaScript line (part of the program logic)
  filename: (req, file, cb) => {
    // Declare constant unique
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // Execute this statement
    cb(null, unique + path.extname(file.originalname).toLowerCase());
  // JavaScript line (part of the program logic)
  },
// Close the current function/block call
});
```

- **Concept:** Configure where uploaded files go and what they are named.
- **Why:** Prevent filename collisions and keep uploads organized.
- **Syntax notes:**
  - `Date.now()` creates a time-based unique number
  - `Math.random()` adds extra uniqueness
  - `path.extname(...)` keeps the original extension

```js
// Declare constant upload
const upload = multer({
  // JavaScript line (part of the program logic)
  storage,
  // JavaScript line (part of the program logic)
  fileFilter,
  // JavaScript line (part of the program logic)
  limits: { fileSize: 5 * 1024 * 1024 },
// Close the current function/block call
});
```

- **Concept:** Limit file size to 5MB.
- **Why:** Protects server from huge uploads.

**If removed:** Any file type/size could be uploaded (bad UX, risky).

---

### Admin Dashboard

```js
// Define a router endpoint (route handler)
router.get('/', async (req, res) => {
  // Declare constant products
  const products = await Product.find().sort({ createdAt: -1 }).lean();
  // Render an EJS view template as HTML response
  res.render('admin/dashboard', { products, ... });
// Close the current function/block call
});
```

- **Concept:** Read all products from DB and render an admin view.
- **Why:** Dashboard shows product list + stats.
- **Analogy:** Inventory list on a clipboard.

`dashboard.ejs` also contains client-side JS for the delete confirmation modal:

- It stores an ID in `currentDeleteId`
- Then submits the correct hidden delete form

---

### Add Product

**GET form:**

```js
// Define a router endpoint (route handler)
router.get("/add", (req, res) => {
  // Render an EJS view template as HTML response
  res.render("admin/add", { categories: CATEGORIES });
// Close the current function/block call
});
```

- Shows the form.

**POST create:**

```js
// Define a router endpoint (route handler)
router.post('/add', upload.single('image'), async (req, res) => {
  // Execute this statement
  const { name, price, category, stock } = req.body;
  // Declare constant imagePath
  const imagePath = req.file ? '/uploads/' + req.file.filename : '/images/pr1.jpg';
  // Wait for an async operation (like DB call) to finish
  await Product.create({ ... });
  // Execute this statement
  res.redirect('/admin?success=...');
// Close the current function/block call
});
```

- **Concept:** Form submission + optional file upload.
- **Why:** Create a new DB record.
- **Key syntax:**
  - `upload.single('image')` reads the `<input name="image" type="file">`.
  - `req.file` exists only if user uploaded a file.

---

### Edit Product

**GET:** fetch product by ID and show pre-filled form.

```js
// Define a router endpoint (route handler)
router.get("/edit/:id", async (req, res) => {
  // Declare constant product
  const product = await Product.findById(req.params.id).lean();
  // Render an EJS view template as HTML response
  res.render("admin/edit", { product, categories: CATEGORIES });
// Close the current function/block call
});
```

- **Concept:** Route parameter `:id`.
- **Why:** Each product has its own edit URL.
- **Analogy:** Editing a contact using its phone number as identifier.

**POST:** update product.

```js
// Wait for an async operation (like DB call) to finish
await Product.findByIdAndUpdate(req.params.id, updateData, {
  // JavaScript line (part of the program logic)
  runValidators: true,
// Close the current function/block call
});
```

- **Concept:** Update document in MongoDB.
- **Why `runValidators`:** Ensures schema rules still apply on update.

---

### Delete Product

```js
// Define a router endpoint (route handler)
router.post("/delete/:id", async (req, res) => {
  // Wait for an async operation (like DB call) to finish
  await Product.findByIdAndDelete(req.params.id);
  // Execute this statement
  res.redirect("/admin?success=...");
// Close the current function/block call
});
```

- **Concept:** Delete record.
- **Why:** Remove product from DB.

---

## 🧩 Views (EJS)

- `views/admin/dashboard.ejs` — product table, stats cards, delete modal
- `views/admin/add.ejs` — form with `enctype="multipart/form-data"` (required for file upload)
- `views/admin/edit.ejs` — pre-filled form + optional new image upload
- `views/admin/partials/sidebar.ejs` — reusable admin navigation

**Key EJS syntax for viva:**

- `<%= value %>` outputs data safely
- `<% if (...) { %>` runs logic
- `<% array.forEach(...) { %>` loops

---

## 🚨 Common Issues

- **Upload folder mismatch**
  - Code uploads to `public/uploads`, but this repo has an `uploads/` folder at the project root.
  - If `public/uploads` does not exist, Multer may throw an error.
  - Fix: create `public/uploads/` or change destination to the existing `uploads/` and then serve it.

---

## 🧪 Viva Questions

- **Q:** Why do we need `enctype="multipart/form-data"` on the Add/Edit forms?
  - **Ideal A:** Because file uploads require multipart encoding; otherwise `req.file` will be empty.
- **Q:** What is Multer?
  - **Ideal A:** A middleware for handling `multipart/form-data`, mainly used for file uploads in Express.
- **Q:** Why do we redirect after POST (PRG pattern)?
  - **Ideal A:** To avoid duplicate form submissions when the user refreshes after a POST.

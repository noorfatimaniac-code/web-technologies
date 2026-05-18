# 🔐 Lab Assignment 03 — Login/Register + Sessions + Admin Protection (Express/Mongo/EJS) — Viva Study Guide

## ✅ Project Overview (Beginner Level)

This project is an e-commerce-style website that adds **authentication** (login/register) on top of the catalog.

### 🧠 What new things were added vs earlier assignments?

- Users can **register** and **login** 👤
- Passwords are **hashed** (not stored as plain text) 🔒
- Login state is stored in a **session** 🍪
- Some routes are **protected**:
  - `/checkout` requires login
  - `/admin` requires admin role
- Flash messages show success/error feedback ✅❌

---

## 📚 Table of Contents

- [📁 Folder Structure](#-folder-structure)
- [⚙️ Setup & Run](#️-setup--run)
- [🧠 File: server.js](#-file-serverjs)
- [🧱 Middleware: middleware/auth.js](#-middleware-middlewareauthjs)
- [👤 Model: models/User.js](#-model-modelsuserjs)
- [🛣️ Routes: routes/auth.js](#️-routes-routesauthjs)
- [🛡️ Routes: routes/admin.js](#️-routes-routesadminjs)
- [🛍️ Routes: routes/products.js + Product model](#️-routes-routesproductsjs--product-model)
- [🧩 Views (EJS)](#-views-ejs)
- [🧪 Viva Questions](#-viva-questions)

---

## 📁 Folder Structure

- `server.js` — app setup, sessions, flash, routes
- `middleware/auth.js` — route guards: `isLoggedIn`, `isAdmin`
- `models/User.js` — user schema + password hashing
- `routes/auth.js` — register/login/logout
- `routes/admin.js` — admin CRUD (protected)
- `routes/products.js` — product catalog
- `views/auth/*` — login/register pages
- `views/partials/flash.ejs` — success/error popups

---

## ⚙️ Setup & Run

```bash
# Install dependencies for this project
npm install
# Run a Node.js script file
node seed.js   # optional (seed products)
# Start the development server
npm run dev
```

---

## 🧠 File: server.js

### ✅ Concept

This file wires everything together:

- Express
- MongoDB
- sessions
- flash messages
- routes

### 📌 Key code and explanations

```js
// Register Express middleware or mount a router
app.use(
  // JavaScript line (part of the program logic)
  session({
    // JavaScript line (part of the program logic)
    secret: process.env.SESSION_SECRET || "jewellery_super_secret",
    // JavaScript line (part of the program logic)
    resave: false,
    // JavaScript line (part of the program logic)
    saveUninitialized: false,
    // JavaScript line (part of the program logic)
    store: MongoStore.create({ mongoUrl: MONGO_URI }),
    // JavaScript line (part of the program logic)
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
  // JavaScript line (part of the program logic)
  }),
// Close the current function/block call
);
```

- **Concept:** Sessions store “who is logged in” on the server.
- **Why here:** HTTP is stateless by default; sessions add memory.
- **Syntax breakdown:**
  - `secret` signs the session cookie (prevents tampering)
  - `store` saves sessions in MongoDB (persistent)
  - `cookie.maxAge` = session expiration
- **Analogy:** A wristband at an event that proves you’re allowed in.
- **If removed:** Users would get logged out every request, and `req.session.user` wouldn’t exist.

```js
// Register Express middleware or mount a router
app.use((req, res, next) => {
  // Execute this statement
  res.locals.currentUser = req.session.user || null;
  // Execute this statement
  res.locals.success = req.flash("success");
  // Execute this statement
  res.locals.error = req.flash("error");
  // Execute this statement
  next();
// Close the current function/block call
});
```

- **Concept:** `res.locals` = variables available in all EJS views.
- **Why:** Header can show “LOGIN/REGISTER” or “Hi, name” without passing data manually each time.

```js
// Define an Express GET route handler
app.get("/checkout", isLoggedIn, (req, res) => {
  // Render an EJS view template as HTML response
  res.render("checkout");
// Close the current function/block call
});
```

- **Concept:** Route protection with middleware.
- **Why:** Only logged-in users can checkout.

---

## 🧱 Middleware: middleware/auth.js

### ✅ Concept

Middleware = a function that runs **before** a route handler.

### 📌 Code

```js
// JavaScript line (part of the program logic)
isLoggedIn: (req, res, next) => {
  // Check a condition and run code only if true
  if (req.session && req.session.user) return next();
  // Execute this statement
  req.flash("error", "You must be logged in to do that.");
  // Execute this statement
  res.redirect("/auth/login");
// Execute this statement
};
```

- **Why used here:** To block access when user is not logged in.
- **Analogy:** A security guard checking your ID.

```js
// JavaScript line (part of the program logic)
isAdmin: (req, res, next) => {
  // Check a condition and run code only if true
  if (req.session.user.role === "admin") return next();
  // Execute this statement
  req.flash("error", "Access Denied...");
  // Execute this statement
  res.redirect("/");
// Execute this statement
};
```

- **Why:** Admin pages should not be visible to normal customers.

**If removed:** Any user could open `/admin` and manage products.

---

## 👤 Model: models/User.js

### ✅ Concept

A Mongoose schema/model for users.

### 🔒 Password hashing (very important for viva)

```js
// JavaScript line (part of the program logic)
userSchema.pre("save", async function (next) {
  // Check a condition and run code only if true
  if (!this.isModified("password")) return next();
  // Declare constant salt
  const salt = await bcrypt.genSalt(10);
  // Execute this statement
  this.password = await bcrypt.hash(this.password, salt);
  // Execute this statement
  next();
// Close the current function/block call
});
```

- **Concept:** “Pre-save hook” runs automatically before saving to DB.
- **Why:** Never store real passwords.
- **Analogy:** Locking a message in a safe before storing it.
- **If removed:** Passwords stored as plain text → huge security risk.

### ✅ Login compare

```js
// JavaScript line (part of the program logic)
userSchema.methods.comparePassword = async function (candidatePassword) {
  // Execute this statement
  return await bcrypt.compare(candidatePassword, this.password);
// Execute this statement
};
```

- **Concept:** Compare plaintext input with hashed password.

---

## 🛣️ Routes: routes/auth.js

### Register flow (POST /auth/register)

- Validate fields
- Check if email already exists
- Create user (triggers pre-save hook → hashes password)
- Set session: `req.session.user = { ... }`
- Redirect to home

### Login flow (POST /auth/login)

- Find user by email
- Compare password using `comparePassword`
- Set session user
- Redirect admin → `/admin`, customer → `/`

### Logout (GET /auth/logout)

- Destroys session

**If removed:** No authentication; `req.session.user` never gets set.

---

## 🛡️ Routes: routes/admin.js

### ✅ Concept

Admin routes are protected at the top:

```js
// Execute this statement
router.use(isAdmin);
```

- **Why:** Every route below becomes admin-only.
- **Analogy:** A locked door before the admin office.

Admin CRUD uses Multer for image uploads (same idea as Assignment 04).

---

## 🛍️ Routes: routes/products.js + Product model

This is the same catalog logic: filters + pagination using query params.

---

## 🧩 Views (EJS)

- `views/auth/login.ejs` and `views/auth/register.ejs`
  - Forms submit to `/auth/login` and `/auth/register`
- `views/partials/flash.ejs`
  - Shows `success` or `error` messages and auto-dismisses after 4 seconds
- `views/partials/header.ejs`
  - Uses `currentUser` to show different UI:
    - logged out → LOGIN/REGISTER
    - logged in → greeting + logout
    - admin → ADMIN link

---

## 🧪 Viva Questions

- **Q:** Why do we hash passwords?
  - **Ideal A:** If the database leaks, attackers can’t read real passwords.
- **Q:** What is a session and how is it different from a JWT?
  - **Ideal A:** Session stores login state on the server (cookie holds session id). JWT stores authentication data in a signed token usually stored client-side.
- **Q:** Why use `res.locals`?
  - **Ideal A:** To make values available in all templates without passing them manually.
- **Q:** What does `router.use(isAdmin)` do?
  - **Ideal A:** It applies the `isAdmin` middleware to every admin route in that router.

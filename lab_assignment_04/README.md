# 🪪 Lab Assignment 04 — Sessions + JWT API (Express/Mongo/EJS) — Viva Study Guide

## ✅ Project Overview (Beginner Level)

This project has **two ways to interact** with the same backend:

1. **Website (EJS pages)** 🌐

- Uses **sessions** (`express-session`) to remember who is logged in.
- Routes like `/checkout` and `/admin` are protected with session-based middleware.

2. **REST API (JSON endpoints)** 🔌

- Lives under `/api/v1/...`
- Uses **JWT tokens** (JSON Web Tokens) for authentication.
- The client sends a token in an HTTP header: `Authorization: Bearer <token>`

---

## 📚 Table of Contents

- [📁 Folder Structure](#-folder-structure)
- [⚙️ Setup & Run](#️-setup--run)
- [🧠 File: server.js](#-file-serverjs)
- [🪪 Middleware: middleware/verifyToken.js](#-middleware-middlewareverifytokenjs)
- [🧾 Model: models/Order.js](#-model-modelsorderjs)
- [🔌 API Routes: routes/api.js](#-api-routes-routesapijs)
  - [POST /api/v1/auth/login](#post-apiv1authlogin)
  - [GET /api/v1/products](#get-apiv1products)
  - [GET /api/v1/user/profile (protected)](#get-apiv1userprofile-protected)
  - [POST /api/v1/orders (protected)](#post-apiv1orders-protected)
- [🧪 Viva Questions](#-viva-questions)

---

## 📁 Folder Structure

- `server.js` — website + API router wiring
- `routes/api.js` — REST API endpoints (JSON)
- `middleware/verifyToken.js` — JWT verification + admin check helper
- `models/Order.js` — order schema
- `routes/auth.js` — website login/register (sessions)

---

## ⚙️ Setup & Run

```bash
# Install project dependencies listed in package.json
npm install
# Start the development server (runs the `dev` script)
npm run dev
```

---

## 🧠 File: server.js

### ✅ Concept

This file sets up both:

- EJS pages (session-based)
- API routes (token-based)

Important line:

```js
// Mount all API routes under the versioned prefix `/api/v1`
// Register Express middleware or mount a router
app.use("/api/v1", apiRouter);
```

- **Concept:** Mount API under a versioned prefix.
- **Why:** Versioning lets you later introduce `/api/v2` without breaking old clients.

---

## 🪪 Middleware: middleware/verifyToken.js

### ✅ What is a JWT?

A JWT is a signed token that contains user info (payload).

- The server **signs** it using a secret key.
- Later the server can **verify** it to trust the payload.

### 📌 verifyToken logic

```js
// Read the Authorization header sent by the client
// Declare constant authHeader
const authHeader = req.headers["authorization"];
// If there is no header (or it doesn't start with `Bearer `), deny access
// Check a condition and run code only if true
if (!authHeader || !authHeader.startsWith("Bearer ")) {
  // Return JSON with HTTP 401 (not authenticated)
  // Return early after sending a response
  return res.status(401).json({ message: "No token provided" });
// End of a code block
}
// Extract the token part after the word `Bearer`
// Declare constant token
const token = authHeader.split(" ")[1];
// Verify the token signature + expiry using the secret key
// Declare constant decoded
const decoded = jwt.verify(token, JWT_SECRET);
// Store decoded payload on req.user so next handlers can use it
// Execute this statement
req.user = decoded;
// Continue to the protected route handler
// Execute this statement
next();
```

- **Concept:** Read token from HTTP header.
- **Why:** Tokens should not be sent in URL query strings.
- **Analogy:** Show your entry pass at the gate.
- **If removed:** Protected API endpoints become public.

### ✅ requireAdmin

```js
// If the token payload says the user is an admin, allow the request
if (req.user && req.user.role === "admin") return next();
// Otherwise block with HTTP 403 (authenticated but not allowed)
return res.status(403).json({ message: "Admins only" });
```

- **Concept:** Authorization (role check) after authentication.

---

## 🧾 Model: models/Order.js

### ✅ Concept

Orders contain:

- a `user` id
- an array of `items`
- `totalAmount`
- `status`

Key concept: **subdocument schema**

```js
// Define a sub-schema for a single order item (one product in the cart)
// Declare constant orderItemSchema
const orderItemSchema = new mongoose.Schema({ ... });
```

- **Why:** Each order contains many items, each with product/price/quantity.

---

## 🔌 API Routes: routes/api.js

### POST /api/v1/auth/login

- **Concept:** Authenticate user and return JWT.
- **Why:** API clients need a token to call protected endpoints.

Token creation:

```js
// Create a signed JWT token containing the user's id, role, and name
// Declare constant token
const token = jwt.sign(
  // Payload: data that will be encoded inside the token
  // JavaScript line (part of the program logic)
  { user_id: user._id, role: user.role, name: user.name },
  // Secret key used to sign/verify the token
  // JavaScript line (part of the program logic)
  JWT_SECRET,
  // Token options (here: expires after 1 hour)
  // JavaScript line (part of the program logic)
  { expiresIn: "1h" },
// Close the current function/block call
);
```

- **Concept:** Signed token with expiry.
- **If removed:** You can’t securely authenticate API requests.

### GET /api/v1/products

- **Concept:** Public endpoint returning JSON.
- **Why:** A mobile app could show the product list without server-rendered EJS.
- Supports filtering with query params similar to earlier assignments.

### GET /api/v1/user/profile (protected)

- **Concept:** Requires valid JWT.
- **Why:** Only the logged-in user should see their profile.
- Uses `select('-password')` to exclude password field.

### POST /api/v1/orders (protected)

- **Concept:** Place an order (create new Order document).
- **Why:** Demonstrates a real “transaction-like” feature.

Important logic:

- Validate items array
- Confirm products exist
- Check stock is sufficient
- Compute total using `reduce`

---

## 🧪 Try the API (example)

### 1) Login to get token

```bash
# Send a login request to the API and receive a JWT token
curl -X POST http://localhost:3000/api/v1/auth/login \
  # Tell the server we're sending JSON
  -H "Content-Type: application/json" \
  # JSON body containing email + password
  -d "{\"email\":\"admin@example.com\",\"password\":\"123456\"}"
```

### 2) Call protected profile

```bash
# Call the protected profile endpoint
curl http://localhost:3000/api/v1/user/profile \
  # Include the JWT token in the Authorization header
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🧪 Viva Questions

- **Q:** What is the difference between authentication and authorization?
  - **Ideal A:** Authentication verifies who you are (login). Authorization checks what you’re allowed to do (admin role).
- **Q:** Sessions vs JWT — what’s the difference?
  - **Ideal A:** Sessions store login state on the server and use a session-id cookie. JWT stores auth info inside a signed token sent by client on every request.
- **Q:** Why do we return `401` vs `403`?
  - **Ideal A:** `401` means not authenticated (missing/invalid token). `403` means authenticated but not allowed (no permission).

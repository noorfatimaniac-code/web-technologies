const express = require("express");
const app = express();

// set EJS as view engine
app.set("view engine", "ejs");

// serve static files
app.use(express.static("public"));

// routes
app.get("/", (req, res) => {
  res.render("homepage");
});

app.get("/contact-us", (req, res) => {
  res.render("contact-us");
});

app.get("/hobbies", (req, res) => {
  res.render("hobbies");
});

// start server
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const userRoutes = require("./routes/user");
const sauceRoutes = require("./routes/sauce");
const path = require("path");
require("dotenv").config();

// Connexion à Mongo - Base locale (localhost)
mongoose.connect(process.env.DBURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("connecté à Mongoose");
});

// contrôles d'accès CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

// parser json
app.use(express.json());

// configuration du chemin d'accès au dossier /images
app.use("/images", express.static(path.join(__dirname, "images")));

// routes d'authentification
app.use("/api/auth", userRoutes);

//routes d'accès aux sauces
app.use("/api/sauces", sauceRoutes);

module.exports = app;

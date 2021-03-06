const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const passwordValidator = require("password-validator");

/**
 * traitement de la creation d'un utilisateur
 */
exports.signup = (req, res) => {
  //verification de format d'email valide
  const emailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(
    String(req.body.email).toLowerCase()
  );
  //verification du mot de passe non vide - ici à 1 char minimum mais à augmenter pour plus de sécurité (message explicatif à gerer niveau front-end)
  const schema = new passwordValidator();
  schema.is().min(1);

  if (emailformat && schema.validate(req.body.password)) {
    bcrypt
      .hash(req.body.password, 10)
      .then((hash) => {
        const user = new User({
          email: req.body.email,
          password: hash,
        });
        user
          .save()
          .then(() => res.status(201).json({ message: "User created" }))
          .catch((error) => res.status(400).json({ error }));
      })
      .catch((error) => res.status(500).json({ error }));
  } else {
    return res.status(400).json({ error: "invalid email or empty password" });
  }
};

/**
 * gestion du login
 */
exports.login = (req, res) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res
              .status(401)
              .json({ error: { message: "Incorrect password" } });
          }
          res.status(200).json({
            userId: user._id,
            token: jwt.sign(
              { userId: user._id },
              process.env.APP_SECRET || "defaultSecret",
              {
                expiresIn: "24h",
              }
            ),
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

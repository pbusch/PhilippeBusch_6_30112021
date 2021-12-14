const Sauce = require("../models/sauce");
module.exports = (req, res, next) => {
  // on verifie que l'utilisateur identifié via le token est bien le propriétaire de la sauce qu'il veut modifier / supprimer
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId === req.token.userId) {
        next();
      } else {
        res.status(401).json({ error: "Wrong user" });
      }
    })
    .catch((error) => res.status(500).json({ error }));
};

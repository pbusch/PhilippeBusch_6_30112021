const Sauce = require("../models/sauce");

module.exports = (req, res, next) => {
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

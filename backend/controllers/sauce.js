const fs = require("fs");
const Sauce = require("../models/sauce");

// creation d'une sauce (post)
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
    // on initialise les likes/dislikes usersLiked/UsersDisliked à zéro et l'userId à celui de l'utilisateur authentifié
    //ceci afin d'éviter des entrées invalides via Postman ou autre
    userId: req.token.userId,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: [],
  });
  sauce
    .save()
    .then(() => res.status(201).json({ message: "Sauce saved" }))
    .catch((error) => res.status(400).json({ error }));
};

// Modification d'une sauce spécifique (via son id) - PUT
exports.modifySauce = (req, res, next) => {
  const imageChanged = false;
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };

  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      Sauce.updateOne(
        { _id: req.params.id },
        {
          ...sauceObject,
          _id: req.params.id,
          // on affecte le user.id du token en cours et non un "fake" id potentiellement envoyé à l'API
          userId: req.token.userId,
          // on garde bien les likes, dislikes et leur tableaux d'utilisateurs d'origine et non d'autres valeurs "fake" potentiellement envoyées à l'API
          likes: sauce.likes,
          dislikes: sauce.dislikes,
          usersLiked: sauce.usersLiked,
          usersDisliked: sauce.usersDisliked,
        }
      )
        .then(() => res.status(200).json({ message: "sauce modified" }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

// Suppression d'une sauve spécifique via son id - DELETE
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      const filename = sauce.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: "Sauce deleted" }))
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch((error) => res.status(500).json({ error }));
};

// Consultation de toutes les sauces - GET
exports.getAllSauce = (req, res, next) => {
  Sauce.find()
    .then((sauce) => {
      res.status(200).json(sauce);
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};

// Consultation d'une sauce spécifique (via son id) - GET
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({
    _id: req.params.id,
  })
    .then((sauce) => {
      sauce.likes = sauce.usersLiked.length;
      res.status(200).json(sauce);
    })
    .catch((error) => {
      res.status(404).json({
        error: error,
      });
    });
};

// Gestion des likes / dislikes
exports.likeSauce = (req, res, next) => {
  const userId = req.body.userId;
  const like = req.body.like;

  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      //on cherche si l'utilisateur connecté a déjà like / dislike la sauce consultée
      const likeIndex = sauce.usersLiked.indexOf(userId);
      const dislikeIndex = sauce.usersDisliked.indexOf(userId);
      //En fonction de la recherche on crée les boolean liked et disliked
      const liked = likeIndex !== -1;
      const disliked = dislikeIndex !== -1;

      // gestion des trois cas possibles : 1 (like) - 0 (annulation de like / dislike) -1 dislike
      switch (like) {
        case 1:
          if (disliked) {
            throw new Error("Already disliked");
          }
          if (liked) {
            throw new Error("Already liked");
          }

          // si la sauce n'est pas 'disliked' ou déjà 'liked' on ajoute l'utilisateur au tableau usersLiked
          sauce.usersLiked.push(userId);

          break;

        case 0:
          if (liked) {
            // supression de l'utilisateur du tableau users.liked via son index
            sauce.usersLiked.splice(likeIndex, 1);
          } else if (disliked) {
            // supression de l'utilisateur du tableau users.disliked via son index
            sauce.usersDisliked.splice(dislikeIndex, 1);
          }
          break;

        case -1:
          if (liked) {
            throw new Error("Already liked");
          }

          if (disliked) {
            throw new Error("Already disliked");
          }
          // si la sauce n'est pas 'liked' ou déjà 'disliked' on ajoute l'utilisateur au tableau usersDisliked
          sauce.usersDisliked.push(userId);
      }

      //recalcul du nombre de like/dislike en fonction des tableau usersLiked et usersDisliked
      //cela assure une cohérence permanente du nombre de like dislike avec ces deux tableaux
      sauce.likes = sauce.usersLiked.length;
      sauce.dislikes = sauce.usersDisliked.length;

      sauce
        .save()
        .then(() => res.status(201).json({ message: "Liked / Disliked sent" }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error: error.message }));
};

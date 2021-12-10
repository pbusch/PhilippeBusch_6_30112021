const fs = require("fs");
const Sauce = require("../models/sauce");

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;

  //Sauce.find({ 'name': sauceObject.name }, 'name', function (err, doublon) {
  //    if (err) return handleError(err);
  //    if (doublon.length > 0) {
  //        console.log(doublon);
  //       res.status(401).json({ error: "Sauce name alreay exists !" });
  //    }
  //});

  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
    userId: req.token.userId,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: [],
  });
  const user = sauce.userId;
  if (user === req.token.userId) {
    sauce
      .save()
      .then(() => res.status(201).json({ message: "Sauce saved" }))
      .catch((error) => res.status(400).json({ error }));
  } else {
    res.status(401).json({ error: "Wrong user" });
  }
};

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
          likes: sauce.likes,
          dislikes: sauce.dislikes,
        }
      )
        .then(() => res.status(200).json({ message: "sauce modified" }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

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

exports.likeSauce = (req, res, next) => {
  const userId = req.body.userId;
  const like = req.body.like;

  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      //         let liked = sauce.usersLiked.find(id => id === userId);
      //         console.log(liked);
      //         let disliked = sauce.usersDisliked.find(id => id === userId);
      //         console.log(disliked);

      //         switch (like) {
      //             case 1:
      //                 if (!liked) {
      //                     sauce.likes = sauce.usersLiked.length + 1;
      //                     sauce.usersLiked.push(userId);
      //                 } else {
      //                     throw new Error('Already liked');
      //                 }
      //                 if (disliked) {
      //                     throw new Error('Already disliked');
      //                 }
      //                 break;

      //             case 0:
      //                 if (liked) {
      //                     sauce.usersLiked = sauce.usersLiked.filter(id => id !== userId);
      //                     sauce.likes = sauce.usersLiked.length;
      //                 }
      //                 else if (disliked) {
      //                         sauce.dislikes = sauce.usersDisliked.length - 1;
      //                         sauce.usersDisliked = sauce.usersDisliked.filter(id => id !== userId);

      //                 }
      //                 break;

      //             case -1:

      //                 if (!disliked) {
      //                     sauce.dislikes = sauce.usersDisliked.length + 1;
      //                     sauce.usersDisliked.push(userId);
      //                 } else {
      //                     throw new Error('Already disliked');
      //                 }
      //                 if (liked) {
      //                     throw new Error('Already liked');
      //                 }
      //         }

      const likeIndex = sauce.usersLiked.indexOf(userId);

      let dislikeIndex = sauce.usersDisliked.indexOf(userId);

      const liked = likeIndex !== -1;
      const disliked = dislikeIndex !== -1;

      switch (like) {
        case 1:
          if (disliked) {
            throw new Error("Already disliked");
          }
          if (liked) {
            throw new Error("Already liked");
          }

          sauce.usersLiked.push(userId);

          break;

        case 0:
          if (liked) {
            sauce.usersLiked.splice(likeIndex, 1);
          } else if (disliked) {
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
          sauce.usersDisliked.push(userId);
      }

      sauce.likes = sauce.usersLiked.length;
      sauce.dislikes = sauce.usersDisliked.length;

      sauce
        .save()
        .then(() => res.status(201).json({ message: "Liked / Disliked sent" }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error: error.message }));
};

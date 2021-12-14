const express = require("express");
const router = express.Router();

//Authentification
const auth = require("../middleware/auth");
//Traitement des images
const multer = require("../middleware/multer-config");
//Manipulation des sauces (lecture, création, modification, suppression, gestion des likes/dislikes)
const sauceCtrl = require("../controllers/sauce");
//Verification de la propriété d'une sauce
const isOwner = require("../middleware/isOwner");

router.use("/", auth); // auth appliqué à toutes les routes
router.get("/", sauceCtrl.getAllSauce);
router.post("/", multer, sauceCtrl.createSauce);
router.get("/:id", sauceCtrl.getOneSauce);
router.put("/:id", isOwner, multer, sauceCtrl.modifySauce);
router.delete("/:id", isOwner, sauceCtrl.deleteSauce);
router.post("/:id/like", sauceCtrl.likeSauce);

module.exports = router;

const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");
const sauceCtrl = require("../controllers/sauce");
const isOwner = require("../middleware/isOwner");

router.use("/", auth); // auth appliqué à toutes les routes
router.get("/", sauceCtrl.getAllSauce);
router.post("/", multer, sauceCtrl.createSauce);
router.get("/:id", sauceCtrl.getOneSauce);
router.put("/:id", isOwner, multer, sauceCtrl.modifySauce);
router.delete("/:id", isOwner, sauceCtrl.deleteSauce);
router.post("/:id/like", sauceCtrl.likeSauce);

module.exports = router;

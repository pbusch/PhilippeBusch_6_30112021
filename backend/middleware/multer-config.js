const multer = require("multer");
const path = require("path");

// extensions de fichiers disponibles pour le nom de fichier
const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
};

// configuration de mutler pour l'enregistrement de fichiers dans le FileSystem local
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "images");
  },
  filename: (req, file, callback) => {
    const name = path.parse(file.originalname.split(" ").join("_")).name;

    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + "_" + Date.now() + "." + extension);
  },
});

module.exports = multer({ storage: storage }).single("image");

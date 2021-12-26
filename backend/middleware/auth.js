const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  // on ne fait pas de vérification sur la méthode "OPTIONS" afin de ne pas bloquer les navigateurs
  if (req.method !== "OPTIONS") {
    try {
      // on récupère le token dans le header ("Authorisation") - on sépare la chaine "bearer" du token lui-même
      const token = req.headers.authorization.split(" ")[1];
      // on décode le token avec la chaine définie dans .env et on le vérifie
      req.token = jwt.verify(token, process.env.APP_SECRET || "defaultSecret");
      next();
    } catch {
      res.status(401).json({
        error: new Error("Invalid request!"),
      });
    }
  } else {
    next();
  }
};

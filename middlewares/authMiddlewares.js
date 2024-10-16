require('dotenv').config();
const jwt = require('jsonwebtoken');

const authMiddlewares = {
  verifyToken: (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
      console.log("aucun token");
      return res.status(403).json({ message: 'Pas de token fourni' });
    }

    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
      if (err) {
        console.log("token invalid")
        return res.status(500).json({ message: 'Echec de l’authentification du token' });
      }
      req.user = decoded;
      next();
    });
  }
}

module.exports = authMiddlewares;
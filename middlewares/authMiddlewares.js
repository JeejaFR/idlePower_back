require('dotenv').config();
const jwt = require('jsonwebtoken');

const authMiddlewares = {
  verifyToken: (req, res, next) => {
    const token = req.headers['authorization'] ?? req.body.token;
    if (!token) {
      console.log("aucun token");
      return res.status(403).json({ message: 'Pas de token fourni' });
    }

    const actualToken = token.startsWith('Bearer ') ? token.slice(7, token.length) : token;

    jwt.verify(actualToken, process.env.SECRET_KEY, (err, decoded) => {
      if (err) {
        console.log("token invalid: ");
        return res.status(401).json({ message: 'Token invalid' });
      }
      req.user = decoded;
      next();
    });
  }
}

module.exports = authMiddlewares;
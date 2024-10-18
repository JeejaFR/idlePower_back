var express = require('express');
var router = express.Router();
const terrainController = require('../controllers/terrainController');
const authMiddleware = require('../middlewares/authMiddlewares');

router.get('/', authMiddleware.verifyToken, terrainController.getTerrain);

router.post('/building', authMiddleware.verifyToken, terrainController.placeBatiment);

module.exports = router;
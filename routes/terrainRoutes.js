var express = require('express');
var router = express.Router();
const terrainController = require('../controllers/terrainController');
const authMiddleware = require('../middlewares/authMiddlewares');
const syncMiddleware = require('../middlewares/syncMiddleware');


router.get('/', authMiddleware.verifyToken, terrainController.getTerrain);

router.post('/building', authMiddleware.verifyToken, syncMiddleware.synchronizeBanks, terrainController.placeBatiment);

module.exports = router;
var express = require('express');
var router = express.Router();
const terrainController = require('../controllers/terrainController');
const authMiddleware = require('../middlewares/authMiddlewares');

router.get('/generate', authMiddleware.verifyToken, terrainController.generate);

module.exports = router;
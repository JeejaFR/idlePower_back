var express = require('express');
var router = express.Router();
const batimentController = require('../controllers/batimentController');
const authMiddleware = require('../middlewares/authMiddlewares');

router.get('/', authMiddleware.verifyToken, batimentController.getAllBatiments);

module.exports = router;
var express = require('express');
var router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddlewares');
const syncMiddleware = require('../middlewares/syncMiddleware');

router.post('/login', authController.login);

router.post('/register', authController.register);

router.post('/quit', authMiddleware.verifyToken, syncMiddleware.synchronizeBanks);

router.get('/id', authController.getUserId);

module.exports = router;
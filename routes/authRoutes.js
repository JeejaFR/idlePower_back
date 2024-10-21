var express = require('express');
var router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddlewares');
const syncMiddleware = require('../middlewares/syncMiddleware');

router.post('/login', authController.login);

router.post('/register', authController.register);

router.post('/sync', authMiddleware.verifyToken, syncMiddleware.synchronizeBanks, (req, res) => {
    res.status(200).send("synchronized");
});

router.get('/id', authController.getUserId);

module.exports = router;
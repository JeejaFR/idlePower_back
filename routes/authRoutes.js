var express = require('express');
var router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);

router.post('/register', authController.register);

router.get('/id', authController.getUserId);

module.exports = router;
const express = require('express');
const { register, login, getMe, logout } = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/logout', logout);

module.exports = router;

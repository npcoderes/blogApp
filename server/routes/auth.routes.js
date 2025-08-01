const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const authController = require('../controllers/auth/auth.controller');

router.post('/register', upload.single('profilePicture'), authController.register);
router.post('/login', authController.login);

module.exports = router;

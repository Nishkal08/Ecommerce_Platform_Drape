const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { register, login, getMe, logout, updateProfile, addAddress, deleteAddress } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], validate, register);

router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
], validate, login);

router.get('/me', authMiddleware, getMe);
router.post('/logout', logout);

router.put('/profile', authMiddleware, updateProfile);
router.post('/addresses', authMiddleware, addAddress);
router.delete('/addresses/:addressId', authMiddleware, deleteAddress);

module.exports = router;

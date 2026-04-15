const express = require('express');
const router = express.Router();
const { sendContactMessage } = require('../controllers/contactController');
const { body } = require('express-validator');
const validate = require('../middleware/validate');

router.post(
  '/send',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('message').notEmpty().withMessage('Message is required'),
  ],
  validate,
  sendContactMessage
);

module.exports = router;

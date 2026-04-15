const express = require('express');
const { getCart, addItem, updateItem, removeItem, clearCart } = require('../controllers/cartController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getCart);
router.post('/', addItem);
router.put('/:itemId', updateItem);
router.delete('/:itemId', removeItem);
router.delete('/', clearCart);

module.exports = router;

const express = require('express');
const {
  createOrder, verifyPayment, getMyOrders, getOrderById, getAllOrders, updateOrderStatus
} = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/', createOrder);
router.post('/verify', verifyPayment);
router.get('/my-orders', getMyOrders);
router.get('/:id', getOrderById);

// Admin only
router.get('/', adminMiddleware, getAllOrders);
router.put('/:id/status', adminMiddleware, updateOrderStatus);

module.exports = router;

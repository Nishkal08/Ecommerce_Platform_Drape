const express = require('express');
const { addReview, getProductReviews, deleteReview } = require('../controllers/reviewController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/:productId', getProductReviews);
router.post('/:productId', authMiddleware, addReview);
router.delete('/:id', authMiddleware, deleteReview);

module.exports = router;

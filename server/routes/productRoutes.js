const express = require('express');
const {
  getProducts, getProductBySlug, createProduct, updateProduct, deleteProduct, getFeaturedProducts
} = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

router.get('/featured', getFeaturedProducts);
router.get('/', getProducts);
router.get('/:slug', getProductBySlug);
router.post('/', authMiddleware, adminMiddleware, createProduct);
router.put('/:id', authMiddleware, adminMiddleware, updateProduct);
router.delete('/:id', authMiddleware, adminMiddleware, deleteProduct);

module.exports = router;

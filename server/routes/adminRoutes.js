const express = require('express');
const { getDashboard, getUsers } = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.get('/dashboard', getDashboard);
router.get('/users', getUsers);

module.exports = router;

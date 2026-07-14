const express = require('express');
const { getDashboard, getUsers, getChartData } = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.get('/chart-data', getChartData);

module.exports = router;

const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const sendResponse = require('../utils/sendResponse');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
exports.getDashboard = async (req, res, next) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();

    // Revenue from paid orders
    const revenueResult = await Order.aggregate([
      { $match: { status: { $nin: ['cancelled', 'pending'] } } },
      { $group: { _id: null, totalRevenue: { $sum: '$total' } } },
    ]);
    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    // Recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email');

    // Low stock products
    const lowStockProducts = await Product.find({ stock: { $lte: 5 } })
      .sort({ stock: 1 })
      .limit(10);

    // Orders by status
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    sendResponse(res, 200, true, {
      totalOrders,
      totalUsers,
      totalProducts,
      totalRevenue,
      recentOrders,
      lowStockProducts,
      ordersByStatus,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (admin)
// @route   GET /api/admin/users
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    sendResponse(res, 200, true, users);
  } catch (error) {
    next(error);
  }
};

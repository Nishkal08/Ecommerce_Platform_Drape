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

// @desc    Get chart data for dashboard (revenue + order count over time)
// @route   GET /api/admin/chart-data?period=7d|30d|12m
exports.getChartData = async (req, res, next) => {
  try {
    const period = req.query.period || '7d';
    let startDate, groupFormat;

    const now = new Date();

    if (period === '12m') {
      startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
      // Group by year-month
      groupFormat = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
    } else {
      const days = period === '30d' ? 30 : 7;
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - days);
      startDate.setHours(0, 0, 0, 0);
      // Group by year-month-day
      groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
    }

    const pipeline = [
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: groupFormat,
          revenue: {
            $sum: {
              $cond: [
                { $not: [{ $in: ['$status', ['cancelled', 'pending']] }] },
                '$total',
                0,
              ],
            },
          },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: '$_id',
          revenue: 1,
          orders: 1,
        },
      },
    ];

    const chartData = await Order.aggregate(pipeline);

    // Fill missing dates/months with zeros so the chart is continuous
    const filled = [];

    if (period === '12m') {
      for (let i = 0; i < 12; i++) {
        const d = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const existing = chartData.find((c) => c.date === key);
        filled.push({
          date: key,
          label: d.toLocaleString('en-IN', { month: 'short', year: '2-digit' }),
          revenue: existing?.revenue || 0,
          orders: existing?.orders || 0,
        });
      }
    } else {
      const days = period === '30d' ? 30 : 7;
      for (let i = 0; i <= days; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        const key = d.toISOString().split('T')[0]; // YYYY-MM-DD
        const existing = chartData.find((c) => c.date === key);
        filled.push({
          date: key,
          label: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
          revenue: existing?.revenue || 0,
          orders: existing?.orders || 0,
        });
      }
    }

    sendResponse(res, 200, true, filled);
  } catch (error) {
    next(error);
  }
};

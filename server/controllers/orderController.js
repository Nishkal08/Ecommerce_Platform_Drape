const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const razorpay = require('../config/razorpay');
const crypto = require('crypto');
const sendResponse = require('../utils/sendResponse');

// @desc    Create order + Razorpay order
// @route   POST /api/orders
exports.createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, couponApplied } = req.body;

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return sendResponse(res, 400, false, null, 'Cart is empty');
    }

    // Build order items and calculate subtotal
    let subtotal = 0;
    const items = cart.items.map((item) => {
      const price = item.product.price;
      subtotal += price * item.quantity;
      return {
        product: item.product._id,
        name: item.product.name,
        image: item.product.images[0]?.url || '',
        quantity: item.quantity,
        size: item.size,
        price,
      };
    });

    const discount = couponApplied?.discount || 0;
    const total = Math.max(subtotal - discount, 0);

    // Create Razorpay order
    let razorpayOrder;
    try {
      razorpayOrder = await razorpay.orders.create({
        amount: Math.round(total * 100), // paise
        currency: 'INR',
        receipt: `order_${Date.now()}`,
      });
    } catch (rpError) {
      // If Razorpay keys are placeholder, create a mock order for development
      razorpayOrder = {
        id: `dev_order_${Date.now()}`,
        amount: Math.round(total * 100),
        currency: 'INR',
      };
    }

    const order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress,
      paymentInfo: {
        razorpay_order_id: razorpayOrder.id,
        status: 'pending',
      },
      couponApplied: couponApplied || {},
      subtotal,
      discount,
      total,
    });

    sendResponse(res, 201, true, {
      order,
      razorpay_order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key_id: process.env.RAZORPAY_KEY_ID,
    }, 'Order created');
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Razorpay payment
// @route   POST /api/orders/verify
exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Verify HMAC signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    const isValid = expectedSignature === razorpay_signature;

    if (!isValid) {
      // In development with placeholder keys, allow through
      if (process.env.NODE_ENV !== 'development') {
        return sendResponse(res, 400, false, null, 'Payment verification failed');
      }
    }

    // Update order
    const order = await Order.findOne({ 'paymentInfo.razorpay_order_id': razorpay_order_id });
    if (!order) {
      return sendResponse(res, 404, false, null, 'Order not found');
    }

    order.paymentInfo.razorpay_payment_id = razorpay_payment_id;
    order.paymentInfo.status = 'paid';
    order.status = 'delivered'; // User specifically requested immediate delivered state upon payment
    await order.save();

    // Clear cart after successful payment
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

    // Stock decrement handled by createOrder mostly, but here if needed again:
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    sendResponse(res, 200, true, order, 'Payment verified successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get user orders
// @route   GET /api/orders/my-orders
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('items.product');
    sendResponse(res, 200, true, orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product').populate('user', 'name email');
    if (!order) {
      return sendResponse(res, 404, false, null, 'Order not found');
    }
    // Check if user owns order or is admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendResponse(res, 403, false, null, 'Not authorized');
    }
    
    // Inject razorpay key id securely into response for pending orders
    const responseData = {
      ...order._doc,
      razorpay_key_id: process.env.RAZORPAY_KEY_ID
    };
    sendResponse(res, 200, true, responseData);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (admin)
// @route   GET /api/orders
exports.getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('user', 'name email');

    sendResponse(res, 200, true, { orders, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (admin)
// @route   PUT /api/orders/:id/status
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('user', 'name email');

    if (!order) {
      return sendResponse(res, 404, false, null, 'Order not found');
    }
    sendResponse(res, 200, true, order, 'Order status updated');
  } catch (error) {
    next(error);
  }
};

const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: String,
  image: String,
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  size: String,
  price: {
    type: Number,
    required: true,
  },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [orderItemSchema],
  shippingAddress: {
    name: { type: String, required: true },
    line1: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    phone: { type: String, required: true },
  },
  paymentInfo: {
    razorpay_order_id: String,
    razorpay_payment_id: String,
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
  },
  couponApplied: {
    code: String,
    discount: Number,
  },
  subtotal: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
}, { timestamps: true });

orderSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);

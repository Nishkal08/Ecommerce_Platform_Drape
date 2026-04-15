const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Coupon code is required'],
    unique: true,
    uppercase: true,
    trim: true,
  },
  discountType: {
    type: String,
    required: true,
    enum: ['percent', 'flat'],
  },
  discountValue: {
    type: Number,
    required: [true, 'Discount value is required'],
    min: 0,
  },
  minOrderValue: {
    type: Number,
    default: 0,
  },
  maxUses: {
    type: Number,
    default: 100,
  },
  usedCount: {
    type: Number,
    default: 0,
  },
  expiresAt: {
    type: Date,
    required: [true, 'Expiry date is required'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);

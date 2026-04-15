const Coupon = require('../models/Coupon');
const sendResponse = require('../utils/sendResponse');

// @desc    Validate coupon
// @route   POST /api/coupons/validate
exports.validateCoupon = async (req, res, next) => {
  try {
    const { code, orderTotal } = req.body;

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) {
      return sendResponse(res, 404, false, null, 'Invalid coupon code');
    }

    if (coupon.expiresAt < new Date()) {
      return sendResponse(res, 400, false, null, 'Coupon has expired');
    }

    if (coupon.usedCount >= coupon.maxUses) {
      return sendResponse(res, 400, false, null, 'Coupon usage limit reached');
    }

    if (orderTotal < coupon.minOrderValue) {
      return sendResponse(res, 400, false, null, `Minimum order value is ₹${coupon.minOrderValue}`);
    }

    let discount = 0;
    if (coupon.discountType === 'percent') {
      discount = Math.round((orderTotal * coupon.discountValue) / 100);
    } else {
      discount = coupon.discountValue;
    }

    sendResponse(res, 200, true, {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discount,
    }, 'Coupon applied successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Create coupon (admin)
// @route   POST /api/coupons
exports.createCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.create(req.body);
    sendResponse(res, 201, true, coupon, 'Coupon created');
  } catch (error) {
    next(error);
  }
};

// @desc    Get all coupons (admin)
// @route   GET /api/coupons
exports.getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    sendResponse(res, 200, true, coupons);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete coupon (admin)
// @route   DELETE /api/coupons/:id
exports.deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return sendResponse(res, 404, false, null, 'Coupon not found');
    }
    sendResponse(res, 200, true, null, 'Coupon deleted');
  } catch (error) {
    next(error);
  }
};

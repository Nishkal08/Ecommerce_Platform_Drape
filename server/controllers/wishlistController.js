const User = require('../models/User');
const sendResponse = require('../utils/sendResponse');

// @desc    Get user wishlist
// @route   GET /api/wishlist
exports.getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    sendResponse(res, 200, true, user.wishlist);
  } catch (error) {
    next(error);
  }
};

// @desc    Add to wishlist
// @route   POST /api/wishlist/:productId
exports.addToWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const productId = req.params.productId;

    if (user.wishlist.includes(productId)) {
      return sendResponse(res, 400, false, null, 'Product already in wishlist');
    }

    user.wishlist.push(productId);
    await user.save();
    await user.populate('wishlist');
    sendResponse(res, 200, true, user.wishlist, 'Added to wishlist');
  } catch (error) {
    next(error);
  }
};

// @desc    Remove from wishlist
// @route   DELETE /api/wishlist/:productId
exports.removeFromWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.wishlist = user.wishlist.filter(
      (id) => id.toString() !== req.params.productId
    );
    await user.save();
    await user.populate('wishlist');
    sendResponse(res, 200, true, user.wishlist, 'Removed from wishlist');
  } catch (error) {
    next(error);
  }
};

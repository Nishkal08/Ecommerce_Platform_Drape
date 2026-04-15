const Review = require('../models/Review');
const sendResponse = require('../utils/sendResponse');

// @desc    Add review
// @route   POST /api/reviews/:productId
exports.addReview = async (req, res, next) => {
  try {
    const { rating, title, body } = req.body;

    // Check for existing review
    const existingReview = await Review.findOne({
      product: req.params.productId,
      user: req.user._id,
    });
    if (existingReview) {
      return sendResponse(res, 400, false, null, 'You have already reviewed this product');
    }

    const review = await Review.create({
      product: req.params.productId,
      user: req.user._id,
      rating,
      title,
      body,
    });

    await review.populate('user', 'name');

    sendResponse(res, 201, true, review, 'Review added successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get product reviews
// @route   GET /api/reviews/:productId
exports.getProductReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    sendResponse(res, 200, true, reviews);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return sendResponse(res, 404, false, null, 'Review not found');
    }

    // Allow owner or admin to delete
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendResponse(res, 403, false, null, 'Not authorized');
    }

    await Review.findByIdAndDelete(req.params.id);
    sendResponse(res, 200, true, null, 'Review deleted');
  } catch (error) {
    next(error);
  }
};

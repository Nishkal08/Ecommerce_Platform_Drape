const Product = require('../models/Product');
const sendResponse = require('../utils/sendResponse');

// @desc    Get all products with filters, search, sort, pagination
// @route   GET /api/products
exports.getProducts = async (req, res, next) => {
  try {
    const { category, search, sort, page = 1, limit = 12, minPrice, maxPrice } = req.query;
    const query = {};

    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    else if (sort === 'price_desc') sortOption = { price: -1 };
    else if (sort === 'rating') sortOption = { 'ratings.average': -1 };
    else if (sort === 'newest') sortOption = { createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    sendResponse(res, 200, true, {
      products,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      total,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get product by slug
// @route   GET /api/products/:slug
exports.getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) {
      return sendResponse(res, 404, false, null, 'Product not found');
    }
    sendResponse(res, 200, true, product);
  } catch (error) {
    next(error);
  }
};

// @desc    Create product (admin)
// @route   POST /api/products
exports.createProduct = async (req, res, next) => {
  try {
    req.body.createdBy = req.user._id;
    const product = await Product.create(req.body);
    sendResponse(res, 201, true, product, 'Product created successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Update product (admin)
// @route   PUT /api/products/:id
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return sendResponse(res, 404, false, null, 'Product not found');
    }
    sendResponse(res, 200, true, product, 'Product updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product (admin)
// @route   DELETE /api/products/:id
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return sendResponse(res, 404, false, null, 'Product not found');
    }
    sendResponse(res, 200, true, null, 'Product deleted successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
exports.getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ isFeatured: true }).limit(8);
    sendResponse(res, 200, true, products);
  } catch (error) {
    next(error);
  }
};

const Cart = require('../models/Cart');
const Product = require('../models/Product');
const sendResponse = require('../utils/sendResponse');

// @desc    Get user cart
// @route   GET /api/cart
exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart) {
      cart = { items: [] };
    }
    sendResponse(res, 200, true, cart);
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
exports.addItem = async (req, res, next) => {
  try {
    const { productId, quantity = 1, size = '' } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return sendResponse(res, 404, false, null, 'Product not found');
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId && item.size === size
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity, size });
    }

    await cart.save();
    await cart.populate('items.product');
    sendResponse(res, 200, true, cart, 'Item added to cart');
  } catch (error) {
    next(error);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
exports.updateItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return sendResponse(res, 404, false, null, 'Cart not found');
    }

    const item = cart.items.id(req.params.itemId);
    if (!item) {
      return sendResponse(res, 404, false, null, 'Item not found in cart');
    }

    item.quantity = quantity;
    await cart.save();
    await cart.populate('items.product');
    sendResponse(res, 200, true, cart, 'Cart updated');
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
exports.removeItem = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return sendResponse(res, 404, false, null, 'Cart not found');
    }

    cart.items = cart.items.filter((item) => item._id.toString() !== req.params.itemId);
    await cart.save();
    await cart.populate('items.product');
    sendResponse(res, 200, true, cart, 'Item removed from cart');
  } catch (error) {
    next(error);
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
exports.clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    sendResponse(res, 200, true, { items: [] }, 'Cart cleared');
  } catch (error) {
    next(error);
  }
};

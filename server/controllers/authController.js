const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const sendResponse = require('../utils/sendResponse');

// @desc    Register user
// @route   POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendResponse(res, 400, false, null, 'Email already registered');
    }

    const user = await User.create({ name, email, password });
    generateToken(res, user._id);

    sendResponse(res, 201, true, {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    }, 'Registration successful');
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return sendResponse(res, 401, false, null, 'Invalid email or password');
    }

    generateToken(res, user._id);

    sendResponse(res, 200, true, {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    }, 'Login successful');
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    sendResponse(res, 200, true, user);
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
exports.logout = async (req, res, next) => {
  try {
    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0),
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });
    sendResponse(res, 200, true, null, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

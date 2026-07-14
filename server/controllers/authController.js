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

// @desc    Update user profile
// @route   PUT /api/auth/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (email) {
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== req.user._id.toString()) {
        return sendResponse(res, 400, false, null, 'Email already in use');
      }
      user.email = email;
    }
    if (password) user.password = password;

    await user.save();
    sendResponse(res, 200, true, {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      addresses: user.addresses,
    }, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Add shipping address
// @route   POST /api/auth/addresses
exports.addAddress = async (req, res, next) => {
  try {
    const { name, line1, city, state, pincode, phone, isDefault } = req.body;
    const user = await User.findById(req.user._id);

    if (isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    user.addresses.push({
      name,
      line1,
      city,
      state,
      pincode,
      phone,
      isDefault: isDefault || user.addresses.length === 0,
    });

    await user.save();
    sendResponse(res, 200, true, user, 'Address added successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Delete shipping address
// @route   DELETE /api/auth/addresses/:addressId
exports.deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses = user.addresses.filter(
      (addr) => addr._id.toString() !== req.params.addressId
    );
    await user.save();
    sendResponse(res, 200, true, user, 'Address deleted successfully');
  } catch (error) {
    next(error);
  }
};


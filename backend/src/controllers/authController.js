const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const config = require('../config');

const signToken = id => {
  return jwt.sign({ id }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

exports.register = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    role: req.body.role || 'user'
  });

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }
  
  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3) If everything ok, send token to client
  createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'User logged out successfully'
  });
};

exports.getProfile = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user
    }
  });
});

exports.updateProfile = catchAsync(async (req, res, next) => {
  const { name, email } = req.body;
  
  if (name) req.user.name = name;
  if (email) req.user.email = email;
  
  await req.user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    data: {
      user: req.user
    }
  });
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new AppError('Please provide an email address.', 400));
  }
  res.status(200).json({
    status: 'success',
    message: 'Reset OTP/Token sent to email!'
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { email, token, newPassword } = req.body;
  if (!email || !token || !newPassword) {
    return next(new AppError('Please provide email, token, and new password.', 400));
  }
  res.status(200).json({
    status: 'success',
    message: 'Password has been reset successfully!'
  });
});

exports.verifyEmail = catchAsync(async (req, res, next) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return next(new AppError('Please provide email and verification code.', 400));
  }
  res.status(200).json({
    status: 'success',
    message: 'Email verified successfully!'
  });
});

exports.sendOtp = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new AppError('Please provide an email address.', 400));
  }
  res.status(200).json({
    status: 'success',
    message: 'OTP sent successfully!'
  });
});

exports.changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return next(new AppError('Please provide current and new passwords.', 400));
  }

  const user = await User.findById(req.user.id).select('+password');
  if (!(await user.correctPassword(currentPassword, user.password))) {
    return next(new AppError('Incorrect current password.', 401));
  }

  user.password = newPassword;
  await user.save();

  createSendToken(user, 200, res);
});


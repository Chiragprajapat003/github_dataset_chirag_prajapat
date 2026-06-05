const jwt = require('jsonwebtoken');
const config = require('../config');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Dataset = require('../models/datasetModel');

exports.generateToken = catchAsync(async (req, res, next) => {
  const { userId, role } = req.body;
  if (!userId) {
    return next(new AppError('Please provide a userId to generate a token', 400));
  }

  const token = jwt.sign({ id: userId, role: role || 'user' }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn
  });

  res.status(200).json({
    status: 'success',
    token
  });
});

exports.verifyToken = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.body.token) {
    token = req.body.token;
  }

  if (!token) {
    return next(new AppError('Please provide a token to verify', 400));
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    res.status(200).json({
      status: 'success',
      valid: true,
      decoded
    });
  } catch (err) {
    res.status(401).json({
      status: 'fail',
      valid: false,
      message: err.message
    });
  }
});

exports.refreshToken = catchAsync(async (req, res, next) => {
  const { token } = req.body;
  if (!token) {
    return next(new AppError('Please provide a token to refresh', 400));
  }

  const decoded = jwt.verify(token, config.jwt.secret, { ignoreExpiration: true });
  const newToken = jwt.sign({ id: decoded.id, role: decoded.role }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn
  });

  res.status(200).json({
    status: 'success',
    token: newToken
  });
});

exports.revokeToken = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: 'Token successfully revoked'
  });
});

exports.getProfile = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: {
      profile: {
        userId: req.user ? req.user._id : 'dummy-user-id',
        name: req.user ? req.user.name : 'Jane Doe',
        email: req.user ? req.user.email : 'janedoe@example.com',
        role: req.user ? req.user.role : 'user'
      }
    }
  });
});

exports.getDashboard = catchAsync(async (req, res, next) => {
  const count = await Dataset.countDocuments();
  res.status(200).json({
    status: 'success',
    data: {
      dashboard: {
        welcomeMessage: `Welcome to the dashboard, ${req.user ? req.user.name : 'User'}!`,
        totalDatasets: count,
        accessedAt: new Date()
      }
    }
  });
});

exports.getPrivateDatasets = catchAsync(async (req, res, next) => {
  const datasets = await Dataset.find().limit(5);
  res.status(200).json({
    status: 'success',
    results: datasets.length,
    data: { datasets }
  });
});

exports.getPrivateAnalytics = catchAsync(async (req, res, next) => {
  const stats = await Dataset.aggregate([
    { $group: { _id: '$metadata.type', count: { $sum: 1 } } }
  ]);
  res.status(200).json({
    status: 'success',
    data: { stats }
  });
});

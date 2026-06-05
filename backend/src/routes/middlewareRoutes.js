const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { apiLimiter } = require('../middlewares/rateLimiter');
const AppError = require('../utils/appError');

const router = express.Router();

router.get('/logger', (req, res) => {
  console.log('LOG: /middleware/logger requested at', new Date());
  res.status(200).json({
    status: 'success',
    message: 'Logger middleware demo. Check server console for logged request.'
  });
});

router.get('/auth', authMiddleware.protect, (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Auth middleware demo. Access granted!',
    user: req.user
  });
});

// A simple in-memory cache middleware for demo
const cache = {};
const cacheMiddleware = (duration) => (req, res, next) => {
  const key = req.originalUrl;
  if (cache[key] && cache[key].expire > Date.now()) {
    return res.status(200).json({
      status: 'success',
      message: 'Cached response',
      data: cache[key].data
    });
  }
  res.originalSend = res.json;
  res.json = (body) => {
    cache[key] = {
      expire: Date.now() + duration * 1000,
      data: body
    };
    res.originalSend(body);
  };
  next();
};

router.get('/cache', cacheMiddleware(10), (req, res) => {
  res.status(200).json({
    status: 'success',
    timestamp: new Date().toISOString(),
    message: 'This response is cached for 10 seconds.'
  });
});

router.get('/error-handler', (req, res, next) => {
  next(new AppError('This is a simulated global error!', 400));
});

router.get('/rate-limit', apiLimiter, (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Rate limit middleware demo. Limit is standard apiLimiter.'
  });
});

module.exports = router;

const express = require('express');
const datasetController = require('../controllers/datasetController');

const router = express.Router();

router.get('/datasets', (req, res, next) => {
  if (req.query.q) {
    req.query.search = req.query.q;
  }
  datasetController.getAllDatasets(req, res, next);
});

module.exports = router;

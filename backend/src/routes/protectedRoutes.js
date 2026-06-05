const express = require('express');
const datasetController = require('../controllers/datasetController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authMiddleware.protect);

router.post('/datasets', datasetController.createDataset);
router.patch('/datasets/:id', datasetController.updateDataset);
router.delete('/datasets/:id', datasetController.deleteDataset);

module.exports = router;

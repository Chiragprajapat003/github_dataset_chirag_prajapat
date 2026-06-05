const express = require('express');
const datasetController = require('../controllers/datasetController');
const authMiddleware = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { createDatasetSchema, updateDatasetSchema } = require('../validations/schemas');

const router = express.Router();

// Helper middleware to handle OPTIONS for a given set of methods
const handleOptions = (allowedMethods) => (req, res) => {
  res.setHeader('Allow', allowedMethods.join(', '));
  res.status(200).send();
};

// 1. OPTIONS & HEAD handlers
router.options('/', handleOptions(['GET', 'POST', 'OPTIONS', 'HEAD']));
router.options('/:id', handleOptions(['GET', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD']));

// 2. Bulk & Existence Routes
router.post('/bulk-create', authMiddleware.protect, authMiddleware.restrictTo('admin'), datasetController.bulkCreate);
router.patch('/bulk-update', authMiddleware.protect, authMiddleware.restrictTo('admin'), datasetController.bulkUpdate);
router.delete('/bulk-delete', authMiddleware.protect, authMiddleware.restrictTo('admin'), datasetController.bulkDelete);
router.get('/check/:id', datasetController.checkExistence);

// 3. Advanced Query Routes
router.get('/random', datasetController.getRandomDataset);
router.get('/trending', datasetController.getTrendingDatasets);
router.get('/recent', datasetController.getRecentDatasets);
router.get('/recommendations', datasetController.getRecommendations);

// 4. Static Filter Routes
router.get('/readme', datasetController.getReadmeDatasets);
router.get('/functions', datasetController.getFunctionDatasets);
router.get('/classes', datasetController.getClassDatasets);
router.get('/documentation', datasetController.getDocumentationDatasets);
router.get('/github', datasetController.getGithubDatasets);
router.get('/python', datasetController.getPythonDatasets);
router.get('/ml', datasetController.getMlDatasets);
router.get('/ai', datasetController.getAiDatasets);
router.get('/code-generation', datasetController.getCodeGenDatasets);
router.get('/docstrings', datasetController.getDocstringsDatasets);

// 5. Custom "/filter/*" Routes (alias to the static filter handlers)
router.get('/filter/functions', datasetController.getFunctionDatasets);
router.get('/filter/classes', datasetController.getClassDatasets);
router.get('/filter/documentation', datasetController.getDocumentationDatasets);
router.get('/filter/readme', datasetController.getReadmeDatasets);
router.get('/filter/python', datasetController.getPythonDatasets);
router.get('/filter/ai', datasetController.getAiDatasets);
router.get('/filter/ml', datasetController.getMlDatasets);
router.get('/filter/github', datasetController.getGithubDatasets);
router.get('/filter/frameworks', datasetController.getByFramework); // Matches framework via queries
router.get('/filter/docstrings', datasetController.getDocstringsDatasets);

// 6. Custom "/sort/*" Routes
router.get('/sort/recent', (req, res, next) => { req.query.sort = '-createdAt'; datasetController.getAllDatasets(req, res, next); });
router.get('/sort/name', (req, res, next) => { req.query.sort = 'metadata.repo_name'; datasetController.getAllDatasets(req, res, next); });
router.get('/sort/type-desc', (req, res, next) => { req.query.sort = '-metadata.type'; datasetController.getAllDatasets(req, res, next); });
router.get('/sort/repo-desc', (req, res, next) => { req.query.sort = '-metadata.repo_name'; datasetController.getAllDatasets(req, res, next); });

// 7. Route Parameter Routes
router.get('/type/:type', datasetController.getByType);
router.get('/repo/:repo', datasetController.getByRepo);
router.get('/source/:source', datasetController.getBySource);
router.get('/doc-type/:docType', datasetController.getByDocType);
router.get('/doc/:docType', datasetController.getByDocType);
router.get('/code-element/:element', datasetController.getByCodeElement);
router.get('/code/:element', datasetController.getByCodeElement);
router.get('/task/:task', datasetController.getByTask);
router.get('/model/:model', datasetController.getByModel);
router.get('/framework/:framework', datasetController.getByFramework);
router.get('/library/:library', datasetController.getByLibrary);
router.get('/language/:language', datasetController.getByLanguage);
router.get('/category/:category', datasetController.getByCategory);

// 8. Basic CRUD Base Routes
router
  .route('/')
  .get(datasetController.getAllDatasets)
  .post(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin'),
    validate(createDatasetSchema),
    datasetController.createDataset
  );

router
  .route('/:id')
  .get(datasetController.getDataset)
  .put(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin'),
    validate(updateDatasetSchema),
    datasetController.updateDataset
  )
  .patch(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin'),
    validate(updateDatasetSchema),
    datasetController.updateDataset
  )
  .delete(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin'),
    datasetController.deleteDataset
  );

module.exports = router;

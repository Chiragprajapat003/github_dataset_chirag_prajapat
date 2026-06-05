const express = require('express');
const statsController = require('../controllers/statsController');

const router = express.Router();

router.get('/count', statsController.getCount);
router.get('/functions', statsController.getFunctionsCount);
router.get('/classes', statsController.getClassesCount);
router.get('/documentation', statsController.getDocumentationCount);
router.get('/readme', statsController.getReadmeCount);
router.get('/repos', statsController.getReposCount);
router.get('/languages', statsController.getLanguagesCount);
router.get('/frameworks', statsController.getFrameworksCount);
router.get('/github', statsController.getGithubCount);
router.get('/ai', statsController.getAiCount);

module.exports = router;

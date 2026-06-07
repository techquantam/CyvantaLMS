const express = require('express');
const router = express.Router();
const {
  getResources,
  createResource,
  deleteResource,
  downloadResource,
} = require('../controllers/resourceController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);

router.route('/')
  .get(getResources)
  .post(authorize('admin'), upload.single('file'), createResource);

router.route('/:id')
  .delete(authorize('admin'), deleteResource);

router.route('/:id/download')
  .get(downloadResource);

module.exports = router;


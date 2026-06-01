const express = require('express');
const router = express.Router();
const {
  getLiveClasses,
  createLiveClass,
  updateLiveClass,
  toggleLiveClassStatus,
  deleteLiveClass,
  concludeLiveClass,
} = require('../controllers/liveClassController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getLiveClasses)
  .post(authorize('admin'), createLiveClass);

router.route('/:id')
  .put(authorize('admin'), updateLiveClass)
  .delete(authorize('admin'), deleteLiveClass);

router.patch('/:id/status', authorize('admin'), toggleLiveClassStatus);
router.post('/:id/conclude', authorize('admin'), concludeLiveClass);

module.exports = router;

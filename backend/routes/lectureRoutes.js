const express = require('express');
const router = express.Router();
const {
  getLectures,
  createLecture,
  updateLecture,
  deleteLecture,
} = require('../controllers/lectureController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getLectures)
  .post(authorize('admin'), createLecture);

router.route('/:id')
  .put(authorize('admin'), updateLecture)
  .delete(authorize('admin'), deleteLecture);

module.exports = router;

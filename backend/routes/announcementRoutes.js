const express = require('express');
const router = express.Router();
const {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getAnnouncements)
  .post(authorize('admin'), createAnnouncement);

router.route('/:id')
  .put(authorize('admin'), updateAnnouncement)
  .delete(authorize('admin'), deleteAnnouncement);

module.exports = router;

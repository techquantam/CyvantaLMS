const express = require('express');
const router = express.Router();
const {
  login,
  getMe,
  changePassword,
  updateProfile,
  resetStudentPassword,
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/change-password', protect, changePassword);
router.put('/profile', protect, updateProfile);
router.post('/reset-password', protect, authorize('admin'), resetStudentPassword);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  toggleStudentStatus,
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All student routes are protected and restricted to Admin role
router.use(protect);
router.use(authorize('admin'));

router.route('/')
  .get(getStudents)
  .post(createStudent);

router.route('/:id')
  .put(updateStudent)
  .delete(deleteStudent);

router.patch('/:id/status', toggleStudentStatus);

module.exports = router;

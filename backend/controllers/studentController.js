const User = require('../models/User');

// @desc    Get all students
// @route   GET /api/students
// @access  Private/Admin
exports.getStudents = async (req, res) => {
  try {
    const { search, status, courseId } = req.query;

    let query = { role: 'student' };

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
      ];
    }

    // Status filter (Active / Inactive)
    if (status) {
      query.isActive = status === 'active';
    }

    // Course filter
    if (courseId) {
      query.assignedCourse = courseId;
    }

    const students = await User.find(query)
      .populate('assignedCourse', 'title category')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: students.length,
      students,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error retrieving students' });
  }
};

// @desc    Create student account
// @route   POST /api/students
// @access  Private/Admin
exports.createStudent = async (req, res) => {
  const { name, email, mobile, password, assignedCourse } = req.body;

  try {
    // Check if email already registered
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const student = await User.create({
      name,
      email,
      mobile,
      password, // will be hashed by UserSchema presave hook
      role: 'student',
      assignedCourse: assignedCourse || null,
      isActive: true,
      firstLogin: true, // Forces password change
    });

    res.status(201).json({
      success: true,
      message: 'Student account created successfully',
      student: {
        _id: student._id,
        name: student.name,
        email: student.email,
        mobile: student.mobile,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || 'Server error creating student' });
  }
};

// @desc    Update student account
// @route   PUT /api/students/:id
// @access  Private/Admin
exports.updateStudent = async (req, res) => {
  const { name, email, mobile, assignedCourse } = req.body;

  try {
    let student = await User.findById(req.params.id);

    if (!student || student.role !== 'student') {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Check email uniqueness if email is changing
    if (email && email !== student.email) {
      const exists = await User.findOne({ email });
      if (exists) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }
      student.email = email;
    }

    if (name) student.name = name;
    if (mobile) student.mobile = mobile;
    
    // Allow updating course (convert empty strings to null)
    student.assignedCourse = assignedCourse || null;

    await student.save();

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      student,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error updating student' });
  }
};

// @desc    Delete student account
// @route   DELETE /api/students/:id
// @access  Private/Admin
exports.deleteStudent = async (req, res) => {
  try {
    const student = await User.findById(req.params.id);

    if (!student || student.role !== 'student') {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Student account deleted successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error deleting student' });
  }
};

// @desc    Activate/Deactivate student account
// @route   PATCH /api/students/:id/status
// @access  Private/Admin
exports.toggleStudentStatus = async (req, res) => {
  const { isActive } = req.body;

  try {
    const student = await User.findById(req.params.id);

    if (!student || student.role !== 'student') {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    student.isActive = isActive;
    await student.save();

    res.status(200).json({
      success: true,
      message: `Student status updated to ${isActive ? 'Active' : 'Inactive'}`,
      student,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error updating student status' });
  }
};

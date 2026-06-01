const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper to sign JWT token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_cyvanta_lms_token_hash_2026', {
    expiresIn: '30d',
  });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if active
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account is deactivated. Please contact admin.' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate token
    const token = signToken(user._id);

    // Prepare response user object
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      assignedCourse: user.assignedCourse,
      firstLogin: user.firstLogin,
    };

    res.status(200).json({
      success: true,
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('assignedCourse');

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Change Password (e.g. force change on first login or manual profile update)
// @route   POST /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id).select('+password');

    // If it's not their first login, they must provide their current password
    if (!user.firstLogin) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: 'Please provide current password' });
      }
      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      }
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long' });
    }

    // Set new password (will be hashed by pre-save hook)
    user.password = newPassword;
    user.firstLogin = false; // Disable first-login flag
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error while changing password' });
  }
};

// @desc    Update User Profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  const { name, mobile } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (name) user.name = name;
    if (mobile) user.mobile = mobile;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        assignedCourse: user.assignedCourse,
        firstLogin: user.firstLogin,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error while updating profile' });
  }
};

// @desc    Reset Student Password (Admin only)
// @route   POST /api/auth/reset-password
// @access  Private/Admin
exports.resetStudentPassword = async (req, res) => {
  const { studentId, newPassword } = req.body;

  try {
    if (!studentId || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide student ID and new password' });
    }

    const student = await User.findById(studentId);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    student.password = newPassword;
    student.firstLogin = true; // Force them to reset password again upon their next login
    await student.save();

    res.status(200).json({
      success: true,
      message: `Password reset successfully for student ${student.name}. They will be forced to change it on their next login.`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error resetting student password' });
  }
};

const LiveClass = require('../models/LiveClass');

// @desc    Get live classes
// @route   GET /api/live-classes
// @access  Private
exports.getLiveClasses = async (req, res) => {
  try {
    let query = {};

    // Students only see live classes for their assigned course
    if (req.user.role === 'student') {
      if (!req.user.assignedCourse) {
        return res.status(200).json({ success: true, liveClasses: [] });
      }
      query = { courseId: req.user.assignedCourse, isActive: true };
    }

    const liveClasses = await LiveClass.find(query)
      .populate('courseId', 'title category')
      .sort({ scheduleDate: 1 }); // Sort by upcoming date

    res.status(200).json({ success: true, liveClasses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error retrieving live classes' });
  }
};

// @desc    Schedule a live class
// @route   POST /api/live-classes
// @access  Private/Admin
exports.createLiveClass = async (req, res) => {
  const { title, description, youtubeLiveUrl, courseId, scheduleDate } = req.body;

  try {
    if (!title || !youtubeLiveUrl || !courseId || !scheduleDate) {
      return res.status(400).json({ success: false, message: 'Please fill all required fields' });
    }

    const liveClass = await LiveClass.create({
      title,
      description,
      youtubeLiveUrl,
      courseId,
      scheduleDate,
      isActive: true,
    });

    res.status(201).json({ success: true, message: 'Live class scheduled successfully', liveClass });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error scheduling live class' });
  }
};

// @desc    Update live class schedule
// @route   PUT /api/live-classes/:id
// @access  Private/Admin
exports.updateLiveClass = async (req, res) => {
  const { title, description, youtubeLiveUrl, courseId, scheduleDate } = req.body;

  try {
    let liveClass = await LiveClass.findById(req.params.id);

    if (!liveClass) {
      return res.status(404).json({ success: false, message: 'Live class not found' });
    }

    if (title) liveClass.title = title;
    if (description !== undefined) liveClass.description = description;
    if (youtubeLiveUrl) liveClass.youtubeLiveUrl = youtubeLiveUrl;
    if (courseId) liveClass.courseId = courseId;
    if (scheduleDate) liveClass.scheduleDate = scheduleDate;

    await liveClass.save();

    res.status(200).json({ success: true, message: 'Live class updated successfully', liveClass });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error updating live class' });
  }
};

// @desc    Toggle live class active/inactive status
// @route   PATCH /api/live-classes/:id/status
// @access  Private/Admin
exports.toggleLiveClassStatus = async (req, res) => {
  const { isActive } = req.body;

  try {
    let liveClass = await LiveClass.findById(req.params.id);

    if (!liveClass) {
      return res.status(404).json({ success: false, message: 'Live class not found' });
    }

    liveClass.isActive = isActive;
    await liveClass.save();

    res.status(200).json({
      success: true,
      message: `Live class status updated to ${isActive ? 'Active' : 'Inactive'}`,
      liveClass,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error toggling live class status' });
  }
};

// @desc    Delete scheduled live class
// @route   DELETE /api/live-classes/:id
// @access  Private/Admin
exports.deleteLiveClass = async (req, res) => {
  try {
    const liveClass = await LiveClass.findById(req.params.id);

    if (!liveClass) {
      return res.status(404).json({ success: false, message: 'Live class not found' });
    }

    await LiveClass.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Live class deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error deleting live class' });
  }
};

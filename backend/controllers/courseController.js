const Course = require('../models/Course');
const LiveClass = require('../models/LiveClass');
const Lecture = require('../models/Lecture');
const Resource = require('../models/Resource');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Private
exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.status(200).json({ success: true, courses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error retrieving courses' });
  }
};

// @desc    Create a course
// @route   POST /api/courses
// @access  Private/Admin
exports.createCourse = async (req, res) => {
  const { title, description, thumbnail, category } = req.body;

  try {
    if (!title || !description || !thumbnail || !category) {
      return res.status(400).json({ success: false, message: 'Please fill all course fields' });
    }

    const course = await Course.create({
      title,
      description,
      thumbnail,
      category,
    });

    res.status(201).json({ success: true, message: 'Course created successfully', course });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error creating course' });
  }
};

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private/Admin
exports.updateCourse = async (req, res) => {
  const { title, description, thumbnail, category } = req.body;

  try {
    let course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (title) course.title = title;
    if (description) course.description = description;
    if (thumbnail) course.thumbnail = thumbnail;
    if (category) course.category = category;

    await course.save();

    res.status(200).json({ success: true, message: 'Course updated successfully', course });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error updating course' });
  }
};

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private/Admin
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Cascading deletion of dependent live classes, lectures, and resources
    await LiveClass.deleteMany({ courseId: course._id });
    await Lecture.deleteMany({ courseId: course._id });
    await Resource.deleteMany({ courseId: course._id });
    await Course.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Course and all associated live classes, lectures, and resources deleted successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error deleting course' });
  }
};

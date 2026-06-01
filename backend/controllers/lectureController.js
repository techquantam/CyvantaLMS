const Lecture = require('../models/Lecture');

// @desc    Get lectures
// @route   GET /api/lectures
// @access  Private
exports.getLectures = async (req, res) => {
  try {
    let query = {};

    // Students only see lectures for their assigned course
    if (req.user.role === 'student') {
      if (!req.user.assignedCourse) {
        return res.status(200).json({ success: true, lectures: [] });
      }
      query = {
        courseId: req.user.assignedCourse,
      };
    }

    const lectures = await Lecture.find(query)
      .populate('courseId', 'title category')
      .sort({ _id: -1 });

    res.status(200).json({ success: true, lectures });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error retrieving lectures' });
  }
};

// @desc    Add a lecture
// @route   POST /api/lectures
// @access  Private/Admin
exports.createLecture = async (req, res) => {
  const { title, description, youtubeVideoUrl, courseId, thumbnail } = req.body;

  try {
    if (!title || !youtubeVideoUrl || !courseId) {
      return res.status(400).json({ success: false, message: 'Please fill all required fields' });
    }

    // Helper to generate a default YouTube thumbnail if not provided
    let videoThumbnail = thumbnail;
    if (!videoThumbnail) {
      try {
        const videoIdMatch = youtubeVideoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
        if (videoIdMatch && videoIdMatch[1]) {
          videoThumbnail = `https://img.youtube.com/vi/${videoIdMatch[1]}/mqdefault.jpg`;
        }
      } catch (err) {
        console.error('Error generating video thumbnail:', err);
      }
    }

    const lecture = await Lecture.create({
      title,
      description,
      youtubeVideoUrl,
      courseId,
      thumbnail: videoThumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60',
    });

    res.status(201).json({ success: true, message: 'Recorded lecture added successfully', lecture });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error creating lecture' });
  }
};

// @desc    Update a lecture
// @route   PUT /api/lectures/:id
// @access  Private/Admin
exports.updateLecture = async (req, res) => {
  const { title, description, youtubeVideoUrl, courseId, thumbnail } = req.body;

  try {
    let lecture = await Lecture.findById(req.params.id);

    if (!lecture) {
      return res.status(404).json({ success: false, message: 'Lecture not found' });
    }

    if (title) lecture.title = title;
    if (description !== undefined) lecture.description = description;
    if (youtubeVideoUrl) {
      lecture.youtubeVideoUrl = youtubeVideoUrl;
      // Re-generate default YouTube thumbnail if url is modified
      const videoIdMatch = youtubeVideoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
      if (videoIdMatch && videoIdMatch[1]) {
        lecture.thumbnail = `https://img.youtube.com/vi/${videoIdMatch[1]}/mqdefault.jpg`;
      }
    }
    if (courseId) lecture.courseId = courseId;
    if (thumbnail) lecture.thumbnail = thumbnail;

    await lecture.save();

    res.status(200).json({ success: true, message: 'Lecture updated successfully', lecture });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error updating lecture' });
  }
};

// @desc    Delete a lecture
// @route   DELETE /api/lectures/:id
// @access  Private/Admin
exports.deleteLecture = async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);

    if (!lecture) {
      return res.status(404).json({ success: false, message: 'Lecture not found' });
    }

    await Lecture.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Lecture deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error deleting lecture' });
  }
};

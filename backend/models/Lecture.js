const mongoose = require('mongoose');

const LectureSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a lecture title'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  youtubeVideoUrl: {
    type: String,
    required: [true, 'Please add a YouTube Video URL'],
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Please associate this lecture with a course'],
  },
  thumbnail: {
    type: String,
  },
});

module.exports = mongoose.model('Lecture', LectureSchema);

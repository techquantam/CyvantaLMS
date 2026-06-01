const mongoose = require('mongoose');

const LiveClassSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a live class title'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  youtubeLiveUrl: {
    type: String,
    required: [true, 'Please add a YouTube Live URL'],
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Please associate this live class with a course'],
  },
  scheduleDate: {
    type: Date,
    required: [true, 'Please add a schedule date and time'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model('LiveClass', LiveClassSchema);

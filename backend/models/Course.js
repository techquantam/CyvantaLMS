const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a course title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a course description'],
  },
  thumbnail: {
    type: String,
    required: [true, 'Please add a course thumbnail url/image'],
  },
  category: {
    type: String,
    required: [true, 'Please add a course category'],
    trim: true,
  },
});

module.exports = mongoose.model('Course', CourseSchema);

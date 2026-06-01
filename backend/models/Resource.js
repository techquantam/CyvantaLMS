const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a resource title'],
    trim: true,
  },
  fileUrl: {
    type: String,
    required: [true, 'Please provide the uploaded resource path'],
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Please associate this resource with a course'],
  },
});

module.exports = mongoose.model('Resource', ResourceSchema);

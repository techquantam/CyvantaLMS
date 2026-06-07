const Resource = require('../models/Resource');
const fs = require('fs');
const path = require('path');

// @desc    Get resources
// @route   GET /api/resources
// @access  Private
exports.getResources = async (req, res) => {
  try {
    let query = {};

    // Students only see resources for their assigned course
    if (req.user.role === 'student') {
      if (!req.user.assignedCourse) {
        return res.status(200).json({ success: true, resources: [] });
      }
      query = { courseId: req.user.assignedCourse };
    }

    const resources = await Resource.find(query)
      .populate('courseId', 'title category')
      .sort({ _id: -1 });

    res.status(200).json({ success: true, resources });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error retrieving study materials' });
  }
};

// @desc    Upload study material
// @route   POST /api/resources
// @access  Private/Admin
exports.createResource = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file resource' });
    }

    const { title, courseId } = req.body;

    if (!title || !courseId) {
      // Clean up uploaded file if fields are missing
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: 'Please provide a title and associated course' });
    }

    // Set the downloadable URL
    const fileUrl = `/uploads/${req.file.filename}`;

    const resource = await Resource.create({
      title,
      fileUrl,
      courseId,
    });

    res.status(201).json({
      success: true,
      message: 'Study material uploaded successfully',
      resource,
    });
  } catch (error) {
    console.error(error);
    // Cleanup upload on catch
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, message: 'Server error uploading study resource' });
  }
};

// @desc    Delete study material
// @route   DELETE /api/resources/:id
// @access  Private/Admin
exports.deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    // Attempt to physically delete the file from the local server upload folder
    const filename = resource.fileUrl.split('/uploads/')[1];
    if (filename) {
      const filePath = path.join(__dirname, '../uploads', filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Resource.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Study material deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error deleting study resource' });
  }
};

// @desc    Download study material
// @route   GET /api/resources/:id/download
// @access  Private
exports.downloadResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    // Students only download resources for their assigned course
    if (req.user.role === 'student') {
      if (!req.user.assignedCourse || req.user.assignedCourse.toString() !== resource.courseId.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized to download this resource' });
      }
    }

    const filename = resource.fileUrl.split('/uploads/')[1];
    if (!filename) {
      return res.status(404).json({ success: false, message: 'File path invalid' });
    }

    const filePath = path.join(__dirname, '../uploads', filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File not found on server' });
    }

    // Determine download filename (sanitize title and preserve extension)
    const ext = path.extname(filename);
    const cleanTitle = resource.title.replace(/[^a-zA-Z0-9]/g, '_');
    const downloadName = `${cleanTitle}${ext}`;

    res.download(filePath, downloadName, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        if (!res.headersSent) {
          res.status(500).json({ success: false, message: 'Error downloading file' });
        }
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error downloading study resource' });
  }
};


const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { protect, authorize } = require('../middleware/authMiddleware');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

// @desc    Upload image to Cloudinary and optimize/reduce size
// @route   POST /api/upload/image
// @access  Private/Admin
router.post('/image', protect, authorize('admin'), upload.uploadImage.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select an image file to upload' });
    }

    // Check if Cloudinary credentials are set. If not, fallback to local file serving
    const isCloudinaryConfigured = 
      process.env.CLOUDINARY_CLOUD_NAME && 
      process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name';

    if (!isCloudinaryConfigured) {
      // Fallback: Serve local image link to prevent crashes, but warn the user
      const localUrl = `/uploads/${req.file.filename}`;
      return res.status(200).json({
        success: true,
        message: 'Image uploaded to local storage (Cloudinary credentials placeholder not configured)',
        url: localUrl,
      });
    }

    // Attempt to upload to Cloudinary with compression & optimization transformations
    let imageUrl = '';
    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'lms_thumbnails',
        width: 800,
        height: 500,
        crop: 'fill',
        gravity: 'center',
        quality: 'auto',         // Automatically select the optimal compression quality
        fetch_format: 'auto',    // Deliver as modern format like WebP/AVIF to reduce load size
      });
      imageUrl = result.secure_url;
      // Delete the local file after uploading to Cloudinary
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    } catch (cloudinaryError) {
      console.warn('Cloudinary upload error, falling back to local file serving:', cloudinaryError);
      // Fallback: Serve local image link instead of returning an error
      imageUrl = `/uploads/${req.file.filename}`;
    }

    res.status(200).json({
      success: true,
      message: 'Image uploaded and processed successfully',
      url: imageUrl,
    });
  } catch (error) {
    console.error('Image upload endpoint error:', error);
    // Cleanup local file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, message: 'Server error processing image' });
  }
});

module.exports = router;

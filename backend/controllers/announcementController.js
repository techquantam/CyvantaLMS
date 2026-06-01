const Announcement = require('../models/Announcement');

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Private
exports.getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, announcements });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error retrieving announcements' });
  }
};

// @desc    Create an announcement
// @route   POST /api/announcements
// @access  Private/Admin
exports.createAnnouncement = async (req, res) => {
  const { title, message } = req.body;

  try {
    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Please provide title and message' });
    }

    const announcement = await Announcement.create({
      title,
      message,
    });

    res.status(201).json({ success: true, message: 'Announcement created successfully', announcement });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error creating announcement' });
  }
};

// @desc    Update an announcement
// @route   PUT /api/announcements/:id
// @access  Private/Admin
exports.updateAnnouncement = async (req, res) => {
  const { title, message } = req.body;

  try {
    let announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    if (title) announcement.title = title;
    if (message) announcement.message = message;

    await announcement.save();

    res.status(200).json({ success: true, message: 'Announcement updated successfully', announcement });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error updating announcement' });
  }
};

// @desc    Delete an announcement
// @route   DELETE /api/announcements/:id
// @access  Private/Admin
exports.deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    await Announcement.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error deleting announcement' });
  }
};

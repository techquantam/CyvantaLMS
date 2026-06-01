const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// Route definitions
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/live-classes', require('./routes/liveClassRoutes'));
app.use('/api/lectures', require('./routes/lectureRoutes'));
app.use('/api/resources', require('./routes/resourceRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));

// Admin Dashboard stats endpoint
app.get('/api/admin/stats', async (req, res) => {
  try {
    const User = require('./models/User');
    const Course = require('./models/Course');
    const Lecture = require('./models/Lecture');
    const LiveClass = require('./models/LiveClass');

    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalCourses = await Course.countDocuments();
    const totalLectures = await Lecture.countDocuments();
    const totalLiveClasses = await LiveClass.countDocuments();

    // Get recent activities (e.g. newly created students, scheduled classes)
    const recentStudents = await User.find({ role: 'student' })
      .select('name email createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentLiveClasses = await LiveClass.find()
      .populate('courseId', 'title')
      .sort({ scheduleDate: -1 })
      .limit(5);

    const activities = [
      ...recentStudents.map(s => ({
        type: 'student',
        message: `New student registered: ${s.name}`,
        date: s.createdAt,
      })),
      ...recentLiveClasses.map(l => ({
        type: 'live',
        message: `Live Class "${l.title}" scheduled for course ${l.courseId?.title || 'General'}`,
        date: l.scheduleDate,
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

    res.status(200).json({
      success: true,
      stats: {
        totalStudents,
        totalCourses,
        totalLectures,
        totalLiveClasses,
      },
      recentActivities: activities,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error retrieving dashboard stats' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Seed default Admin user if not exists
const seedAdmin = async () => {
  try {
    const User = require('./models/User');
    const adminEmail = 'admin@cyvantalms.com';
    const adminExists = await User.findOne({ email: adminEmail });

    if (!adminExists) {
      await User.create({
        name: 'System Admin',
        email: adminEmail,
        mobile: '9876543210',
        password: 'AdminPassword123', // Will be hashed automatically
        role: 'admin',
        firstLogin: false,
        isActive: true,
      });
      console.log('==================================================');
      console.log('DEFAULT ADMIN USER CREATED SUCCESSFULLY');
      console.log(`Email: ${adminEmail}`);
      console.log('Password: AdminPassword123');
      console.log('==================================================');
    }
  } catch (error) {
    console.error('Error seeding admin user:', error);
  }
};

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  await seedAdmin();
});

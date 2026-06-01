import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Layouts & Generic
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import ForcePasswordChange from './pages/ForcePasswordChange';
import Profile from './pages/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminStudents from './pages/admin/Students';
import AdminCourses from './pages/admin/Courses';
import AdminLectures from './pages/admin/Lectures';
import AdminLiveClasses from './pages/admin/LiveClasses';
import AdminResources from './pages/admin/Resources';
import AdminAnnouncements from './pages/admin/Announcements';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import StudentLectures from './pages/student/Lectures';
import StudentLiveClasses from './pages/student/LiveClasses';
import StudentResources from './pages/student/Resources';
import StudentAnnouncements from './pages/student/Announcements';

// Floating Toast Notification Deck
const ToastContainer = () => {
  const { toasts, removeToast } = useAuth();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2.5 max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start justify-between p-4 rounded-2xl shadow-xl backdrop-blur-md border text-white transform transition-all duration-300 animate-slide-in-right ${toast.type === 'error' ? 'bg-rose-500/95 border-rose-600/30 shadow-rose-500/10' : 'bg-brand-500/95 border-brand-600/30 shadow-brand-500/10'}`}
        >
          <div className="text-xs font-semibold leading-normal">{toast.message}</div>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-3 text-sm font-bold text-white/70 hover:text-white transition-colors shrink-0"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          
          <Routes>
            
            {/* Public route */}
            <Route path="/login" element={<Login />} />

            {/* Forced Security Override */}
            <Route path="/change-password" element={<ForcePasswordChange />} />

            {/* Protected Workspace layouts */}
            <Route element={<DashboardLayout />}>
              
              {/* Fallback homepage redirects to role-based dashboard */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              
              {/* Admin Panel */}
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/students" element={<AdminStudents />} />
              <Route path="/admin/courses" element={<AdminCourses />} />
              <Route path="/admin/lectures" element={<AdminLectures />} />
              <Route path="/admin/live-classes" element={<AdminLiveClasses />} />
              <Route path="/admin/resources" element={<AdminResources />} />
              <Route path="/admin/announcements" element={<AdminAnnouncements />} />

              {/* Student Panel */}
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/lectures" element={<StudentLectures />} />
              <Route path="/student/live-classes" element={<StudentLiveClasses />} />
              <Route path="/student/resources" element={<StudentResources />} />
              <Route path="/student/announcements" element={<StudentAnnouncements />} />

              {/* Common profile */}
              <Route path="/profile" element={<Profile />} />

            </Route>

            {/* General fallback redirect */}
            <Route path="*" element={<Navigate to="/login" replace />} />

          </Routes>

          {/* Mount system-wide Toast notifications */}
          <ToastContainer />

        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;

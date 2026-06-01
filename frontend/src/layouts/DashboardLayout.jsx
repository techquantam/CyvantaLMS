import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const DashboardLayout = () => {
  const { user, token, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // loading check
  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-zinc-800"></div>
          <div className="absolute inset-0 rounded-full border-4 border-brand-500 border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  // Auth block
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Force Password Change interceptor
  if (user.firstLogin) {
    return <Navigate to="/change-password" replace />;
  }

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="h-full min-h-screen bg-slate-50 dark:bg-zinc-950 flex transition-colors duration-300">
      
      {/* Sidebar navigation */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col lg:pl-72 min-w-0">
        
        {/* Top Navbar */}
        <Navbar toggleSidebar={toggleSidebar} />

        {/* Viewport content */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

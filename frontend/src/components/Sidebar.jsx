import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  FolderKanban,
  Video,
  Radio,
  FileDown,
  Megaphone,
  User,
  LogOut,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/students', label: 'Students', icon: Users },
    { to: '/admin/courses', label: 'Courses', icon: GraduationCap },
    { to: '/admin/lectures', label: 'Recorded Lectures', icon: Video },
    { to: '/admin/resources', label: 'Study Resources', icon: FileDown },
    { to: '/admin/announcements', label: 'Announcements', icon: Megaphone },
  ];

  const studentLinks = [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/lectures', label: 'Recorded Lectures', icon: Video },
    { to: '/student/resources', label: 'Study Materials', icon: FileDown },
    { to: '/student/announcements', label: 'Announcements', icon: Megaphone },
  ];

  const commonLinks = [
    { to: '/profile', label: 'Profile Settings', icon: User },
  ];

  const links = user.role === 'admin' ? adminLinks : studentLinks;

  const activeStyle = "flex items-center px-4 py-3 text-sm font-semibold rounded-xl bg-brand-500 text-white shadow-md shadow-brand-500/30 transition-all duration-200";
  const inactiveStyle = "flex items-center px-4 py-3 text-sm font-medium rounded-xl text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800/60 hover:text-slate-900 dark:hover:text-zinc-200 transition-all duration-200";

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/20 dark:bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col w-72 border-r border-slate-100 dark:border-zinc-800/80 bg-white/95 dark:bg-zinc-900/95 glass transform lg:transform-none transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        
        {/* Logo and close trigger */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-slate-100 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-900/50">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 border border-slate-150 dark:border-zinc-700 shadow-md p-1 overflow-hidden shrink-0">
              <img src="/logo.png" alt="Cyvanta Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold font-outfit tracking-tight text-slate-800 dark:text-zinc-100 leading-tight">
                Cyvanta Tech Quantum
              </h1>
              <span className="text-[9px] font-bold tracking-wider uppercase text-slate-400 dark:text-zinc-500 block mt-0.5">
                LMS Portal
              </span>
            </div>
          </div>
          <button 
            onClick={toggleSidebar}
            className="p-1 rounded-lg lg:hidden hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-7">
          <div>
            <span className="px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500 block mb-3">
              Main Menu
            </span>
            <nav className="space-y-1.5">
              {links.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => lgScreen() ? null : toggleSidebar()}
                    className={({ isActive }) => isActive ? activeStyle : inactiveStyle}
                  >
                    <Icon className="w-5 h-5 mr-3.5 shrink-0" />
                    {link.label}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div>
            <span className="px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500 block mb-3">
              Account
            </span>
            <nav className="space-y-1.5">
              {commonLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => lgScreen() ? null : toggleSidebar()}
                    className={({ isActive }) => isActive ? activeStyle : inactiveStyle}
                  >
                    <Icon className="w-5 h-5 mr-3.5 shrink-0" />
                    {link.label}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Logout panel */}
        <div className="p-4 border-t border-slate-100 dark:border-zinc-800/80">
          <button
            onClick={() => {
              logout();
              if (!lgScreen()) toggleSidebar();
            }}
            className="flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all duration-200"
          >
            <LogOut className="w-5 h-5 mr-3.5 shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

// Check if viewport is desktop sized
const lgScreen = () => {
  if (typeof window !== 'undefined') {
    return window.innerWidth >= 1024;
  }
  return false;
};

export default Sidebar;

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Menu, Sun, Moon, Sparkles } from 'lucide-react';

const Navbar = ({ toggleSidebar }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  if (!user) return null;

  // Generate initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="sticky top-0 z-30 h-20 px-6 border-b border-slate-100 dark:border-zinc-800/80 bg-white/95 dark:bg-zinc-900/95 glass flex items-center justify-between transition-colors duration-300">
      
      {/* Sidebar mobile toggle trigger */}
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        {/* Decorative Badge */}
        <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/20 text-brand-600 dark:text-brand-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Summer Internship Cohort 2026</span>
        </div>
      </div>

      {/* User settings panel & theme toggle */}
      <div className="flex items-center space-x-4">
        
        {/* Toggle Theme button */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          className="p-2.5 rounded-xl border border-slate-150 dark:border-zinc-800 hover:bg-slate-55 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-350 transition-all duration-200"
        >
          {theme === 'light' ? (
            <Moon className="w-5 h-5" />
          ) : (
            <Sun className="w-5 h-5 text-amber-400" />
          )}
        </button>

        {/* Separator line */}
        <div className="h-8 w-px bg-slate-200 dark:bg-zinc-800" />

        {/* Profile metadata panel */}
        <div className="flex items-center space-x-3.5">
          <div className="text-right hidden md:block">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-zinc-200 leading-none mb-1">
              {user.name}
            </h3>
            <span className="inline-block px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase rounded-md bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400">
              {user.role}
            </span>
          </div>

          {/* Initials Avatar */}
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-indigo-500 text-white font-bold font-outfit shadow-md shadow-brand-500/20">
            {getInitials(user.name)}
          </div>
        </div>

      </div>
    </header>
  );
};

export default Navbar;

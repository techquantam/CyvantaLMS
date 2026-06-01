import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/Loader';
import { Video, FileDown, Megaphone, GraduationCap, Sparkles, BookOpen, Layers, PlayCircle, CalendarClock } from 'lucide-react';

const Dashboard = () => {
  const { user, showToast } = useAuth();
  
  const [lectures, setLectures] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadStudentDashboard = async () => {
    try {
      const [lecRes, annRes] = await Promise.all([
        api.get('/lectures'),
        api.get('/announcements'),
      ]);
      if (lecRes.data?.success) setLectures(lecRes.data.lectures);
      if (annRes.data?.success) setAnnouncements(annRes.data.announcements);
    } catch (err) {
      console.error(err);
      showToast('Error loading learning dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudentDashboard();
  }, []);

  if (loading) return <Loader />;



  // Limit listings to recent 3 items
  const recentLectures = lectures.slice(0, 3);
  const recentAnnouncements = announcements.slice(0, 3);

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Visual Welcome Banner card */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-tr from-brand-950 to-indigo-950 text-white relative overflow-hidden shadow-lg border border-brand-900 shadow-brand-500/5">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-brand-500/10 blur-3xl transform translate-x-20 -translate-y-20 pointer-events-none" />
        
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 text-brand-300 text-[10px] font-bold tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Welcome Intern</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-extrabold font-outfit leading-tight tracking-tight">
            Hi, {user.name}! Ready to learn?
          </h1>
          <p className="text-brand-200/80 text-sm max-w-2xl leading-relaxed">
            Get absolute access to your course's live streams, pre-recorded video lectures, assignments materials, and bulletin schedules.
          </p>

          {/* Assigned details badges */}
          <div className="flex flex-wrap gap-4 pt-3">
            <div className="flex items-center space-x-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm text-xs font-semibold">
              <BookOpen className="w-4 h-4 text-brand-300 shrink-0" />
              <span>Track: {user.assignedCourse?.title || 'Unassigned Track'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Link to="/student/lectures" className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/85 hover:border-brand-500/30 shadow-sm hover:shadow-md transition-all text-center space-y-3 flex flex-col items-center hover:-translate-y-1 duration-250">
          <div className="p-3 rounded-2xl bg-brand-500/10 text-brand-500 shadow-sm">
            <Video className="w-6 h-6" />
          </div>
          <span className="text-sm font-bold text-slate-700 dark:text-zinc-300 font-outfit tracking-wide">Recorded Lectures</span>
        </Link>
        <Link to="/student/resources" className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/85 hover:border-brand-500/30 shadow-sm hover:shadow-md transition-all text-center space-y-3 flex flex-col items-center hover:-translate-y-1 duration-250">
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500 shadow-sm">
            <FileDown className="w-6 h-6" />
          </div>
          <span className="text-sm font-bold text-slate-700 dark:text-zinc-300 font-outfit tracking-wide">Study Guides</span>
        </Link>
        <Link to="/student/announcements" className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/85 hover:border-brand-500/30 shadow-sm hover:shadow-md transition-all text-center space-y-3 flex flex-col items-center hover:-translate-y-1 duration-250">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 shadow-sm">
            <Megaphone className="w-6 h-6 animate-pulse-slow" />
          </div>
          <span className="text-sm font-bold text-slate-700 dark:text-zinc-300 font-outfit tracking-wide">Bulletins</span>
        </Link>
      </div>

      {/* Main Grid: Live & Lectures VS Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Section */}
        <div className="lg:col-span-8 space-y-8">
          


          {/* Recent Lectures */}
          <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 shadow-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold font-outfit text-slate-800 dark:text-zinc-150 flex items-center">
                <Video className="w-5.5 h-5.5 mr-2 text-brand-500" />
                Recent Video Lectures
              </h2>
              <Link to="/student/lectures" className="text-xs font-bold text-brand-500 hover:underline">
                View All
              </Link>
            </div>

            {recentLectures.length === 0 ? (
              <p className="text-center py-8 text-xs font-semibold text-slate-450 dark:text-zinc-500">
                No video classes recorded for your course.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {recentLectures.map((lec) => (
                  <Link
                    key={lec._id}
                    to="/student/lectures"
                    className="group space-y-2 block"
                  >
                    <div className="aspect-video relative rounded-xl bg-slate-100 dark:bg-zinc-800 overflow-hidden border border-slate-100 dark:border-zinc-850">
                      <img
                        src={lec.thumbnail}
                        alt={lec.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/5 flex items-center justify-center group-hover:bg-black/30 transition-all">
                        <PlayCircle className="w-9 h-9 text-brand-500/90 drop-shadow-md" />
                      </div>
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200 line-clamp-1 group-hover:text-brand-500 transition-colors leading-tight">
                      {lec.title}
                    </h4>
                  </Link>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Section - Announcements Bulletins */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 shadow-md flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold font-outfit text-slate-800 dark:text-zinc-150 flex items-center">
                <Megaphone className="w-5 h-5 mr-2 text-brand-500 animate-pulse" />
                Latest Bulletins
              </h2>
              <Link to="/student/announcements" className="text-xs font-bold text-brand-500 hover:underline">
                See All
              </Link>
            </div>

            {recentAnnouncements.length === 0 ? (
              <p className="text-center py-12 text-xs font-semibold text-slate-450 dark:text-zinc-550">
                No active bulletin notices.
              </p>
            ) : (
              <div className="space-y-4">
                {recentAnnouncements.map((ann) => (
                  <div
                    key={ann._id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-850/40 border border-slate-100 dark:border-zinc-800/80 space-y-2"
                  >
                    <h4 className="text-xs font-bold text-slate-850 dark:text-zinc-200">
                      {ann.title}
                    </h4>
                    <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {ann.message}
                    </p>
                    <span className="block text-[9px] font-bold text-slate-400">
                      {new Date(ann.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;

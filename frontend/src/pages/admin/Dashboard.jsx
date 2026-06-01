import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Loader from '../../components/Loader';
import { Users, GraduationCap, Video, Clock, Megaphone, CalendarRange } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        if (res.data?.success) {
          setStats(res.data.stats);
          setActivities(res.data.recentActivities || []);
        }
      } catch (error) {
        console.error('Error fetching admin dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <Loader />;

  const statCards = [
    {
      title: 'Total Students',
      value: stats?.totalStudents || 0,
      icon: Users,
      color: 'from-blue-500 to-indigo-500',
      glow: 'shadow-blue-500/10'
    },
    {
      title: 'Active Courses',
      value: stats?.totalCourses || 0,
      icon: GraduationCap,
      color: 'from-brand-500 to-purple-500',
      glow: 'shadow-brand-500/10'
    },
    {
      title: 'Recorded Lectures',
      value: stats?.totalLectures || 0,
      icon: Video,
      color: 'from-rose-500 to-pink-500',
      glow: 'shadow-rose-500/10'
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Welcome Banner */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-zinc-50 font-outfit">
          Administrative Control
        </h1>
        <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 mt-1">
          Monitor registrations, schedules, and learning materials for the ongoing internship cohorts.
        </p>
      </div>

      {/* Grid of Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 shadow-md ${card.glow} hover:-translate-y-1 transition-all duration-200`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
                  {card.title}
                </span>
                <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${card.color} text-white shadow-md shadow-slate-100/15`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              
              <div className="flex items-baseline">
                <span className="text-3xl font-extrabold font-outfit text-slate-800 dark:text-zinc-100">
                  {card.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main layout grid - Activity Timelines */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Section - Quick program overview */}
        <div className="lg:col-span-8 space-y-6">
          <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 shadow-md">
            <h2 className="text-xl font-bold font-outfit text-slate-800 dark:text-zinc-150 mb-6 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-brand-500" />
              Recent System Activity
            </h2>

            {activities.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm font-medium text-slate-400 dark:text-zinc-550">
                  No administrative actions reported recently.
                </p>
              </div>
            ) : (
              <div className="flow-root">
                <ul className="-mb-8">
                  {activities.map((act, actIdx) => (
                    <li key={actIdx}>
                      <div className="relative pb-8">
                        {actIdx !== activities.length - 1 ? (
                          <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-slate-100 dark:bg-zinc-800" aria-hidden="true" />
                        ) : null}
                        <div className="relative flex items-start space-x-3.5">
                          <div>
                            <span className={`h-10 w-10 rounded-xl flex items-center justify-center text-white ring-8 ring-white dark:ring-zinc-900 ${act.type === 'student' ? 'bg-indigo-500 shadow-md shadow-indigo-500/25' : 'bg-emerald-500 shadow-md shadow-emerald-500/25'}`}>
                              {act.type === 'student' ? <Users className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 py-1.5 flex justify-between space-x-4">
                            <p className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
                              {act.message}
                            </p>
                            <div className="text-right text-xs whitespace-nowrap text-slate-400 dark:text-zinc-500 font-semibold">
                              {new Date(act.date).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right Section - Admin bulletins card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-3xl bg-gradient-to-tr from-brand-950 to-indigo-950 text-white border border-brand-900 shadow-md shadow-brand-500/5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-brand-300 block mb-6 flex items-center">
              <Megaphone className="w-4.5 h-4.5 mr-2" />
              Administrative Alert
            </h3>
            <p className="text-sm leading-relaxed text-brand-200/90 font-medium mb-6">
              You are signed in as an administrator. You can register new student accounts, assign courses, structure courses, upload recorded lectures, upload resource sheets, and distribute announcements.
            </p>
            <div className="flex items-center space-x-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <CalendarRange className="w-5 h-5 text-brand-300 shrink-0" />
              <div className="text-xs text-brand-200/70 font-bold">
                Date: {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;

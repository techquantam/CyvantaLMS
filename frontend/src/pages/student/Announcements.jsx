import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/Loader';
import { Megaphone, Calendar } from 'lucide-react';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const { showToast } = useAuth();

  const loadAnnouncements = async () => {
    try {
      const res = await api.get('/announcements');
      if (res.data?.success) {
        setAnnouncements(res.data.announcements);
      }
    } catch (err) {
      showToast('Error loading announcements', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Intro Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-zinc-50 font-outfit">
          Program Announcements & Bulletins
        </h1>
        <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 mt-1">
          Stay updated with regular news, schedule changes, and messages from the internship administration.
        </p>
      </div>

      {/* Announcements List */}
      <div className="grid grid-cols-1 gap-6">
        {announcements.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 rounded-3xl">
            <Megaphone className="w-12 h-12 mx-auto text-slate-350 dark:text-zinc-650 mb-3 animate-pulse" />
            <p className="text-sm font-medium text-slate-400 dark:text-zinc-500">
              No bulletins published yet. Check back later!
            </p>
          </div>
        ) : (
          announcements.map((ann) => (
            <div
              key={ann._id}
              className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-150/65 dark:border-zinc-800/80 shadow-sm space-y-4 hover:shadow-md transition-all"
            >
              
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2">
                  <span className="p-1.5 rounded-lg bg-brand-500/10 text-brand-500 shrink-0">
                    <Megaphone className="w-4 h-4" />
                  </span>
                  <h3 className="text-base font-bold font-outfit text-slate-800 dark:text-zinc-150 leading-tight">
                    {ann.title}
                  </h3>
                </div>
                <div className="flex items-center text-xs font-semibold text-slate-400 dark:text-zinc-500">
                  <Calendar className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                  Posted on: <span className="ml-1 font-bold">{new Date(ann.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <p className="text-sm text-slate-650 dark:text-zinc-350 leading-relaxed font-medium whitespace-pre-line">
                {ann.message}
              </p>

            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default Announcements;

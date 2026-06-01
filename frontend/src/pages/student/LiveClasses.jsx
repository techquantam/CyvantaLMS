import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/Loader';
import { 
  Video, 
  Calendar, 
  Search, 
  Play, 
  ExternalLink,
  Clock,
  AlertCircle,
  X
} from 'lucide-react';

// Helper to extract YouTube video ID
const getYoutubeId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// Helper to get YouTube thumbnail fallback
const getYoutubeThumbnail = (url) => {
  const id = getYoutubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : null;
};

const LiveClasses = () => {
  const [liveClasses, setLiveClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeStream, setActiveStream] = useState(null);
  const { user, showToast } = useAuth();

  const loadLiveClasses = async () => {
    try {
      const res = await api.get('/live-classes');
      if (res.data?.success) {
        setLiveClasses(res.data.liveClasses);
      }
    } catch (err) {
      showToast('Error loading live schedule', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLiveClasses();
  }, []);

  const getSessionStatus = (scheduleDateStr) => {
    const scheduled = new Date(scheduleDateStr);
    const now = new Date();
    
    // Difference in milliseconds
    const diffMs = now - scheduled;
    
    // Let's assume a live stream is "Live Now" from its scheduled start time up to 2.5 hours after
    const liveWindowMs = 2.5 * 60 * 60 * 1000;

    if (diffMs >= 0 && diffMs <= liveWindowMs) {
      return { label: 'LIVE NOW', style: 'bg-rose-500 text-white animate-pulse font-extrabold' };
    } else if (diffMs < 0) {
      return { label: 'UPCOMING', style: 'bg-brand-500 text-white font-bold' };
    } else {
      return { label: 'CONCLUDED / REPLAY', style: 'bg-slate-500 text-slate-100 font-semibold' };
    }
  };

  const filteredClasses = liveClasses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    (c.courseId?.title && c.courseId.title.toLowerCase().includes(search.toLowerCase()))
  );

  const formatDate = (dateStr) => {
    const options = { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateStr).toLocaleDateString('en-US', options);
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Intro Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-zinc-50 font-outfit">
          Interactive Live Sessions
        </h1>
        <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 mt-1">
          Attend live interactive streams, ask questions in the YouTube live chat, and review scheduled sessions.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 flex items-center shadow-sm">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4.5 h-4.5" />
          </div>
          <input
            type="text"
            placeholder="Search live classes by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-55 dark:bg-zinc-850 text-slate-800 dark:text-zinc-100 text-sm focus:outline-none"
          />
        </div>
      </div>

      {/* Active student check for course assignment */}
      {!user?.assignedCourse && (
        <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-start space-x-3.5">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-amber-850 dark:text-amber-455">No Course Assigned</h4>
            <p className="text-xs text-amber-600/90 dark:text-amber-500 mt-1 leading-relaxed">
              You are currently not enrolled in any study program. Please contact the administrator to assign a course to your account to view live class schedules.
            </p>
          </div>
        </div>
      )}

      {/* Grid listing */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClasses.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 rounded-3xl">
            <Video className="w-12 h-12 mx-auto text-slate-350 dark:text-zinc-650 mb-3 animate-pulse" />
            <p className="text-sm font-medium text-slate-400 dark:text-zinc-500">
              No live classes found for your assigned course.
            </p>
          </div>
        ) : (
          filteredClasses.map((item) => {
            const ytThumb = getYoutubeThumbnail(item.youtubeLiveUrl);
            const displayThumbnail = item.thumbnailUrl || ytThumb || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600';
            const status = getSessionStatus(item.scheduleDate);
            
            return (
              <div
                key={item._id}
                className="flex flex-col rounded-3xl bg-white dark:bg-zinc-900 border border-slate-150/60 dark:border-zinc-800/80 overflow-hidden shadow-sm hover:shadow-md transition-all hover:scale-[1.01] duration-300"
              >
                {/* Image Block */}
                <div className="relative aspect-video bg-slate-900 overflow-hidden shrink-0">
                  <img 
                    src={displayThumbnail} 
                    alt={item.title} 
                    className="w-full h-full object-cover"
                  />
                  {/* Status Overlay Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 text-[10px] font-bold tracking-wider uppercase rounded-full bg-slate-950/70 text-slate-100 shadow-sm backdrop-blur-xs">
                      {item.courseId?.title || 'General'}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 text-[10px] font-extrabold tracking-wider uppercase rounded-full shadow-sm flex items-center gap-1.5 backdrop-blur-xs ${status.style}`}>
                      {status.label === 'LIVE NOW' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping shrink-0" />}
                      {status.label}
                    </span>
                  </div>
                </div>

                {/* Info and Join Block */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-base font-extrabold font-outfit text-slate-800 dark:text-zinc-150 leading-snug line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {item.description || 'Join this live session to master core topics and solve doubts interactively.'}
                    </p>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-zinc-800/80">
                    <div className="flex items-center text-xs font-semibold text-slate-600 dark:text-zinc-400">
                      <Calendar className="w-4 h-4 mr-2.5 text-slate-400 shrink-0" />
                      Starts: {formatDate(item.scheduleDate)}
                    </div>
                  </div>

                  {/* Attending Trigger */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    if (getYoutubeId(item.youtubeLiveUrl)) {
                      setActiveStream(item);
                    } else {
                      showToast('Invalid YouTube URL configured for this session', 'error');
                    }
                  }}
                  className="inline-flex items-center justify-center w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-all shadow-md shadow-brand-500/10 gap-1.5 w-full cursor-pointer"
                >
                  <Play className="w-4.5 h-4.5 fill-white" />
                  <span>{status.label === 'LIVE NOW' ? 'Join Live Stream' : 'Go to Broadcast Room'}</span>
                </button>
              </div>

                </div>
              </div>
            );
          })
        )}
      </div>

      {/* PORTAL EMBED PLAYER MODAL */}
      {activeStream && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 dark:bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-4xl rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-150 dark:border-zinc-800/80 flex items-center justify-between shrink-0">
              <div>
                <span className="px-2.5 py-0.5 text-[9px] font-extrabold uppercase rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  {activeStream.courseId?.title || 'General'}
                </span>
                <h2 className="text-lg font-bold font-outfit text-slate-800 dark:text-zinc-100 mt-1 line-clamp-1">
                  {activeStream.title}
                </h2>
              </div>
              <button 
                onClick={() => setActiveStream(null)} 
                className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-500 dark:text-zinc-400 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Container (Strictly Protected Interceptor) */}
            <div className="relative w-full aspect-video bg-black shrink-0">
              <iframe
                src={`https://www.youtube.com/embed/${getYoutubeId(activeStream.youtubeLiveUrl)}?autoplay=1&modestbranding=1&rel=0`}
                title={activeStream.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>

              {/* TRANSPARENT CLICKS INTERCEPTORS */}
              {/* 1. Header Guard (Intercepts video title redirects, share, and link clicks) */}
              <div 
                className="absolute top-0 left-0 right-0 h-16 bg-transparent cursor-default pointer-events-auto" 
                style={{ zIndex: 10 }}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              />
              
              {/* 2. Logo Guard (Intercepts bottom-right YouTube link clicks) */}
              <div 
                className="absolute bottom-0 right-0 w-32 h-14 bg-transparent cursor-default pointer-events-auto" 
                style={{ zIndex: 10 }}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              />
            </div>

            {/* Modal Footer Description */}
            <div className="p-6 bg-slate-50 dark:bg-zinc-900/50 border-t border-slate-100 dark:border-zinc-800/80 overflow-y-auto">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1.5">Syllabus & Info</h4>
              <p className="text-xs text-slate-650 dark:text-zinc-400 leading-relaxed">
                {activeStream.description || 'Welcome to this interactive live lecture. Please follow along and master core topics dynamically. Happy learning!'}
              </p>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default LiveClasses;

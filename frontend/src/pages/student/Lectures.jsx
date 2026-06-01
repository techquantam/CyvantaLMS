import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/Loader';
import { PlayCircle, Search, Video, FileText, ChevronRight, VideoOff, History } from 'lucide-react';

const Lectures = () => {
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedLecture, setSelectedLecture] = useState(null);
  
  // Local browser watch history state
  const [historyIds, setHistoryIds] = useState(() => {
    try {
      const saved = localStorage.getItem('lms_watch_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const { showToast } = useAuth();

  const loadLectures = async () => {
    try {
      const res = await api.get('/lectures');
      if (res.data?.success) {
        setLectures(res.data.lectures);
        if (res.data.lectures.length > 0) {
          setSelectedLecture(res.data.lectures[0]);
        }
      }
    } catch (err) {
      showToast('Error loading lecture materials', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLectures();
  }, []);

  // Update localStorage watch history when a lecture is opened
  const handleSelectLecture = (lecture) => {
    setSelectedLecture(lecture);
    
    // Manage history IDs
    const updated = [lecture._id, ...historyIds.filter(id => id !== lecture._id)].slice(0, 5);
    setHistoryIds(updated);
    localStorage.setItem('lms_watch_history', JSON.stringify(updated));
  };

  const getEmbedUrl = (url) => {
    if (!url) return '';
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3` : '';
  };

  // Filters logic
  const filteredLectures = lectures.filter(
    (l) =>
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      (l.description && l.description.toLowerCase().includes(search.toLowerCase()))
  );

  // Parse watch history items
  const historyLectures = historyIds
    .map(id => lectures.find(l => l._id === id))
    .filter(Boolean);

  if (loading) return <Loader />;

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Intro Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-zinc-50 font-outfit">
          Recorded Lectures
        </h1>
        <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 mt-1">
          Review previous study video recordings, search by topics, and trace your learning history.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column - Theater Embed Screen */}
        <div className="lg:col-span-8 space-y-6">
          {selectedLecture ? (
            <div className="space-y-4">
              
              {/* Aspect IFrame */}
              <div className="aspect-video w-full rounded-3xl bg-slate-900 overflow-hidden shadow-lg border border-slate-100 dark:border-zinc-800 relative">
                <iframe
                  title={selectedLecture.title}
                  src={getEmbedUrl(selectedLecture.youtubeVideoUrl)}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
                
                {/* Transparent Top Header Overlay (Blocks Title Link & Share) */}
                <div className="absolute top-0 left-0 right-0 h-16 bg-transparent cursor-default z-10" />
                
                {/* Transparent Bottom Right Overlay (Blocks YouTube Logo Link) */}
                <div className="absolute bottom-0 right-0 w-28 h-12 bg-transparent cursor-default z-10" />
              </div>

              {/* Lecture Details card */}
              <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-150/60 dark:border-zinc-800/80 shadow-sm space-y-4">
                <div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded bg-brand-500/10 text-brand-600 dark:text-brand-400 text-[10px] font-bold uppercase tracking-wider">
                    Theater Screen Mode
                  </span>
                  <h2 className="text-xl font-extrabold font-outfit text-slate-800 dark:text-zinc-150 mt-2">
                    {selectedLecture.title}
                  </h2>
                </div>

                {selectedLecture.description && (
                  <p className="text-xs leading-relaxed text-slate-500 dark:text-zinc-400 font-medium whitespace-pre-line pt-2 border-t border-slate-100 dark:border-zinc-800/80">
                    {selectedLecture.description}
                  </p>
                )}
              </div>

            </div>
          ) : (
            <div className="py-24 text-center rounded-3xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-850">
              <VideoOff className="w-12 h-12 mx-auto text-slate-300 dark:text-zinc-650 mb-3 animate-pulse" />
              <p className="text-sm font-semibold text-slate-450 dark:text-zinc-550">
                No recorded videos catalogued for your course yet.
              </p>
            </div>
          )}
        </div>

        {/* Right Column - search and playlists panel */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Watch list & search card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-150/60 dark:border-zinc-800/80 shadow-md space-y-4">
            
            <h3 className="text-sm font-bold font-outfit text-slate-800 dark:text-zinc-200 flex items-center">
              <Video className="w-4.5 h-4.5 mr-2 text-brand-500" />
              Lectures Index
            </h3>

            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-450">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search lectures..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-850 text-slate-800 dark:text-zinc-150 text-xs focus:outline-none"
              />
            </div>

            {/* Lectures Listings */}
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {filteredLectures.length === 0 ? (
                <p className="text-[11px] text-slate-400 font-semibold py-4 text-center">No matching videos.</p>
              ) : (
                filteredLectures.map((lec) => {
                  const isSelected = selectedLecture?._id === lcID(lec);
                  return (
                    <button
                      key={lec._id}
                      onClick={() => handleSelectLecture(lec)}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex items-start space-x-2.5 ${isSelected ? 'border-brand-500/30 bg-brand-500/5 dark:bg-brand-950/10' : 'border-slate-100 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-850/60'}`}
                    >
                      <PlayCircle className={`w-4.5 h-4.5 shrink-0 mt-0.5 ${isSelected ? 'text-brand-500' : 'text-slate-400'}`} />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-slate-850 dark:text-zinc-200 line-clamp-1 leading-tight">
                          {lec.title}
                        </h4>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-350 dark:text-zinc-650 self-center shrink-0" />
                    </button>
                  );
                })
              )}
            </div>

          </div>

          {/* Recently Viewed Panel */}
          {historyLectures.length > 0 && (
            <div className="p-6 rounded-3xl bg-slate-100 dark:bg-zinc-900/50 border border-slate-200/40 dark:border-zinc-800/80 shadow-sm space-y-4">
              <h3 className="text-xs font-bold font-outfit text-slate-600 dark:text-zinc-350 uppercase tracking-widest flex items-center">
                <History className="w-4 h-4 mr-2 text-slate-450" />
                Recently Watched
              </h3>
              
              <div className="space-y-2">
                {historyLectures.map((lec) => (
                  <button
                    key={`hist-${lec._id}`}
                    onClick={() => handleSelectLecture(lec)}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-white dark:hover:bg-zinc-850 flex items-center justify-between text-xs transition-all border border-transparent hover:border-slate-100 dark:hover:border-zinc-800/60"
                  >
                    <span className="font-semibold text-slate-700 dark:text-zinc-350 truncate pr-2">
                      {lec.title}
                    </span>
                    <PlayCircle className="w-4 h-4 text-slate-400 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

// Safe selector helper
const lcID = (lc) => lc?._id;

export default Lectures;

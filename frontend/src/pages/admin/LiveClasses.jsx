import React, { useState, useEffect } from 'react';
import api, { BACKEND_URL } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/Loader';
import { 
  Plus, 
  Trash2, 
  X, 
  Video, 
  Calendar, 
  Youtube, 
  Search, 
  Play, 
  Image as ImageIcon, 
  CheckCircle2, 
  XCircle,
  ToggleLeft,
  ToggleRight,
  ExternalLink
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
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [youtubeLiveUrl, setYoutubeLiveUrl] = useState('');
  const [courseId, setCourseId] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  
  // Custom thumbnail states
  const [thumbnailImage, setThumbnailImage] = useState(null);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const { showToast } = useAuth();

  const loadData = async () => {
    try {
      const [liveRes, courseRes] = await Promise.all([
        api.get('/live-classes'),
        api.get('/courses')
      ]);
      if (liveRes.data?.success) setLiveClasses(liveRes.data.liveClasses);
      if (courseRes.data?.success) setCourses(courseRes.data.courses);
    } catch (err) {
      showToast('Error loading live session records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data?.success) {
        let finalUrl = res.data.url;
        // Prepend backend URL if the path returned is local (like /uploads/...)
        if (finalUrl.startsWith('/uploads')) {
          finalUrl = `${BACKEND_URL}${finalUrl}`;
        }
        setThumbnailUrl(finalUrl);
        showToast('Thumbnail uploaded successfully!');
      }
    } catch (err) {
      showToast('Error uploading image', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();

    if (!title || !youtubeLiveUrl || !courseId || !scheduleDate) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    // Extract custom or fallback thumbnail URL
    const finalThumbnailUrl = thumbnailUrl || getYoutubeThumbnail(youtubeLiveUrl) || '';

    try {
      const res = await api.post('/live-classes', {
        title,
        description,
        youtubeLiveUrl,
        courseId,
        scheduleDate,
        thumbnailUrl: finalThumbnailUrl
      });

      if (res.data?.success) {
        showToast('Live stream scheduled successfully!');
        setShowAddModal(false);
        // Reset form
        setTitle('');
        setDescription('');
        setYoutubeLiveUrl('');
        setCourseId('');
        setScheduleDate('');
        setThumbnailUrl('');
        setThumbnailImage(null);
        loadData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error scheduling live class', 'error');
    }
  };

  const toggleStatus = async (liveClass) => {
    try {
      const updatedStatus = !liveClass.isActive;
      const res = await api.patch(`/live-classes/${liveClass._id}/status`, {
        isActive: updatedStatus
      });

      if (res.data?.success) {
        showToast(`Stream ${updatedStatus ? 'Activated' : 'Suspended'}`);
        setLiveClasses(prev =>
          prev.map(item => (item._id === liveClass._id ? { ...item, isActive: updatedStatus } : item))
        );
      }
    } catch (err) {
      showToast('Failed to update class status', 'error');
    }
  };

  const handleDelete = async (liveClass) => {
    if (window.confirm(`Are you sure you want to cancel the scheduled live class "${liveClass.title}"?`)) {
      try {
        const res = await api.delete(`/live-classes/${liveClass._id}`);
        if (res.data?.success) {
          showToast('Live class cancelled successfully');
          setLiveClasses(prev => prev.filter(item => item._id !== liveClass._id));
        }
      } catch (err) {
        showToast('Failed to delete live class', 'error');
      }
    }
  };

  const handleConclude = async (liveClass) => {
    if (window.confirm(`Are you sure you want to conclude the live class "${liveClass.title}"?\n\nThis will end the live session, remove it from the "Live Classes" listing, and automatically save its replay as a video in the "Recorded Lectures" section.`)) {
      try {
        const res = await api.post(`/live-classes/${liveClass._id}/conclude`);
        if (res.data?.success) {
          showToast('Live class concluded! Replay saved to Recorded Lectures successfully.');
          setLiveClasses(prev => prev.filter(item => item._id !== liveClass._id));
        }
      } catch (err) {
        showToast(err.response?.data?.message || 'Error concluding live session', 'error');
      }
    }
  };

  const filteredClasses = liveClasses.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.courseId?.title && c.courseId.title.toLowerCase().includes(searchQuery.toLowerCase()))
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
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-zinc-50 font-outfit">
            Live Stream Broadcasts
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 mt-1">
            Schedule YouTube Live lessons, customize high-definition thumbnails, map them to courses, and control active streams.
          </p>
        </div>

        <button
          onClick={() => {
            setTitle('');
            setDescription('');
            setYoutubeLiveUrl('');
            setCourseId('');
            setScheduleDate('');
            setThumbnailUrl('');
            setShowAddModal(true);
          }}
          className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold shadow-md shadow-brand-500/20 transition-all self-start sm:self-center shrink-0"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Schedule Live Class
        </button>
      </div>

      {/* Filtering and Search */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 flex items-center shadow-sm">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4.5 h-4.5" />
          </div>
          <input
            type="text"
            placeholder="Search live classes by title or course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-55 dark:bg-zinc-850 text-slate-800 dark:text-zinc-100 text-sm focus:outline-none"
          />
        </div>
      </div>

      {/* Broadcast Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClasses.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 rounded-3xl">
            <Video className="w-12 h-12 mx-auto text-slate-350 dark:text-zinc-650 mb-3 animate-pulse" />
            <p className="text-sm font-medium text-slate-400 dark:text-zinc-500">
              No live classes scheduled. Click "Schedule Live Class" to launch your first session.
            </p>
          </div>
        ) : (
          filteredClasses.map((item) => {
            const ytThumb = getYoutubeThumbnail(item.youtubeLiveUrl);
            const displayThumbnail = item.thumbnailUrl || ytThumb || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600';
            
            return (
              <div
                key={item._id}
                className="flex flex-col rounded-3xl bg-white dark:bg-zinc-900 border border-slate-150/60 dark:border-zinc-800/80 overflow-hidden shadow-sm hover:shadow-md transition-all hover:scale-[1.01] duration-300"
              >
                {/* Thumbnail Block */}
                <div className="relative aspect-video bg-slate-900 overflow-hidden shrink-0">
                  <img 
                    src={displayThumbnail} 
                    alt={item.title} 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  {/* Glassmorphism badges */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="px-3 py-1 text-[10px] font-bold tracking-wider uppercase rounded-full bg-indigo-600/90 text-white shadow-sm backdrop-blur-xs">
                      {item.courseId?.title || 'General'}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 text-[10px] font-extrabold tracking-wider uppercase rounded-full shadow-sm flex items-center gap-1 backdrop-blur-xs ${item.isActive ? 'bg-emerald-500/90 text-white' : 'bg-slate-700/90 text-slate-200'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${item.isActive ? 'bg-white animate-ping' : 'bg-slate-400'}`} />
                      {item.isActive ? 'Active' : 'Suspended'}
                    </span>
                  </div>
                </div>

                {/* Card Info */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-base font-extrabold font-outfit text-slate-800 dark:text-zinc-150 leading-snug line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {item.description || 'No description provided for this session.'}
                    </p>
                  </div>

                  <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-zinc-800/80">
                    <div className="flex items-center text-xs font-semibold text-slate-600 dark:text-zinc-400">
                      <Calendar className="w-4 h-4 mr-2 text-slate-400 shrink-0" />
                      {formatDate(item.scheduleDate)}
                    </div>
                    <div className="flex items-center text-xs font-semibold text-brand-600 dark:text-brand-400">
                      <Youtube className="w-4 h-4 mr-2 text-rose-500 shrink-0" />
                      YouTube Broadcast URL
                    </div>
                    
                    {/* Conclude Action */}
                    <button
                      onClick={() => handleConclude(item)}
                      className="w-full mt-3 py-2 px-4 rounded-xl border border-emerald-500/25 hover:border-emerald-500/45 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      title="Conclude live session and permanently save as Recorded Lecture"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 animate-pulse" />
                      Conclude & Save Replay
                    </button>
                  </div>

                  {/* Actions Deck */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-zinc-800/80">
                    {/* Toggle Activation Switch */}
                    <button
                      onClick={() => toggleStatus(item)}
                      className="inline-flex items-center text-xs font-bold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 transition-all gap-1.5"
                    >
                      {item.isActive ? (
                        <>
                          <ToggleRight className="w-6 h-6 text-brand-500" />
                          <span>Active</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-6 h-6 text-slate-400" />
                          <span>Suspended</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center space-x-2">
                      <a
                        href={item.youtubeLiveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 border border-rose-500/10 hover:border-rose-500/25 transition-all"
                        title="Open Stream Link"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleDelete(item)}
                        className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 border border-rose-500/10 hover:border-rose-500/25 transition-all"
                        title="Delete Session"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

      {/* SCHEDULE BROADCAST MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/20 dark:bg-black/55 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg p-6 md:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 shadow-2xl animate-scale-up overflow-y-auto max-h-[90vh]">
            
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold font-outfit text-slate-800 dark:text-zinc-100">Schedule New Live Stream</h2>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">Class Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AutoCAD Live Interactive Drawing Session"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-55 dark:bg-zinc-850 text-slate-800 dark:text-zinc-100 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">Associate Course</label>
                <select
                  required
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-55 dark:bg-zinc-850 text-slate-850 dark:text-zinc-155 text-sm focus:outline-none"
                >
                  <option value="">Select Course Mapping</option>
                  {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">Schedule Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-55 dark:bg-zinc-850 text-slate-850 dark:text-zinc-155 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">YouTube URL</label>
                  <input
                    type="url"
                    required
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={youtubeLiveUrl}
                    onChange={(e) => setYoutubeLiveUrl(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-55 dark:bg-zinc-850 text-slate-800 dark:text-zinc-100 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">Description / Streaming Syllabus</label>
                <textarea
                  placeholder="Details of what students will master during this live livestream..."
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-55 dark:bg-zinc-850 text-slate-800 dark:text-zinc-100 text-sm focus:outline-none resize-none"
                />
              </div>

              {/* Thumbnail Selector Area */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">
                  Session Cover Thumbnail
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-full sm:w-1/3 aspect-video bg-slate-100 dark:bg-zinc-800 rounded-xl border border-dashed border-slate-300 dark:border-zinc-700 flex items-center justify-center overflow-hidden shrink-0">
                    {uploadingImage ? (
                      <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                    ) : thumbnailUrl ? (
                      <img src={thumbnailUrl} alt="Thumbnail preview" className="w-full h-full object-cover" />
                    ) : getYoutubeId(youtubeLiveUrl) ? (
                      <img src={getYoutubeThumbnail(youtubeLiveUrl)} alt="YouTube default preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-slate-400" />
                    )}
                  </div>
                  
                  <div className="w-full flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                      id="thumbnail-upload"
                    />
                    <label
                      htmlFor="thumbnail-upload"
                      className="inline-flex items-center px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-all cursor-pointer"
                    >
                      Choose Custom Thumbnail
                    </label>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-2 leading-relaxed">
                      *Optional: If skipped, we'll automatically fetch the high-definition preview card directly from your YouTube Live URL!
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-zinc-800/80">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-550 hover:bg-slate-50 text-sm font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingImage}
                  className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold shadow-md shadow-brand-500/10 transition-all flex items-center"
                >
                  Schedule Stream
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default LiveClasses;

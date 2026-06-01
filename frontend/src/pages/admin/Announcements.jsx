import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/Loader';
import { Plus, Edit3, Trash2, X, Megaphone, Calendar } from 'lucide-react';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAnn, setSelectedAnn] = useState(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

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

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/announcements', { title, message });
      if (res.data?.success) {
        showToast('Announcement posted successfully!');
        setShowAddModal(false);
        setTitle('');
        setMessage('');
        loadAnnouncements();
      }
    } catch (err) {
      showToast('Error creating announcement', 'error');
    }
  };

  const handleEditClick = (ann) => {
    setSelectedAnn(ann);
    setTitle(ann.title);
    setMessage(ann.message);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/announcements/${selectedAnn._id}`, { title, message });
      if (res.data?.success) {
        showToast('Announcement updated successfully!');
        setShowEditModal(false);
        loadAnnouncements();
      }
    } catch (err) {
      showToast('Error updating announcement', 'error');
    }
  };

  const handleDeleteClick = async (ann) => {
    if (window.confirm(`Are you sure you want to delete the announcement "${ann.title}"?`)) {
      try {
        const res = await api.delete(`/announcements/${ann._id}`);
        if (res.data?.success) {
          showToast('Announcement deleted successfully');
          setAnnouncements(prev => prev.filter(a => a._id !== ann._id));
        }
      } catch (err) {
        showToast('Failed to delete announcement', 'error');
      }
    }
  };

  if (loading && announcements.length === 0) return <Loader />;

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-zinc-50 font-outfit">
            System Bulletins
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 mt-1">
            Publish system-wide notifications and internship schedules visible on student dashboards.
          </p>
        </div>

        <button
          onClick={() => {
            setTitle('');
            setMessage('');
            setShowAddModal(true);
          }}
          className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold shadow-md shadow-brand-500/20 transition-all self-start sm:self-center"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Create Announcement
        </button>
      </div>

      {/* Grid listing */}
      <div className="grid grid-cols-1 gap-6">
        {announcements.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 rounded-3xl">
            <Megaphone className="w-12 h-12 mx-auto text-slate-350 dark:text-zinc-650 mb-3 animate-pulse" />
            <p className="text-sm font-medium text-slate-400 dark:text-zinc-500">
              No bulletins published yet. Click "Create Announcement" above to post one.
            </p>
          </div>
        ) : (
          announcements.map((ann) => (
            <div
              key={ann._id}
              className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-150/60 dark:border-zinc-800/80 shadow-sm space-y-4 hover:shadow-md transition-all"
            >
              
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
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

                {/* Actions row */}
                <div className="flex items-center space-x-1.5 self-end sm:self-start">
                  <button
                    onClick={() => handleEditClick(ann)}
                    className="p-2 rounded-xl text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-100 dark:border-zinc-850 hover:border-slate-300 transition-all"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(ann)}
                    className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 border border-rose-500/10 hover:border-rose-500/25 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-slate-650 dark:text-zinc-350 leading-relaxed font-medium whitespace-pre-line">
                {ann.message}
              </p>

            </div>
          ))
        )}
      </div>

      {/* ADD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/20 dark:bg-black/55 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg p-6 md:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 shadow-2xl animate-scale-up">
            
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold font-outfit text-slate-800 dark:text-zinc-100">Create Bulletin</h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-5">
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">Bulletin Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AutoCAD Training Shift Details"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-55 dark:bg-zinc-850 text-slate-800 dark:text-zinc-100 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">Message Bulletin</label>
                <textarea
                  required
                  rows="5"
                  placeholder="Write the details here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-55 dark:bg-zinc-850 text-slate-800 dark:text-zinc-100 text-sm focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-500 hover:bg-slate-50 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold shadow-md"
                >
                  Publish Announcement
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/20 dark:bg-black/55 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg p-6 md:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 shadow-2xl animate-scale-up">
            
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold font-outfit text-slate-800 dark:text-zinc-100">Edit Announcement</h2>
              <button onClick={() => setShowEditModal(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-5">
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">Bulletin Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AutoCAD Training Shift Details"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-55 dark:bg-zinc-850 text-slate-800 dark:text-zinc-100 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">Message Bulletin</label>
                <textarea
                  required
                  rows="5"
                  placeholder="Write the details here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-55 dark:bg-zinc-850 text-slate-800 dark:text-zinc-100 text-sm focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-500 hover:bg-slate-50 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold shadow-md"
                >
                  Save Changes
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Announcements;

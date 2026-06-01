import React, { useState, useEffect } from 'react';
import api, { BACKEND_URL } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/Loader';
import { Plus, Trash2, X, FileDown, BookOpen, FileText } from 'lucide-react';

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const { showToast } = useAuth();

  const loadData = async () => {
    try {
      const [resRes, crsRes] = await Promise.all([
        api.get('/resources'),
        api.get('/courses'),
      ]);
      if (resRes.data?.success) setResources(resRes.data.resources);
      if (crsRes.data?.success) setCourses(crsRes.data.courses);
    } catch (err) {
      showToast('Error loading study materials', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      showToast('Please select a file to upload', 'error');
      return;
    }

    setUploading(true);
    
    // Construct multi-part Form Data
    const formData = new FormData();
    formData.append('title', title);
    formData.append('courseId', courseId);
    formData.append('file', file);

    try {
      const res = await api.post('/resources', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (res.data?.success) {
        showToast('Study guide uploaded successfully!');
        setShowAddModal(false);
        setTitle('');
        setCourseId('');
        setFile(null);
        loadData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error uploading file', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteClick = async (resource) => {
    if (window.confirm(`Are you sure you want to permanently delete the study file "${resource.title}"?`)) {
      try {
        const res = await api.delete(`/resources/${resource._id}`);
        if (res.data?.success) {
          showToast('Study resource deleted successfully');
          setResources(prev => prev.filter(r => r._id !== resource._id));
        }
      } catch (err) {
        showToast('Failed to delete resource', 'error');
      }
    }
  };

  if (loading && resources.length === 0) return <Loader />;

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-zinc-50 font-outfit">
            Study Resource Bank
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 mt-1">
            Upload PDF guidelines, training handouts, or reference files and match them to appropriate courses.
          </p>
        </div>

        <button
          onClick={() => {
            setTitle('');
            setCourseId('');
            setFile(null);
            setShowAddModal(true);
          }}
          className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold shadow-md shadow-brand-500/20 transition-all self-start sm:self-center"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Upload Material
        </button>
      </div>

      {/* Resource Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 rounded-3xl">
            <FileText className="w-12 h-12 mx-auto text-slate-350 dark:text-zinc-650 mb-3 animate-pulse" />
            <p className="text-sm font-medium text-slate-400 dark:text-zinc-500">
              No study guides catalogued. Click "Upload Material" above to share one.
            </p>
          </div>
        ) : (
          resources.map((resource) => (
            <div
              key={resource._id}
              className="flex flex-col rounded-3xl bg-white dark:bg-zinc-900 border border-slate-150/60 dark:border-zinc-800/80 overflow-hidden shadow-sm hover:shadow-md transition-all p-6 space-y-4 justify-between"
            >
              
              <div className="space-y-3.5">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold font-outfit text-slate-800 dark:text-zinc-150 leading-tight">
                    {resource.title}
                  </h3>
                </div>

                <div className="space-y-2 text-xs font-semibold text-slate-500 dark:text-zinc-400">
                  <div className="flex items-center">
                    <BookOpen className="w-4 h-4 mr-2.5 text-slate-400 shrink-0" />
                    Course: <span className="ml-1 text-slate-800 dark:text-zinc-200">{resource.courseId?.title || 'General'}</span>
                  </div>
                </div>
              </div>

              {/* Actions row */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-zinc-800/80">
                <a
                  href={resource.fileUrl.startsWith('http') ? resource.fileUrl : `${BACKEND_URL}${resource.fileUrl}`}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 hover:underline"
                >
                  <FileDown className="w-4 h-4 mr-1.5" />
                  Download File
                </a>
                
                <button
                  onClick={() => handleDeleteClick(resource)}
                  className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 border border-rose-500/10 hover:border-rose-500/25 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          ))
        )}
      </div>

      {/* ADD UPLOAD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/20 dark:bg-black/55 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg p-6 md:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 shadow-2xl animate-scale-up">
            
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold font-outfit text-slate-800 dark:text-zinc-100">Upload Study Material</h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-5">
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">Resource Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AutoCAD Keyboard Shortcuts"
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
                  <option value="">Select Course</option>
                  {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">Upload File (PDF / Documents)</label>
                <input
                  type="file"
                  required
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-55 dark:bg-zinc-850 text-slate-850 dark:text-zinc-155 text-sm focus:outline-none file:mr-4 file:py-1 file:px-3.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-500 file:text-white file:cursor-pointer"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-500 hover:bg-slate-50 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:bg-brand-500/60 text-white text-sm font-semibold shadow-md flex items-center"
                >
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Uploading...
                    </>
                  ) : (
                    'Upload & Publish'
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Resources;

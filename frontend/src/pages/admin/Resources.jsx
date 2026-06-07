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
  const [selectedCourseId, setSelectedCourseId] = useState('all');

  // Form Fields
  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const { showToast } = useAuth();

  const [downloadingId, setDownloadingId] = useState(null);

  const handleDownload = async (resource) => {
    setDownloadingId(resource._id);
    try {
      const res = await api.get(`/resources/${resource._id}/download`, {
        responseType: 'blob',
      });
      
      const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = blobUrl;
      
      const extension = resource.fileUrl.split('.').pop() || 'pdf';
      const cleanTitle = resource.title.replace(/[^a-zA-Z0-9]/g, '_');
      link.setAttribute('download', `${cleanTitle}.${extension}`);
      
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error(err);
      showToast('Error downloading study material', 'error');
    } finally {
      setDownloadingId(null);
    }
  };

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

  const getResourceCount = (cId) => {
    return resources.filter(r => r.courseId?._id === cId).length;
  };

  const filteredResources = selectedCourseId === 'all'
    ? resources
    : resources.filter(r => r.courseId?._id === selectedCourseId);

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
            setCourseId(selectedCourseId !== 'all' ? selectedCourseId : '');
            setFile(null);
            setShowAddModal(true);
          }}
          className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold shadow-md shadow-brand-500/20 transition-all self-start sm:self-center shrink-0"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Upload Material
        </button>
      </div>

      {/* Split Content View */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Playlists / Courses Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-150/60 dark:border-zinc-800/80 shadow-sm space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              Course Playlists
            </h2>
            
            {/* Desktop vertical list, Mobile horizontal scroll */}
            <div className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible gap-2 pb-2 lg:pb-0 scrollbar-none snap-x">
              
              {/* All Playlists tab */}
              <button
                onClick={() => setSelectedCourseId('all')}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all shrink-0 snap-align-start lg:w-full text-left border ${
                  selectedCourseId === 'all'
                    ? 'bg-brand-500/10 dark:bg-brand-500/20 border-brand-500 text-brand-600 dark:text-brand-400'
                    : 'bg-transparent border-transparent text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/40 hover:text-slate-800 dark:hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <BookOpen className="w-4 h-4 shrink-0" />
                  <span>All Resources</span>
                </div>
                <span className={`ml-3 px-2 py-0.5 rounded-full text-xs font-bold ${
                  selectedCourseId === 'all'
                    ? 'bg-brand-500/20 text-brand-600 dark:text-brand-400'
                    : 'bg-slate-100 dark:bg-zinc-850 text-slate-500 dark:text-zinc-400'
                }`}>
                  {resources.length}
                </span>
              </button>

              {/* Course list items */}
              {courses.map((course) => {
                const count = getResourceCount(course._id);
                const isActive = selectedCourseId === course._id;
                return (
                  <button
                    key={course._id}
                    onClick={() => setSelectedCourseId(course._id)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all shrink-0 snap-align-start lg:w-full text-left border ${
                      isActive
                        ? 'bg-brand-500/10 dark:bg-brand-500/20 border-brand-500 text-brand-600 dark:text-brand-400'
                        : 'bg-transparent border-transparent text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/40 hover:text-slate-800 dark:hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <BookOpen className="w-4 h-4 shrink-0" />
                      <span className="truncate max-w-[120px] lg:max-w-none">{course.title}</span>
                    </div>
                    <span className={`ml-3 px-2 py-0.5 rounded-full text-xs font-bold shrink-0 ${
                      isActive
                        ? 'bg-brand-500/20 text-brand-600 dark:text-brand-400'
                        : 'bg-slate-100 dark:bg-zinc-850 text-slate-500 dark:text-zinc-400'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}

            </div>
          </div>
        </div>

        {/* Resources Cards Grid */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold font-outfit text-slate-800 dark:text-zinc-150">
              {selectedCourseId === 'all' 
                ? 'All Uploaded Materials' 
                : `${courses.find(c => c._id === selectedCourseId)?.title || 'Selected'} Playlist`
              }
            </h3>
            {selectedCourseId !== 'all' && (
              <button 
                onClick={() => setSelectedCourseId('all')}
                className="text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
              >
                Clear filter
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredResources.length === 0 ? (
              <div className="col-span-full text-center py-20 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 rounded-3xl p-6">
                <FileText className="w-12 h-12 mx-auto text-slate-350 dark:text-zinc-650 mb-3 animate-pulse" />
                <p className="text-sm font-semibold text-slate-500 dark:text-zinc-400">
                  {selectedCourseId === 'all'
                    ? 'No study guides catalogued. Click "Upload Material" above to share one.'
                    : `No study guides catalogued in the ${courses.find(c => c._id === selectedCourseId)?.title || ''} playlist.`
                  }
                </p>
                {selectedCourseId !== 'all' && (
                  <button
                    onClick={() => {
                      setTitle('');
                      setCourseId(selectedCourseId);
                      setFile(null);
                      setShowAddModal(true);
                    }}
                    className="mt-4 inline-flex items-center justify-center px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold shadow-sm transition-all"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Add First Resource
                  </button>
                )}
              </div>
            ) : (
              filteredResources.map((resource) => (
                <div
                  key={resource._id}
                  className="flex flex-col rounded-3xl bg-white dark:bg-zinc-900 border border-slate-150/60 dark:border-zinc-800/80 overflow-hidden shadow-sm hover:shadow-md transition-all p-6 space-y-4 justify-between animate-scale-up"
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
                    <button
                      onClick={() => handleDownload(resource)}
                      disabled={downloadingId === resource._id}
                      className="inline-flex items-center text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 hover:underline disabled:opacity-75"
                    >
                      {downloadingId === resource._id ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-brand-600 dark:border-brand-400 border-t-transparent rounded-full animate-spin mr-1.5" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <FileDown className="w-4 h-4 mr-1.5" />
                          Download File
                        </>
                      )}
                    </button>
                    
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
        </div>

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
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-55 dark:bg-zinc-850 text-slate-855 dark:text-zinc-155 text-sm focus:outline-none file:mr-4 file:py-1 file:px-3.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-500 file:text-white file:cursor-pointer"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-500 hover:bg-slate-55 text-sm font-semibold"
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

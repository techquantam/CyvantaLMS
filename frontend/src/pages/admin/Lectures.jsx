import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/Loader';
import { Plus, Edit3, Trash2, X, Video, BookOpen, Layers, Link, ChevronLeft, FolderOpen, Play } from 'lucide-react';

const Lectures = () => {
  const [lectures, setLectures] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [activeCourseId, setActiveCourseId] = useState(null);

  // Form Fields
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    youtubeVideoUrl: '',
    courseId: '',
    thumbnail: '',
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const { showToast } = useAuth();

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    const uploadData = new FormData();
    uploadData.append('image', file);

    try {
      const res = await api.post('/upload/image', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (res.data?.success) {
        setFormData(prev => ({ ...prev, thumbnail: res.data.url }));
        showToast('Image uploaded and compressed successfully!');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error uploading to Cloudinary. Check your credentials.', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const loadData = async () => {
    try {
      const [lecRes, crsRes] = await Promise.all([
        api.get('/lectures'),
        api.get('/courses'),
      ]);
      if (lecRes.data?.success) setLectures(lecRes.data.lectures);
      if (crsRes.data?.success) setCourses(crsRes.data.courses);
    } catch (err) {
      showToast('Error loading lectures content', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/lectures', formData);
      if (res.data?.success) {
        showToast('Recorded lecture added successfully!');
        setShowAddModal(false);
        setFormData({ title: '', description: '', youtubeVideoUrl: '', courseId: '', thumbnail: '' });
        loadData();
      }
    } catch (err) {
      showToast('Error creating lecture', 'error');
    }
  };

  const handleEditClick = (lecture) => {
    setSelectedLecture(lecture);
    setFormData({
      title: lecture.title,
      description: lecture.description || '',
      youtubeVideoUrl: lecture.youtubeVideoUrl,
      courseId: lecture.courseId?._id || '',
      thumbnail: lecture.thumbnail || '',
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/lectures/${selectedLecture._id}`, formData);
      if (res.data?.success) {
        showToast('Recorded lecture updated successfully!');
        setShowEditModal(false);
        loadData();
      }
    } catch (err) {
      showToast('Error updating lecture details', 'error');
    }
  };

  const handleDeleteClick = async (lecture) => {
    if (window.confirm(`Are you sure you want to delete the recorded lecture "${lecture.title}"?`)) {
      try {
        const res = await api.delete(`/lectures/${lecture._id}`);
        if (res.data?.success) {
          showToast('Lecture deleted successfully');
          setLectures(prev => prev.filter(l => l._id !== lecture._id));
        }
      } catch (err) {
        showToast('Failed to delete lecture', 'error');
      }
    }
  };



  if (loading && lectures.length === 0) return <Loader />;

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {activeCourseId ? (
          <div className="space-y-1">
            <button
              onClick={() => setActiveCourseId(null)}
              className="inline-flex items-center text-xs font-bold text-slate-500 dark:text-zinc-400 hover:text-brand-500 transition-colors mb-1.5"
            >
              <ChevronLeft className="w-4 h-4 mr-0.5" />
              Back to Playlists
            </button>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-zinc-50 font-outfit">
              {courses.find(c => c._id === activeCourseId)?.title} Playlist
            </h1>
            <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 mt-0.5">
              Manage pre-recorded lecture clips and instructions inside this course track.
            </p>
          </div>
        ) : (
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-zinc-50 font-outfit">
              Course Playlists
            </h1>
            <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 mt-1">
              Select a course track folder to organize and manage its structured video learning materials.
            </p>
          </div>
        )}

        <button
          onClick={() => {
            setFormData({ title: '', description: '', youtubeVideoUrl: '', courseId: activeCourseId || '', thumbnail: '' });
            setShowAddModal(true);
          }}
          className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold shadow-md shadow-brand-500/20 transition-all self-start sm:self-center shrink-0"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Lecture
        </button>
      </div>

      {/* Dynamic Workspace Container */}
      {!activeCourseId ? (
        /* PLAYLISTS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-2">
          {courses.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 rounded-3xl">
              <FolderOpen className="w-12 h-12 mx-auto text-slate-350 dark:text-zinc-650 mb-3 animate-pulse" />
              <p className="text-sm font-medium text-slate-400 dark:text-zinc-500">
                No course tracks found. Create a course first under "Courses" menu to add video playlists!
              </p>
            </div>
          ) : (
            courses.map((course) => {
              const courseLecs = lectures.filter(l => l.courseId?._id === course._id);
              
              return (
                <div key={course._id} className="relative group">
                  {/* Visual Playlist Deck Stack Underlayers */}
                  <div className="absolute inset-0 bg-slate-200/60 dark:bg-zinc-800/50 rounded-3xl transform translate-x-2.5 translate-y-2.5 group-hover:translate-x-3 group-hover:translate-y-3 transition-transform duration-250 pointer-events-none border border-slate-100 dark:border-zinc-805" />
                  <div className="absolute inset-0 bg-slate-100/80 dark:bg-zinc-850/60 rounded-3xl transform translate-x-1.25 translate-y-1.25 group-hover:translate-x-1.5 group-hover:translate-y-1.5 transition-transform duration-250 pointer-events-none border border-slate-100 dark:border-zinc-810" />
                  
                  {/* Main Folder Panel Card */}
                  <div className="relative flex flex-col rounded-3xl bg-white dark:bg-zinc-900 border border-slate-150/70 dark:border-zinc-800/80 overflow-hidden shadow-sm group-hover:shadow-md transition-all p-6 h-64 justify-between">
                    <div className="space-y-4">
                      
                      {/* Upper Meta Row */}
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 text-[10px] font-bold uppercase tracking-wider">
                          {course.category}
                        </span>
                        
                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/60 text-slate-400 dark:text-zinc-500 group-hover:text-brand-500 group-hover:bg-brand-500/10 transition-all shrink-0">
                          <FolderOpen className="w-5 h-5" />
                        </div>
                      </div>

                      {/* Title & Description */}
                      <div className="space-y-2">
                        <h3 className="text-base font-bold font-outfit text-slate-800 dark:text-zinc-150 leading-tight line-clamp-1 group-hover:text-brand-500 transition-colors">
                          {course.title}
                        </h3>
                        <p className="text-xs text-slate-400 dark:text-zinc-500 font-medium line-clamp-2 leading-relaxed">
                          {course.description}
                        </p>
                      </div>

                    </div>

                    {/* Stats & Folder Trigger Row */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-zinc-800/80">
                      <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 flex items-center">
                        <Video className="w-4 h-4 mr-1.5 text-slate-400" />
                        {courseLecs.length} {courseLecs.length === 1 ? 'Video' : 'Videos'}
                      </span>
                      
                      <button
                        onClick={() => setActiveCourseId(course._id)}
                        className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-slate-55 dark:bg-zinc-800 hover:bg-brand-500 hover:text-white dark:hover:bg-brand-500 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-all border border-slate-100 dark:border-zinc-750"
                      >
                        <Play className="w-3.5 h-3.5 mr-1 fill-current animate-pulse" />
                        Open Playlist
                      </button>
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* PLAYLIST LECTURES VIEW (OPENED SPECIFIC COURSE) */
        <div className="space-y-6">
          
          {/* Quick Playlist Stats Alert */}
          <div className="p-4 rounded-2xl bg-brand-500/5 dark:bg-brand-950/10 border border-brand-500/10 dark:border-brand-500/5 flex items-center justify-between text-xs text-slate-650 dark:text-zinc-400 font-medium">
            <span>
              Currently managing <strong>{lectures.filter(l => l.courseId?._id === activeCourseId).length} videos</strong> in this playlist folder.
            </span>
            <button
              onClick={() => setActiveCourseId(null)}
              className="text-brand-500 hover:underline font-semibold"
            >
              Change Playlist
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lectures.filter(l => l.courseId?._id === activeCourseId).length === 0 ? (
              <div className="col-span-full text-center py-20 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 rounded-3xl">
                <Video className="w-12 h-12 mx-auto text-slate-350 dark:text-zinc-650 mb-3 animate-pulse" />
                <p className="text-sm font-medium text-slate-400 dark:text-zinc-500">
                  No recorded lectures in this playlist yet. Click "Add Lecture" to upload the first video!
                </p>
              </div>
            ) : (
              lectures
                .filter(l => l.courseId?._id === activeCourseId)
                .map((lecture) => (
                  <div
                    key={lecture._id}
                    className="flex flex-col rounded-3xl bg-white dark:bg-zinc-900 border border-slate-150/60 dark:border-zinc-800/80 overflow-hidden shadow-sm hover:shadow-md transition-all group"
                  >
                    
                    {/* Thumbnail frame */}
                    <div className="h-44 relative bg-slate-100 dark:bg-zinc-850 overflow-hidden">
                      <img
                        src={lecture.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60'}
                        alt={lecture.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60';
                        }}
                      />
                      
                      {/* Visual badge play icon overlay */}
                      <div className="absolute inset-0 bg-black/10 flex items-center justify-center group-hover:bg-black/35 transition-all">
                        <div className="w-12 h-12 rounded-full bg-brand-500/90 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-all">
                          <Video className="w-5 h-5 ml-0.5 fill-current" />
                        </div>
                      </div>
                    </div>

                    {/* Details card */}
                    <div className="flex-1 p-6 space-y-4 flex flex-col justify-between">
                      <div className="space-y-3.5">
                        <h3 className="text-base font-bold font-outfit text-slate-800 dark:text-zinc-150 leading-tight line-clamp-1">
                          {lecture.title}
                        </h3>
                        
                        <p className="text-xs text-slate-400 dark:text-zinc-550 leading-relaxed line-clamp-2">
                          {lecture.description || 'No description provided.'}
                        </p>
                      </div>

                      {/* Actions row */}
                      <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100 dark:border-zinc-800/80">
                        <button
                          onClick={() => handleEditClick(lecture)}
                          className="p-2 rounded-xl text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-100 dark:border-zinc-850 hover:border-slate-300 transition-all"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(lecture)}
                          className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 border border-rose-500/10 hover:border-rose-500/25 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                    </div>

                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* ADD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/20 dark:bg-black/55 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg p-6 md:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 shadow-2xl animate-scale-up">
            
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold font-outfit text-slate-800 dark:text-zinc-100">Add Recorded Lecture</h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-5">
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">Lecture Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AutoCAD Draw Tools Guide"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-55 dark:bg-zinc-850 text-slate-800 dark:text-zinc-100 text-sm focus:outline-none"
                />
              </div>

               <div className="grid grid-cols-1 gap-5">
                 <div>
                   <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">Associate Course</label>
                   <select
                     required
                     value={formData.courseId}
                     onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                     className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-55 dark:bg-zinc-850 text-slate-850 dark:text-zinc-155 text-sm focus:outline-none"
                   >
                     <option value="">Select Course</option>
                     {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                   </select>
                 </div>
               </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">YouTube Video URL</label>
                  <input
                    type="url"
                    required
                    placeholder="https://www.youtube.com/watch?v=video_id"
                    value={formData.youtubeVideoUrl}
                    onChange={(e) => setFormData({ ...formData, youtubeVideoUrl: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-55 dark:bg-zinc-850 text-slate-800 dark:text-zinc-100 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">Thumbnail (Upload or Link)</label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Paste image link or upload below"
                      value={formData.thumbnail}
                      onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-55 dark:bg-zinc-850 text-slate-800 dark:text-zinc-100 text-xs focus:outline-none"
                    />
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="w-full text-xs text-slate-500 dark:text-zinc-400 file:mr-2.5 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-brand-500 file:text-white file:cursor-pointer"
                      />
                      {uploadingImage && <span className="text-[9px] text-brand-500 font-bold tracking-wider animate-pulse shrink-0">Uploading...</span>}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">Description (Optional)</label>
                <textarea
                  rows="3"
                  placeholder="Prepare students on what is covered..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                  Save Lecture
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
              <h2 className="text-xl font-bold font-outfit text-slate-800 dark:text-zinc-100">Edit Lecture</h2>
              <button onClick={() => setShowEditModal(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-5">
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">Lecture Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AutoCAD Draw Tools Guide"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-55 dark:bg-zinc-850 text-slate-800 dark:text-zinc-100 text-sm focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">Associate Course</label>
                  <select
                    required
                    value={formData.courseId}
                    onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-55 dark:bg-zinc-850 text-slate-850 dark:text-zinc-155 text-sm focus:outline-none"
                  >
                    <option value="">Select Course</option>
                    {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                  </select>
                </div>

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">YouTube Video URL</label>
                  <input
                    type="url"
                    required
                    placeholder="https://www.youtube.com/watch?v=video_id"
                    value={formData.youtubeVideoUrl}
                    onChange={(e) => setFormData({ ...formData, youtubeVideoUrl: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-55 dark:bg-zinc-850 text-slate-800 dark:text-zinc-100 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">Thumbnail (Upload or Link)</label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Paste image link or upload below"
                      value={formData.thumbnail}
                      onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-55 dark:bg-zinc-850 text-slate-800 dark:text-zinc-100 text-xs focus:outline-none"
                    />
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="w-full text-xs text-slate-500 dark:text-zinc-400 file:mr-2.5 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-brand-500 file:text-white file:cursor-pointer"
                      />
                      {uploadingImage && <span className="text-[9px] text-brand-500 font-bold tracking-wider animate-pulse shrink-0">Uploading...</span>}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">Description (Optional)</label>
                <textarea
                  rows="3"
                  placeholder="Prepare students on what is covered..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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

export default Lectures;

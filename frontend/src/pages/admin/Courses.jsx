import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/Loader';
import { Plus, Edit3, Trash2, X, GraduationCap, LayoutGrid, AlertTriangle } from 'lucide-react';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Form Fields
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnail: '',
    category: '',
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

  const loadCourses = async () => {
    try {
      const res = await api.get('/courses');
      if (res.data?.success) {
        setCourses(res.data.courses);
      }
    } catch (err) {
      showToast('Failed to load courses', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/courses', formData);
      if (res.data?.success) {
        showToast('Course created successfully!');
        setShowAddModal(false);
        setFormData({ title: '', description: '', thumbnail: '', category: '' });
        loadCourses();
      }
    } catch (err) {
      showToast('Error creating course', 'error');
    }
  };

  const handleEditClick = (course) => {
    setSelectedCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      thumbnail: course.thumbnail,
      category: course.category,
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/courses/${selectedCourse._id}`, formData);
      if (res.data?.success) {
        showToast('Course updated successfully!');
        setShowEditModal(false);
        loadCourses();
      }
    } catch (err) {
      showToast('Error updating course', 'error');
    }
  };

  const handleDeleteClick = async (course) => {
    const confirmation = window.confirm(
      `WARNING: Deleting the course "${course.title}" will automatically delete ALL associated recorded video lectures and study PDF files. Are you sure you want to proceed?`
    );
    if (confirmation) {
      try {
        const res = await api.delete(`/courses/${course._id}`);
        if (res.data?.success) {
          showToast('Course and dependent materials deleted successfully');
          setCourses(prev => prev.filter(c => c._id !== course._id));
        }
      } catch (err) {
        showToast('Failed to delete course', 'error');
      }
    }
  };

  // Mock course suggestions
  const categories = ['AutoCAD', 'Robotics', 'Programming', 'Mechanical Design', 'Electronics', 'Web Development'];

  if (loading && courses.length === 0) return <Loader />;

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-zinc-50 font-outfit">
            Course Structure
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 mt-1">
            Build learning curriculum modules for the internship (AutoCAD, Robotics, programming tracks, etc.).
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({ title: '', description: '', thumbnail: '', category: '' });
            setShowAddModal(true);
          }}
          className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold shadow-md shadow-brand-500/20 transition-all self-start sm:self-center"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Course
        </button>
      </div>

      {/* Grid listing */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 rounded-3xl">
            <GraduationCap className="w-12 h-12 mx-auto text-slate-350 dark:text-zinc-650 mb-3 animate-pulse" />
            <p className="text-sm font-medium text-slate-400 dark:text-zinc-500">
              No educational courses scheduled yet. Click "Add Course" above.
            </p>
          </div>
        ) : (
          courses.map((course) => (
            <div
              key={course._id}
              className="flex flex-col rounded-3xl bg-white dark:bg-zinc-900 border border-slate-150/60 dark:border-zinc-800/80 overflow-hidden shadow-sm hover:shadow-md transition-all group"
            >
              
              {/* Thumbnail */}
              <div className="h-44 relative bg-slate-100 dark:bg-zinc-850 overflow-hidden">
                <img
                  src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60'}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60';
                  }}
                />
                
                {/* Category badge */}
                <div className="absolute top-4 left-4 px-3 py-1 rounded-xl bg-slate-900/60 text-white text-[10px] font-bold tracking-wider uppercase backdrop-blur-md">
                  {course.category}
                </div>
              </div>

              {/* Details */}
              <div className="flex-1 p-6 space-y-3 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold font-outfit text-slate-800 dark:text-zinc-150 leading-tight">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium line-clamp-3 leading-relaxed mt-2.5">
                    {course.description}
                  </p>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100 dark:border-zinc-800/80">
                  <button
                    onClick={() => handleEditClick(course)}
                    className="p-2 rounded-xl text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-100 dark:border-zinc-850 hover:border-slate-300 transition-all"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(course)}
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

      {/* ADD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/20 dark:bg-black/55 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg p-6 md:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 shadow-2xl animate-scale-up">
            
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold font-outfit text-slate-800 dark:text-zinc-100">Add Course</h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-5">
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">Course Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AutoCAD Essentials"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-55 dark:bg-zinc-850 text-slate-800 dark:text-zinc-100 text-sm focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-55 dark:bg-zinc-850 text-slate-850 dark:text-zinc-150 text-sm focus:outline-none"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">Thumbnail (Upload or Link)</label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      required
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
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">Course Description</label>
                <textarea
                  required
                  rows="4"
                  placeholder="Summarize course content guidelines..."
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
                  Save Course
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
              <h2 className="text-xl font-bold font-outfit text-slate-800 dark:text-zinc-100">Edit Course</h2>
              <button onClick={() => setShowEditModal(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-5">
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">Course Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AutoCAD Essentials"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-55 dark:bg-zinc-850 text-slate-800 dark:text-zinc-100 text-sm focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-55 dark:bg-zinc-850 text-slate-850 dark:text-zinc-150 text-sm focus:outline-none"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">Thumbnail (Upload or Link)</label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      required
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
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">Course Description</label>
                <textarea
                  required
                  rows="4"
                  placeholder="Summarize course content guidelines..."
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

export default Courses;

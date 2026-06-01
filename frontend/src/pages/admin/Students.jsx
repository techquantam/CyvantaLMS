import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/Loader';
import { Search, UserPlus, Edit3, Trash2, ShieldAlert, Key, UserCheck, UserX, X, Mail, Phone, BookOpen, Layers } from 'lucide-react';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Form fields state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    assignedCourse: '',
  });
  const [resetPasswordVal, setResetPasswordVal] = useState('');

  const { showToast } = useAuth();

  const loadData = async () => {
    try {
      const [stdRes, crsRes] = await Promise.all([
        api.get(`/students?search=${search}`),
        api.get('/courses'),
      ]);
      if (stdRes.data?.success) setStudents(stdRes.data.students);
      if (crsRes.data?.success) setCourses(crsRes.data.courses);
    } catch (err) {
      console.error(err);
      showToast('Error loading student listings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search]);

  // Toggle active/inactive state
  const handleToggleStatus = async (student) => {
    try {
      const newStatus = !student.isActive;
      const res = await api.patch(`/students/${student._id}/status`, { isActive: newStatus });
      if (res.data?.success) {
        showToast(`Student ${student.name} ${newStatus ? 'activated' : 'deactivated'} successfully`);
        setStudents(prev => prev.map(s => s._id === student._id ? { ...s, isActive: newStatus } : s));
      }
    } catch (err) {
      showToast('Failed to modify student status', 'error');
    }
  };

  // Add new student
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/students', formData);
      if (res.data?.success) {
        showToast('Student account created successfully!');
        setShowAddModal(false);
        setFormData({ name: '', email: '', mobile: '', password: '', assignedCourse: '' });
        loadData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error creating student', 'error');
    }
  };

  // Edit student details
  const handleEditClick = (student) => {
    setSelectedStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      mobile: student.mobile,
      assignedCourse: student.assignedCourse?._id || '',
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/students/${selectedStudent._id}`, formData);
      if (res.data?.success) {
        showToast('Student details updated successfully!');
        setShowEditModal(false);
        loadData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error updating student', 'error');
    }
  };

  // Delete student
  const handleDeleteClick = async (student) => {
    if (window.confirm(`Are you absolutely sure you want to delete ${student.name}'s account? This action is irreversible.`)) {
      try {
        const res = await api.delete(`/students/${student._id}`);
        if (res.data?.success) {
          showToast('Student account deleted successfully');
          setStudents(prev => prev.filter(s => s._id !== student._id));
        }
      } catch (err) {
        showToast('Failed to delete student', 'error');
      }
    }
  };

  // Reset password
  const handleResetClick = (student) => {
    setSelectedStudent(student);
    setResetPasswordVal('');
    setShowResetModal(true);
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (resetPasswordVal.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    try {
      const res = await api.post('/auth/reset-password', {
        studentId: selectedStudent._id,
        newPassword: resetPasswordVal,
      });
      if (res.data?.success) {
        showToast(`Password reset successfully for ${selectedStudent.name}!`);
        setShowResetModal(false);
      }
    } catch (err) {
      showToast('Error resetting password', 'error');
    }
  };



  if (loading && students.length === 0) return <Loader />;

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-zinc-50 font-outfit">
            Student Management
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 mt-1">
            Create, edit, toggle active statuses, reset login passwords, or query student enrollment profiles.
          </p>
        </div>
        
        {/* Create Student trigger */}
        <button
          onClick={() => {
            setFormData({ name: '', email: '', mobile: '', password: '', assignedCourse: '' });
            setShowAddModal(true);
          }}
          className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold shadow-md shadow-brand-500/20 hover:shadow-brand-500/30 transition-all self-start sm:self-center"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Create Student
        </button>
      </div>

      {/* Filters & search panel */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 flex items-center shadow-sm">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4.5 h-4.5" />
          </div>
          <input
            type="text"
            placeholder="Search by name, email, or mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-850 text-slate-800 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-650"
          />
        </div>
      </div>

      {/* Grid / Data Table */}
      <div className="overflow-x-auto rounded-3xl border border-slate-100 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 shadow-md">
        <table className="min-w-full divide-y divide-slate-100 dark:divide-zinc-800">
          <thead className="bg-slate-50 dark:bg-zinc-850 text-slate-400 dark:text-zinc-400">
            <tr>
              <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest">Full Name</th>
              <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest">Contact Details</th>
              <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest">Enrolled Program</th>
              <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-150 dark:divide-zinc-800/80 text-sm">
            {students.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-12 text-slate-400 dark:text-zinc-500 font-semibold">
                  No student registrations found.
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student._id} className="hover:bg-slate-50/40 dark:hover:bg-zinc-850/20 transition-colors">
                  
                  {/* Name initials & Full Name */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3.5">
                      <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 dark:bg-zinc-800 font-bold text-slate-600 dark:text-zinc-350">
                        {student.name[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-zinc-200">{student.name}</div>
                        {student.firstLogin && (
                          <span className="inline-block mt-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-md">
                            Pending Password Update
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="px-6 py-4 whitespace-nowrap space-y-1">
                    <div className="flex items-center text-xs text-slate-650 dark:text-zinc-400">
                      <Mail className="w-3.5 h-3.5 mr-2 text-slate-400 shrink-0" />
                      {student.email}
                    </div>
                    <div className="flex items-center text-xs text-slate-650 dark:text-zinc-400">
                      <Phone className="w-3.5 h-3.5 mr-2 text-slate-400 shrink-0" />
                      {student.mobile}
                    </div>
                  </td>

                  {/* Course & Cohort */}
                  <td className="px-6 py-4 whitespace-nowrap space-y-1">
                    <div className="flex items-center text-xs font-semibold text-slate-700 dark:text-zinc-300">
                      <BookOpen className="w-3.5 h-3.5 mr-2 text-brand-400 shrink-0" />
                      {student.assignedCourse?.title || <span className="text-slate-400 font-normal">Unassigned</span>}
                    </div>
                  </td>

                  {/* Status Toggle */}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => handleToggleStatus(student)}
                      className={`inline-flex items-center justify-center px-3 py-1.5 rounded-xl text-xs font-semibold select-none transition-all ${student.isActive ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/15 hover:bg-emerald-500/20' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/15 hover:bg-rose-500/20'}`}
                    >
                      {student.isActive ? (
                        <>
                          <UserCheck className="w-3.5 h-3.5 mr-1.5" />
                          Active
                        </>
                      ) : (
                        <>
                          <UserX className="w-3.5 h-3.5 mr-1.5" />
                          Deactivated
                        </>
                      )}
                    </button>
                  </td>

                  {/* Actions column */}
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleResetClick(student)}
                        title="Reset Student Password"
                        className="p-2 rounded-xl text-amber-500 hover:bg-amber-500/10 border border-amber-500/10 hover:border-amber-500/25 transition-all"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditClick(student)}
                        title="Edit Student Details"
                        className="p-2 rounded-xl text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-100 dark:border-zinc-850 hover:border-slate-350 dark:hover:border-zinc-700 transition-all"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(student)}
                        title="Delete Student"
                        className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 border border-rose-500/10 hover:border-rose-500/25 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* CREATE STUDENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/20 dark:bg-black/55 backdrop-blur-xs">
          <div className="w-full max-w-xl p-6 md:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold font-outfit text-slate-800 dark:text-zinc-100">Create Student Account</h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-55 dark:bg-zinc-850 text-slate-800 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-55 dark:bg-zinc-850 text-slate-800 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-55 dark:bg-zinc-850 text-slate-800 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">Initial Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Min 6 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-55 dark:bg-zinc-850 text-slate-800 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">Assign Course</label>
                  <select
                    value={formData.assignedCourse}
                    onChange={(e) => setFormData({ ...formData, assignedCourse: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-55 dark:bg-zinc-850 text-slate-850 dark:text-zinc-155 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                  >
                    <option value="">Select Course</option>
                    {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                  </select>
                </div>
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
                  Create Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT STUDENT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/20 dark:bg-black/55 backdrop-blur-xs">
          <div className="w-full max-w-xl p-6 md:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold font-outfit text-slate-800 dark:text-zinc-100">Edit Student Details</h2>
              <button onClick={() => setShowEditModal(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-55 dark:bg-zinc-850 text-slate-800 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-55 dark:bg-zinc-850 text-slate-800 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-55 dark:bg-zinc-850 text-slate-800 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">Assign Course</label>
                  <select
                    value={formData.assignedCourse}
                    onChange={(e) => setFormData({ ...formData, assignedCourse: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-55 dark:bg-zinc-850 text-slate-850 dark:text-zinc-150 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                  >
                    <option value="">Select Course</option>
                    {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                  </select>
                </div>
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

      {/* RESET PASSWORD MODAL */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/20 dark:bg-black/55 backdrop-blur-xs">
          <div className="w-full max-w-md p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold font-outfit text-slate-800 dark:text-zinc-100 flex items-center">
                <Key className="w-5 h-5 mr-2 text-amber-500" />
                Reset Student Password
              </h2>
              <button onClick={() => setShowResetModal(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold mb-5">
              <ShieldAlert className="w-4.5 h-4.5 shrink-0 mt-0.5" />
              <div>
                Resetting will force the student to complete a new password change on their next login.
              </div>
            </div>

            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">
                  Temporary Password for {selectedStudent?.name}
                </label>
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={resetPasswordVal}
                  onChange={(e) => setResetPasswordVal(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-55 dark:bg-zinc-850 text-slate-800 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-500 hover:bg-slate-50 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold"
                >
                  Reset & Flag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Students;

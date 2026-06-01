import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Phone, Mail, Lock, ShieldAlert, BadgeInfo } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();

  // Profile fields state
  const [name, setName] = useState(user?.name || '');
  const [mobile, setMobile] = useState(user?.mobile || '');
  const [profileLoading, setProfileLoading] = useState(false);

  // Security password fields state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityLoading, setSecurityLoading] = useState(false);
  const [securityError, setSecurityError] = useState('');

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    await updateProfile(name, mobile);
    setProfileLoading(false);
  };

  const handleSecuritySubmit = async (e) => {
    e.preventDefault();
    setSecurityError('');

    if (newPassword.length < 6) {
      setSecurityError('New password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setSecurityError('New passwords do not match');
      return;
    }

    setSecurityLoading(true);
    const res = await changePassword(currentPassword, newPassword);
    setSecurityLoading(false);

    if (res.success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Intro Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-zinc-50 font-outfit">
          Account Settings
        </h1>
        <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 mt-1">
          Manage your personal credentials, contact mobile numbers, and security options.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column - details & edit form */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* General Information Card */}
          <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 shadow-md shadow-slate-100/5 dark:shadow-black/15">
            <h2 className="text-xl font-bold font-outfit text-slate-800 dark:text-zinc-150 mb-6 flex items-center">
              <User className="w-5.5 h-5.5 mr-2.5 text-brand-500" />
              Personal Profile Info
            </h2>

            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Full name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-850 text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm font-medium"
                  />
                </div>

                {/* Mobile number */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-850 text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm font-medium"
                  />
                </div>

              </div>

              {/* Email (Readonly) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-2">
                  Email Address (Unchangeable)
                </label>
                <div className="flex items-center px-4 py-3 rounded-xl bg-slate-100 dark:bg-zinc-800/40 text-slate-500 dark:text-zinc-450 text-sm font-semibold select-none border border-slate-150 dark:border-zinc-800">
                  <Mail className="w-4 h-4 mr-2.5 text-slate-400 shrink-0" />
                  {user?.email}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:bg-brand-500/60 text-white font-semibold text-sm shadow-md shadow-brand-500/20 transition-all"
                >
                  {profileLoading ? 'Saving changes...' : 'Save Profile Settings'}
                </button>
              </div>

            </form>
          </div>

          {/* Security Update Card */}
          <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 shadow-md shadow-slate-100/5 dark:shadow-black/15">
            <h2 className="text-xl font-bold font-outfit text-slate-800 dark:text-zinc-150 mb-6 flex items-center">
              <Lock className="w-5.5 h-5.5 mr-2.5 text-brand-500" />
              Update Account Password
            </h2>

            {securityError && (
              <div className="flex items-start space-x-2.5 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold mb-6">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{securityError}</span>
              </div>
            )}

            <form onSubmit={handleSecuritySubmit} className="space-y-6">
              
              {/* Current Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-850 text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* New Password */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-850 text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm font-medium"
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-850 text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm font-medium"
                  />
                </div>

              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={securityLoading}
                  className="px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:bg-brand-500/60 text-white font-semibold text-sm shadow-md shadow-brand-500/20 transition-all"
                >
                  {securityLoading ? 'Changing password...' : 'Change Password'}
                </button>
              </div>

            </form>
          </div>

        </div>

        {/* Right column - visual card summaries */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Profile overview summary */}
          <div className="p-6 rounded-3xl bg-gradient-to-tr from-brand-950 to-indigo-950 text-white border border-brand-900 shadow-md">
            <h3 className="text-xs font-bold uppercase tracking-widest text-brand-300 block mb-6">
              Account Authority
            </h3>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-brand-300/60 block">Assigned Role</span>
                <span className="text-lg font-bold font-outfit text-white tracking-wide uppercase mt-0.5 inline-block bg-white/10 px-3 py-1 rounded-lg">
                  {user?.role}
                </span>
              </div>

              {user?.role === 'student' && (
                <>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-brand-300/60 block">Enrolled Course</span>
                    <span className="text-sm font-semibold text-brand-100 mt-1 block">
                      {user?.assignedCourse?.title || 'No Course Assigned'}
                    </span>
                  </div>
                </>
              )}

              <div>
                <span className="text-[10px] uppercase font-bold text-brand-300/60 block">Registration Timestamp</span>
                <span className="text-xs text-brand-200/80 mt-1 block">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Notice details */}
          <div className="p-6 rounded-3xl bg-slate-100 dark:bg-zinc-900/50 border border-slate-200/30 dark:border-zinc-800 flex items-start space-x-3.5">
            <BadgeInfo className="w-5.5 h-5.5 text-brand-500 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed text-slate-500 dark:text-zinc-400 font-medium">
              Your contact numbers and names will be populated into graduation profiles and certificates. Please ensure they remain accurate.
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Profile;

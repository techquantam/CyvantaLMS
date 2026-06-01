import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, CheckCircle2, ShieldAlert } from 'lucide-react';

const ForcePasswordChange = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { user, changePassword, token, logout } = useAuth();
  const navigate = useNavigate();

  // Route security checks
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // If already completed, bypass
  if (!user.firstLogin) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    // On first login, currentPassword parameter is not checked by the backend
    const res = await changePassword('', newPassword);
    setLoading(false);

    if (res.success) {
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col justify-center items-center p-6 transition-colors duration-300">
      
      <div className="w-full max-w-md p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 shadow-xl shadow-slate-150/10 dark:shadow-black/25">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3.5 rounded-2xl bg-amber-500/10 text-amber-500 mb-4 animate-bounce">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold font-outfit text-slate-800 dark:text-zinc-50 tracking-tight">
            Security Update Required
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 mt-2">
            This is your first login. To secure your account, please set a custom password.
          </p>
        </div>

        {errorMsg && (
          <div className="flex items-start space-x-2.5 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold mb-6">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
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
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-850 text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
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
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-850 text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:bg-brand-500/60 text-white font-semibold text-sm shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Change Password'
            )}
          </button>
        </form>

        <button
          onClick={logout}
          className="w-full mt-4 py-2.5 rounded-xl border border-slate-150 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-850 text-slate-500 dark:text-zinc-400 font-semibold text-xs transition-all"
        >
          Cancel & Log Out
        </button>

      </div>
    </div>
  );
};

export default ForcePasswordChange;

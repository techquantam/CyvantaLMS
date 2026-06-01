import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Lock, Mail, Eye, EyeOff, GraduationCap, Sun, Moon } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const [customMsg, setCustomMsg] = useState('');

  const { login, token, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Watch redirection queries or session status
  useEffect(() => {
    const msg = searchParams.get('msg');
    if (msg) {
      setCustomMsg(msg);
    }
  }, [searchParams]);

  useEffect(() => {
    if (token && user) {
      if (user.firstLogin) {
        navigate('/change-password', { replace: true });
      } else {
        navigate(user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard', { replace: true });
      }
    }
  }, [token, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setCustomMsg('');
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      if (result.user.firstLogin) {
        navigate('/change-password', { replace: true });
      } else {
        navigate(result.user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard', { replace: true });
      }
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-50 dark:bg-zinc-950 transition-colors duration-300 relative overflow-hidden">
      
      {/* Visual Splash Panel (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:col-span-7 bg-zinc-950 relative overflow-hidden items-center justify-center p-12">
        {/* Aesthetic Glowing backdrop blobs - Floating Animated */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-cyan-550/20 blur-3xl animate-float" style={{ animationDelay: '0s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl animate-float" style={{ animationDelay: '3s' }} />
        
        <div className="relative z-10 max-w-xl text-center space-y-8">
          <div className="inline-flex items-center justify-center relative group">
            <div className="absolute -inset-2 rounded-[2rem] bg-gradient-to-r from-cyan-400 to-indigo-500 opacity-75 blur-md group-hover:opacity-100 transition duration-1000 animate-pulse-slow"></div>
            <div className="relative p-5 rounded-[2rem] bg-white dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800 shadow-2xl w-24 h-24 flex items-center justify-center">
              <img src="/logo.png" alt="Cyvanta Logo" className="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-300" />
            </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-4xl xl:text-5xl font-extrabold font-outfit text-white tracking-tight leading-tight">
              Cyvanta Tech Quantum <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-300">
                LMS Portal
              </span>
            </h2>
            <p className="text-zinc-300/80 text-base max-w-lg mx-auto leading-relaxed">
              Unlock access to your personalized course syllabus, pre-recorded video modules, learning guides, assignments, and campus bulletins.
            </p>
          </div>
          
          {/* Quick Stats Panel mock */}
          <div className="grid grid-cols-3 gap-6 p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md relative overflow-hidden group hover:border-white/20 transition-all duration-300">
            <div className="hover:scale-105 transition-transform duration-200">
              <span className="block text-2xl font-bold font-outfit text-white">4+</span>
              <span className="text-[10px] text-zinc-300/60 font-bold tracking-wider uppercase">Courses</span>
            </div>
            <div className="hover:scale-105 transition-transform duration-200">
              <span className="block text-2xl font-bold font-outfit text-white">100%</span>
              <span className="text-[10px] text-zinc-300/60 font-bold tracking-wider uppercase">Online</span>
            </div>
            <div className="hover:scale-105 transition-transform duration-200">
              <span className="block text-2xl font-bold font-outfit text-white">10+</span>
              <span className="text-[10px] text-zinc-300/60 font-bold tracking-wider uppercase">Projects</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Login Form Panel */}
      <div className="lg:col-span-5 flex flex-col justify-between p-6 md:p-12 relative bg-white dark:bg-zinc-900 border-l border-slate-100 dark:border-zinc-800/80">
        
        {/* Top bar with Mobile Logo & Theme Switcher */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 p-0.5 overflow-hidden flex items-center justify-center">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-extrabold text-slate-850 dark:text-zinc-50 font-outfit tracking-tight text-sm">Cyvanta Tech Quantum</span>
          </div>
          <div className="lg:ml-auto">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 transition-colors"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-400" />}
            </button>
          </div>
        </div>

        {/* Center Panel Container */}
        <div className="w-full max-w-md mx-auto my-auto py-12">
          
          <div className="mb-8">
            <div className="hidden lg:flex items-center justify-center w-14 h-14 rounded-2xl bg-white dark:bg-zinc-800 border border-slate-150 dark:border-zinc-700 shadow-md p-1.5 mb-6 hover:rotate-6 transition-transform duration-300">
              <img src="/logo.png" alt="Cyvanta Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-3xl font-extrabold font-outfit text-slate-850 dark:text-zinc-50 tracking-tight mb-2">
              Welcome back
            </h1>
            <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
              Please enter your credentials to access your dashboard.
            </p>
          </div>

          {customMsg && (
            <div className="p-4 rounded-xl border border-amber-200/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold mb-6 animate-pulse">
              {customMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Email Field */}
            <div className="group">
              <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-450 mb-2 group-focus-within:text-cyan-500 dark:group-focus-within:text-cyan-400 transition-colors">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-cyan-500 dark:group-focus-within:text-cyan-400 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  id="email"
                  required
                  placeholder="name@cyvanta.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-55 dark:bg-zinc-850/60 text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 dark:focus:border-cyan-400 transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-650 font-medium"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="group">
              <label htmlFor="password" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-450 mb-2 group-focus-within:text-cyan-500 dark:group-focus-within:text-cyan-400 transition-colors">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-cyan-500 dark:group-focus-within:text-cyan-400 transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-55 dark:bg-zinc-850/60 text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 dark:focus:border-cyan-400 transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-650 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-650 dark:hover:text-zinc-350"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-650 hover:from-cyan-600 hover:to-indigo-700 disabled:from-cyan-500/50 disabled:to-indigo-500/50 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center transform active:scale-[0.98] duration-200"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>

        </div>

        {/* Small Legal / System Notice Footer */}
        <div className="text-center text-xs text-slate-400 dark:text-zinc-500 font-medium mt-6">
          Cyvanta Tech Quantum LMS Portal. All rights reserved.
        </div>

      </div>

    </div>
  );
};

export default Login;

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('lms_token') || null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  // Toast helper
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Load user on start or token change
  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data?.success) {
            setUser(res.data.user);
          }
        } catch (error) {
          console.error('Failed to load user session:', error);
          logout();
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  // Login handler
  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data?.success) {
        const { token: userToken, user: userData } = res.data;
        localStorage.setItem('lms_token', userToken);
        setToken(userToken);
        setUser(userData);
        showToast('Welcome back, ' + userData.name + '!', 'success');
        return { success: true, user: userData };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed. Please check credentials.';
      showToast(msg, 'error');
      return { success: false, error: msg };
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('lms_token');
    setToken(null);
    setUser(null);
    showToast('Logged out successfully', 'success');
  };

  // Update profile
  const updateProfile = async (name, mobile) => {
    try {
      const res = await api.put('/auth/profile', { name, mobile });
      if (res.data?.success) {
        setUser((prev) => ({ ...prev, name, mobile }));
        showToast('Profile updated successfully', 'success');
        return { success: true };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update profile';
      showToast(msg, 'error');
      return { success: false, error: msg };
    }
  };

  // Force password change on first login or profile update
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const res = await api.post('/auth/change-password', { currentPassword, newPassword });
      if (res.data?.success) {
        setUser((prev) => ({ ...prev, firstLogin: false }));
        showToast('Password changed successfully!', 'success');
        return { success: true };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update password';
      showToast(msg, 'error');
      return { success: false, error: msg };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        updateProfile,
        changePassword,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

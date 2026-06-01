import axios from 'axios';

// Export BACKEND_URL for use in resource links/downloads
export const BACKEND_URL = import.meta.env.VITE_API_URL || '';

// Create central axios instance
const api = axios.create({
  baseURL: BACKEND_URL ? `${BACKEND_URL}/api` : '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});


// Interceptor to load JWT from localStorage for every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('lms_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle global errors (like 401 Unauthorized or account deactivation)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      // Auto logout if token expires or account is de-activated
      if (status === 401 || (status === 403 && data.message?.includes('deactivated'))) {
        localStorage.removeItem('lms_token');
        localStorage.removeItem('lms_user');
        // Let the application route context handle redirection
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login?msg=' + encodeURIComponent(data.message || 'Session expired');
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

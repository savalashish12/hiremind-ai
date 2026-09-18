import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      // Don't redirect for auth endpoints themselves (login/register/verify/otp
      // legitimately return 401) — let the page handle the error message.
      const isAuthCall = url.includes('/auth/login') || url.includes('/auth/register')
        || url.includes('/auth/verify-email') || url.includes('/auth/forgot-password')
        || url.includes('/auth/reset-password') || url.includes('/auth/resend-verification');
      if (!isAuthCall) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
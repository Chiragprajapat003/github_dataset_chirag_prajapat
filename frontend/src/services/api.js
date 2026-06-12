import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token to all requests automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to format error responses and handle token expiry (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    // Auto logout if backend reports session expired or token is invalid
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user_role');
      localStorage.removeItem('user_name');
      // If we are not already on the login page, redirect
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login?expired=true';
      }
    }

    // Format error message to be read easily by UI notifications/alert blocks
    const message = error.response?.data?.message || 'Something went wrong. Please try again.';
    const formattedError = new Error(message);
    formattedError.status = error.response?.status || 500;
    formattedError.data = error.response?.data || null;

    return Promise.reject(formattedError);
  }
);

export default api;

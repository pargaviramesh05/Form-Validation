import axios from 'axios';

// Set VITE_API_URL in frontend/.env for production (e.g. your Render/Railway backend URL)
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL,
  withCredentials: true, // sends the httpOnly admin cookie when present
  timeout: 15000,
});

// Attach the JWT (if we have one cached) as a Bearer header too, so auth
// still works even when third-party cookies are blocked.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('formapp_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalize error messages so components can just read err.message.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong. Please try again.';
    return Promise.reject({ ...error, message });
  }
);

export default api;

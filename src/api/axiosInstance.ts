import axios from 'axios';
import { logout } from '../utility/authUtils';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL+'/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to automatically add the token to every request if it exists
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('temp_token') || localStorage.getItem('auth_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response, // Return the response if everything is fine
  (error) => {
    // Check if the error response exists and the status is 401
    if (error.response && error.response.status === 401) {
     logout();
    }
    
    return Promise.reject(error);
  }
);
export default axiosInstance;
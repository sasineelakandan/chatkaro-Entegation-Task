// utils/axiosInstance.ts
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_USER_BACKEND_URL,
  withCredentials: true, 
});

// Add a request interceptor to attach the Bearer token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;

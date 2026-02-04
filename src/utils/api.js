// import axios from 'axios'

// const API = axios.create({
//   baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:5000/api',
//   timeout: 20000,
// })

// // Attach token automatically
// API.interceptors.request.use(cfg => {
//   const token = localStorage.getItem('token')
//   if (token) cfg.headers.Authorization = `Bearer ${token}`
//   return cfg
// })

// export default API


import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data
    });
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default API;
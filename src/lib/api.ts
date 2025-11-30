import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/api/auth/login/email', { email, password }),
  
  register: (data: {
    email: string;
    password: string;
    full_name: string;
    role: 'student' | 'parent';
  }) => api.post('/api/auth/register/parent/email', data),
  
  verifyEmail: (token: string) =>
    api.post('/api/auth/verify/email/confirm', { token }),
  
  resendVerification: (email: string) =>
    api.post('/api/auth/verify/email/send', { email }),
};

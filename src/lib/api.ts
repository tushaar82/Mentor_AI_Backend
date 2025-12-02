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
  // Parent login
  login: (email: string, password: string) =>
    api.post('/api/auth/login/email', { email, password }),
  
  // Student login
  studentLogin: (username: string, password: string) =>
    api.post('/api/auth/login/student', { username, password }),
  
  register: (data: {
    name: string;
    mobile_number: string;
    email_address: string;
    password: string;
    repeat_password: string;
  }) => api.post('/api/auth/register/simple', null, { params: data }),
  
  verifyEmail: (token: string) =>
    api.post('/api/auth/verify/email/confirm', { token }),
  
  resendVerification: (email: string) =>
    api.post('/api/auth/verify/email/send', { email }),
};

// Onboarding API
export const onboardingAPI = {
  // Parent Preferences
  createPreferences: (parent_id: string, data: {
    language: 'en' | 'hi' | 'mr';
    email_notifications: boolean;
    sms_notifications: boolean;
    push_notifications: boolean;
    teaching_involvement: 'high' | 'medium' | 'low';
  }) => api.post('/api/onboarding/preferences', data, { params: { parent_id } }),
  
  getPreferences: (parent_id: string) =>
    api.get('/api/onboarding/preferences', { params: { parent_id } }),
  
  updatePreferences: (parent_id: string, data: {
    language?: 'en' | 'hi' | 'mr';
    email_notifications?: boolean;
    sms_notifications?: boolean;
    push_notifications?: boolean;
    teaching_involvement?: 'high' | 'medium' | 'low';
  }) => api.put('/api/onboarding/preferences', data, { params: { parent_id } }),
  
  // Child Profile
  createChildProfile: (parent_id: string, data: {
    name: string;
    age: number;
    grade: number;
    current_level: 'beginner' | 'intermediate' | 'advanced';
    username: string;
    password: string;
  }) => api.post('/api/onboarding/child', data, { params: { parent_id } }),
  
  getChildProfile: (parent_id: string) =>
    api.get('/api/onboarding/child', { params: { parent_id } }),
  
  updateChildProfile: (parent_id: string, child_id: string, data: {
    name?: string;
    age?: number;
    grade?: number;
    current_level?: 'beginner' | 'intermediate' | 'advanced';
    username?: string;
    password?: string;
  }) => api.put(`/api/onboarding/child/${child_id}`, data, { params: { parent_id } }),
};

// Exam Selection API
export const examAPI = {
  getAvailableExams: () =>
    api.get('/api/onboarding/exams/available'),
  
  selectExam: (parent_id: string, child_id: string, data: {
    exam_type: 'JEE_MAIN' | 'JEE_ADVANCED' | 'JEE_COMBO' | 'NEET';
    exam_date: string;
    subject_preferences: Record<string, number>;
  }) => api.post('/api/onboarding/exam/select', data, { params: { parent_id, child_id } }),
  
  getExamSelection: (child_id: string) =>
    api.get('/api/onboarding/exam/preferences', { params: { child_id } }),
  
  updateSubjectPreferences: (parent_id: string, child_id: string, preferences: Record<string, number>) =>
    api.put('/api/onboarding/exam/preferences', preferences, { params: { parent_id, child_id } }),
  
  getOnboardingStatus: (parent_id: string) =>
    api.get('/api/onboarding/status', { params: { parent_id } }),
  
  getDiagnosticTest: (test_id: string) =>
    api.get(`/api/diagnostic-test/${test_id}`),
  
  scheduleDiagnosticTest: (data: {
    child_id: string;
    exam_type: string;
    scheduled_date: string;
    test_id: string;
  }) => api.post('/api/diagnostic-test/schedule', data),
  
  getScheduledTests: (child_id: string) =>
    api.get('/api/diagnostic-test/student/' + child_id),
};

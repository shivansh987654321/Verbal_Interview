import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach Clerk token to every request
export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

// User
export const syncUser = (userData) => api.post('/users/sync', userData);
export const getUser = (clerkId) => api.get(`/users/${clerkId}`);

// Interviews
export const startInterview = (payload) => api.post('/interviews/start', payload);
export const endInterview = (interviewId) => api.put(`/interviews/${interviewId}/end`);
export const getUserInterviews = (clerkId) => api.get(`/interviews/user/${clerkId}`);
export const getInterviewById = (id) => api.get(`/interviews/${id}`);

// Messages
export const sendMessage = (payload) => api.post('/messages/send', payload);
export const getMessages = (interviewId) => api.get(`/messages/${interviewId}`);

export default api;

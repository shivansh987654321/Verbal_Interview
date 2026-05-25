import axios from 'axios';

// Coding Assessment service runs on a SEPARATE backend (port 8081 by default).
// No /api prefix — that service uses bare routes (/problems, /users/sync, etc.)
const CODING_BASE_URL =
  process.env.REACT_APP_CODING_API_URL || 'http://localhost:8081';

const codingApi = axios.create({
  baseURL: CODING_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// User sync (mirror of /users/sync on the coding service)
export const codingSyncUser = (payload) => codingApi.post('/users/sync', payload);

// Problems
export const fetchProblems = () => codingApi.get('/problems');
export const fetchProblem = (id) => codingApi.get(`/problems/${id}`);

// Execution
export const runCode = (payload) => codingApi.post('/run', payload);
export const submitCode = (payload) => codingApi.post('/submit', payload);

// History / performance (the new Phase-1 endpoints)
export const fetchCodingHistory = (clerkUserId) =>
  codingApi.get(`/users/${clerkUserId}/history`);
export const fetchCodingPerformance = (clerkUserId) =>
  codingApi.get(`/users/${clerkUserId}/performance`);

// Submissions filtered by clerk user (existing endpoint uses query param)
export const fetchSubmissions = (clerkUserId) =>
  codingApi.get(`/submissions?clerkUserId=${encodeURIComponent(clerkUserId)}`);

// Dashboard summary (existing endpoint)
export const fetchCodingDashboard = (clerkUserId) =>
  codingApi.get(`/dashboard?clerkUserId=${encodeURIComponent(clerkUserId)}`);

export default codingApi;

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Create axios instance
const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add token
apiClient.interceptors.request.use(
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

// Response interceptor to handle errors
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (data) => apiClient.post('/auth/register', data),
    login: (data) => apiClient.post('/auth/login', data),
    verifyEmail: (token) => apiClient.get(`/auth/verify-email/${token}`),
    forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
    resetPassword: (data) => apiClient.post('/auth/reset-password', data),
};

// Tasks API
export const tasksAPI = {
    getAll: (params) => apiClient.get('/tasks', { params }),
    getOne: (id) => apiClient.get(`/tasks/${id}`),
    create: (data) => apiClient.post('/tasks', data),
    update: (id, data) => apiClient.put(`/tasks/${id}`, data),
    delete: (id) => apiClient.delete(`/tasks/${id}`),
    complete: (id) => apiClient.post(`/tasks/${id}/complete`),
};

// Gamification API
export const gamificationAPI = {
    getStats: () => apiClient.get('/gamification/stats'),
    getAchievements: () => apiClient.get('/gamification/achievements'),
};

// Calendar / Google Calendar API
export const calendarAPI = {
    getAuthUrl: () => apiClient.get('/calendar/auth-url'),
    connect: (code) => apiClient.post(`/calendar/connect?code=${encodeURIComponent(code)}`),
    sync: (taskIds) => apiClient.post('/calendar/sync', { task_ids: taskIds || null }),
    getStatus: () => apiClient.get('/calendar/status'),
    disconnect: () => apiClient.delete('/calendar/disconnect'),
};

export default apiClient;

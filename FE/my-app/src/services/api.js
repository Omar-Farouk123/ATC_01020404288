import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to add auth token
api.interceptors.request.use(
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

// Add response interceptor to handle common errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear auth data and redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('tokenExpiry');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API calls
export const authAPI = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    register: (userData) => api.post('/auth/register', userData),
};

// Events API calls
export const eventsAPI = {
    getAllEvents: () => api.get('/events'),
    getEvent: (id) => api.get(`/events/${id}`),
    bookEvent: (eventId) => api.post(`/events/book/${eventId}`),
    getUserEvents: () => api.get('/events/user'),
    cancelBooking: (eventId) => api.delete(`/events/book/${eventId}`),
};

// Admin API calls
export const adminAPI = {
    getAllUsers: () => api.get('/users'),
    updateUserStatus: (userId, statusData) => api.put(`/users/${userId}/status`, statusData),
    createEvent: (eventData) => api.post('/events', eventData),
    updateEvent: (eventId, eventData) => api.put(`/events/${eventId}`, eventData),
    deleteEvent: (eventId) => api.delete(`/events/${eventId}`),
    getEventStats: () => api.get('/admin/stats/events'),
    getUserStats: () => api.get('/admin/stats/users'),
};

// User API calls
export const userAPI = {
    getProfile: () => api.get('/users/me'),
    updateProfile: (userData) => api.put('/users/me', userData),
    updatePassword: (passwordData) => api.put('/users/me/password', passwordData),
};

export default api; 
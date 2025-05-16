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
        const userData = JSON.parse(localStorage.getItem('user'));
        
        console.log('Request interceptor:', {
            url: config.url,
            method: config.method,
            hasToken: !!token,
            userRole: userData?.role
        });

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('Request headers:', {
                ...config.headers,
                Authorization: 'Bearer [TOKEN]' // Hide actual token in logs
            });
        } else {
            console.warn('No token found in localStorage');
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
        console.error('API Error:', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            headers: error.response?.headers
        });
        
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
    uploadEventImage: async (eventId, formData) => {
        try {
            const response = await axios.post(
                `${API_URL}/events/${eventId}/upload-image`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

// User API calls
export const userAPI = {
    getProfile: () => api.get('/users/me'),
    updateProfile: (userData) => api.put('/users/me', userData),
    updatePassword: (passwordData) => api.put('/users/me/password', passwordData),
};

export default api; 
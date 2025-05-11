import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const registerUser = async (userData) => {
    try {
        const response = await api.post('/users/register', {
            fullName: userData.name,
            email: userData.email,
            password: userData.password,
            phoneNumber: userData.phoneNumber,
            address: userData.address
        });
        
        // Return the full response data
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error.message || 'Registration failed';
    }
};

export const loginUser = async (credentials) => {
    try {
        const response = await api.post('/users/login', {
            email: credentials.email,
            password: credentials.password
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error.message || 'Login failed';
    }
}; 
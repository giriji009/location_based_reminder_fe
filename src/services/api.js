// src/services/api.js
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Base URL for your API
// const API_URL = 'http://localhost:5000/api';
const API_URL = 'https://ef7a-2405-201-a404-9091-d1e0-aaec-f45e-d9e3.ngrok-free.app/api';


// Create an axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 (Unauthorized) errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Here you could implement token refresh logic
      // For now, we'll just handle the unauthorized error
      
      // Clear stored credentials
      await SecureStore.deleteItemAsync('userToken');
      await SecureStore.deleteItemAsync('user');
      
      // Force app to re-evaluate auth state
      // You need to implement this part in your AuthContext
    }
    
    return Promise.reject(error);
  }
);

// Authentication API calls
export const authAPI = {
  // Start registration
  startRegister: (userData) => {
    return api.post('/auth/register/start', userData);
  },
  
  // Complete registration with OTP
  completeRegister: (data) => {
    return api.post('/auth/register/complete', data);
  },
  
  // Login with email
  loginWithEmail: (email, password) => {
    return api.post('/auth/login', { email, password });
  },
  
  // Login with phone
  loginWithPhone: (phoneNumber, password) => {
    return api.post('/auth/login/phone', { phoneNumber, password });
  },
  
  // Start OTP login
  startOtpLogin: (phoneNumber) => {
    return api.post('/auth/login/otp/start', { phoneNumber });
  },
  
  // Complete OTP login
  completeOtpLogin: (phoneNumber, otp) => {
    return api.post('/auth/login/otp/complete', { phoneNumber, otp });
  },
  
  // Forgot password
  forgotPassword: (phoneNumber) => {
    return api.post('/auth/forgot-password', { phoneNumber });
  },
  
  // Reset password
  resetPassword: (phoneNumber, otp, password) => {
    return api.post('/auth/reset-password', { phoneNumber, otp, password });
  }
};

// Tasks API calls
export const tasksAPI = {
  // Get all tasks
  getTasks: () => {
    return api.get('/tasks');
  },
  
  // Get a specific task
  getTask: (id) => {
    return api.get(`/tasks/${id}`);
  },
  
  // Create a new task
  createTask: (taskData) => {
    return api.post('/tasks', taskData);
  },
  
  // Update a task
  updateTask: (id, taskData) => {
    return api.put(`/tasks/${id}`, taskData);
  },
  
  // Delete a task
  deleteTask: (id) => {
    return api.delete(`/tasks/${id}`);
  },
  
  // Mark task as complete
  completeTask: (id) => {
    return api.put(`/tasks/${id}/complete`);
  },
  
  // Get nearby tasks
  getNearbyTasks: (latitude, longitude, maxDistance = 500) => {
    return api.get('/tasks/nearby', {
      params: { latitude, longitude, maxDistance }
    });
  }
};

// Location API calls
export const locationAPI = {
  // Update user location
  updateLocation: (locationData) => {
    return api.post('/location/update', locationData);
  },
  
  // Get location history
  getLocationHistory: (startDate, endDate) => {
    return api.get('/location/history', {
      params: { startDate, endDate }
    });
  }
};

// User API calls
export const userAPI = {
  // Get user profile
  getProfile: () => {
    return api.get('/users/profile');
  },
  
  // Update user profile
  updateProfile: (userData) => {
    return api.put('/users/profile', userData);
  },
  
  // Update password
  updatePassword: (currentPassword, newPassword) => {
    return api.put('/users/password', { currentPassword, newPassword });
  },
  
  // Register push token
  registerPushToken: (token) => {
    return api.post('/users/push-token', { token });
  }
};
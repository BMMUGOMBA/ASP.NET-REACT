import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

  //Add to token requests if it exist
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');   
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }  
    return config;
  }, (error) => {
    return Promise.reject(error);
  }
);

export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),   
};

export default api;
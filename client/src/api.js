import axios from 'axios';

// baseURL points to server's address
const API = axios.create({ baseURL: 'http://localhost:5000/api' });

API.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    // ensure headers object exists
    config.headers = config.headers || {};
    if (token) {
        // use a template literal so the stored token is inserted
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default API;
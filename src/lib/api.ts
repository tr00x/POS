import axios from 'axios';

export const api = axios.create({
    baseURL: '/api',
});

// Add interceptors if needed (e.g. for auth token)

import axios from 'axios';

const api = axios.create({
    baseURL: 'https://ewp-platform.onrender.com', // Match Django DRF defaults
    withCredentials: true, // IMPORTANT: Allows cookies to be sent
});

// Interceptor to catch 401 Unauthorized errors (JWT expired or invalid) globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const publicPaths = ['/login', '/signup', '/forgot-password'];
            if (!publicPaths.includes(window.location.pathname)) {
                // Clear user data and redirect to login
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;

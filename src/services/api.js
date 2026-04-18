import axios from 'axios';
import store from '@/store';
import router from '@/router';

const api = axios.create({
    baseURL: 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor de request: adjuntar token JWT
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor de response: manejar errores de autenticación
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token expirado o inválido
            store.commit('auth/LOGOUT');
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            router.push('/signin');
        }
        return Promise.reject(error);
    }
);

export default api;

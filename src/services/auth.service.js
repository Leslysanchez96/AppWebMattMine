import api from './api';

export default {
    async login(codigo, password, rol) {
        const response = await api.post('/auth/login', { codigo, password, rol });
        return response.data;
    },

    async recuperarPassword(correo) {
        const response = await api.post('/auth/recuperar-password', { correo });
        return response.data;
    },

    async verificarToken(token) {
        const response = await api.get(`/auth/verificar-token/${token}`);
        return response.data;
    },

    async resetPassword(token, newPassword) {
        const response = await api.post('/auth/reset-password', { token, newPassword });
        return response.data;
    },

    async cambiarPassword(passwordActual, newPassword) {
        const response = await api.post('/auth/cambiar-password', { passwordActual, newPassword });
        return response.data;
    },

    async obtenerPreguntasSeguridad(codigo) {
        const response = await api.get(`/auth/preguntas-seguridad/${codigo}`);
        return response.data;
    },

    async cambiarPasswordSeguridad(codigo, respuestas, newPassword) {
        const response = await api.post('/auth/cambiar-password-seguridad', {
            codigo,
            respuestas,
            newPassword,
        });
        return response.data;
    },

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
    },
};

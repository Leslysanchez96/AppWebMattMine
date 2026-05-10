import api from './api';

export default {
    async listar(params = {}) {
        const response = await api.get('/auditoria', { params });
        return response.data;
    },

    async estadisticas() {
        const response = await api.get('/auditoria/estadisticas');
        return response.data;
    },

    async accionesRecientes(limit = 10) {
        const response = await api.get('/auditoria/acciones-recientes', { params: { limit } });
        return response.data;
    },

    async intentosFallidos() {
        const response = await api.get('/auditoria/intentos-fallidos');
        return response.data;
    },

    async ultimosAccesos(limit = 50) {
        const response = await api.get('/auditoria/ultimos-accesos', { params: { limit } });
        return response.data;
    },

    exportarCSV(params = {}) {
        const query = new URLSearchParams({ ...params, formato: 'csv' }).toString();
        const token = localStorage.getItem('token');
        window.open(`${api.defaults.baseURL}/auditoria/exportar?${query}&token=${token}`, '_blank');
    },

    async exportarJSON(params = {}) {
        const response = await api.get('/auditoria/exportar', { params: { ...params, formato: 'json' } });
        return response.data;
    },
};

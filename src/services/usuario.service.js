import api from './api';

export default {
    async listar(params = {}) {
        const response = await api.get('/usuarios', { params });
        return response.data;
    },

    async obtener(id) {
        const response = await api.get(`/usuarios/${id}`);
        return response.data;
    },

    async crear(datos) {
        const response = await api.post('/usuarios', datos);
        return response.data;
    },

    async actualizar(id, datos) {
        const response = await api.put(`/usuarios/${id}`, datos);
        return response.data;
    },

    async eliminar(id) {
        const response = await api.delete(`/usuarios/${id}`);
        return response.data;
    },

    async asignarRol(id, rol) {
        const response = await api.put(`/usuarios/${id}/rol`, { rol });
        return response.data;
    },

    async miCuenta() {
        const response = await api.get('/mi-cuenta');
        return response.data;
    },

    async estadisticas() {
        const response = await api.get('/usuarios/estadisticas');
        return response.data;
    },

    async listarAuditoria(params = {}) {
        const response = await api.get('/auditoria', { params });
        return response.data;
    },

    exportarAuditoriaUrl(params = {}) {
        const query = new URLSearchParams({ ...params, formato: 'csv' }).toString();
        return `${api.defaults.baseURL}/auditoria/exportar?${query}`;
    },
};

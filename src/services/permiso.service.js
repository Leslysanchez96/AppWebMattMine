import api from './api';

export default {
    async misPermisos() {
        const response = await api.get('/permisos/mis-permisos');
        return response.data;
    },

    async listarModulos() {
        const response = await api.get('/permisos/modulos');
        return response.data;
    },

    async obtenerPermisos(rol) {
        const response = await api.get(`/permisos/${rol}`);
        return response.data;
    },

    async actualizarPermisos(rol, modulo, acciones) {
        const response = await api.put(`/permisos/${rol}`, { modulo, acciones });
        return response.data;
    },
};

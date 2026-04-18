import api from './api';

export default {
    async obtener() {
        const response = await api.get('/politica-seguridad');
        return response.data;
    },

    async actualizar(datos) {
        const response = await api.put('/politica-seguridad', datos);
        return response.data;
    },
};

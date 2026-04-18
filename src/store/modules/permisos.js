import permisoService from '@/services/permiso.service';

const state = {
    permisos: JSON.parse(localStorage.getItem('permisos')) || [],
};

const mutations = {
    SET_PERMISOS(state, permisos) {
        state.permisos = permisos;
        localStorage.setItem('permisos', JSON.stringify(permisos));
    },
    CLEAR_PERMISOS(state) {
        state.permisos = [];
        localStorage.removeItem('permisos');
    },
};

const actions = {
    async cargarPermisos({ commit }) {
        try {
            const data = await permisoService.misPermisos();
            commit('SET_PERMISOS', data.permisos);
        } catch (err) {
            console.error('Error cargando permisos:', err);
        }
    },
};

const getters = {
    tienePermiso: (state) => (modulo, accion) => {
        const mod = state.permisos.find(p => p.modulo === modulo);
        return mod ? mod.acciones.includes(accion) : false;
    },
    permisosModulo: (state) => (modulo) => {
        const mod = state.permisos.find(p => p.modulo === modulo);
        return mod ? mod.acciones : [];
    },
};

export default { namespaced: true, state, mutations, actions, getters };

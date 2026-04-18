import authService from '@/services/auth.service';
import router from '@/router';

const state = {
    usuario: JSON.parse(localStorage.getItem('usuario')) || null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
};

const mutations = {
    SET_USER(state, usuario) {
        state.usuario = usuario;
        state.isAuthenticated = true;
        localStorage.setItem('usuario', JSON.stringify(usuario));
    },
    SET_TOKEN(state, token) {
        state.token = token;
        localStorage.setItem('token', token);
    },
    LOGOUT(state) {
        state.usuario = null;
        state.token = null;
        state.isAuthenticated = false;
        localStorage.removeItem('usuario');
        localStorage.removeItem('token');
    },
};

const actions = {
    async login({ commit, dispatch }, { codigo, password, rol }) {
        const data = await authService.login(codigo, password, rol);
        commit('SET_TOKEN', data.token);
        commit('SET_USER', data.usuario);
        await dispatch('permisos/cargarPermisos', null, { root: true });
        return data;
    },

    logout({ commit }) {
        authService.logout();
        commit('LOGOUT');
        commit('permisos/CLEAR_PERMISOS', null, { root: true });
        router.push('/signin');
    },

    async checkAuth({ commit, dispatch }) {
        const token = localStorage.getItem('token');
        const usuario = localStorage.getItem('usuario');
        if (token && usuario) {
            commit('SET_TOKEN', token);
            commit('SET_USER', JSON.parse(usuario));
            await dispatch('permisos/cargarPermisos', null, { root: true });
        } else {
            commit('LOGOUT');
        }
    },
};

const getters = {
    isAuthenticated: (state) => state.isAuthenticated,
    currentUser: (state) => state.usuario,
    userRole: (state) => state.usuario?.rol || null,
    userName: (state) => state.usuario ? `${state.usuario.nombres} ${state.usuario.apellido}` : '',
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters,
};

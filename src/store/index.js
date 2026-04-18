import { createStore } from "vuex";
import auth from "./modules/auth";
import permisos from "./modules/permisos";

export default createStore({
  modules: {
    auth,
    permisos,
  },
  state: {
    hideConfigButton: false,
    isPinned: false,
    showConfig: false,
    sidebarType: "bg-white",
    isRTL: false,
    mcolor: "",
    darkMode: false,
    isNavFixed: false,
    isAbsolute: false,
    showNavs: true,
    showSidenav: true,
    showNavbar: true,
    showFooter: true,
    showMain: true,
    layout: "default",
  },
  mutations: {
    toggleConfigurator(state) {
      state.showConfig = !state.showConfig;
    },
    toggleDarkMode(state) {
      state.darkMode = !state.darkMode;
      const body = document.body;
      if (state.darkMode) {
        body.classList.add("dark-version");
        state.sidebarType = "bg-default";
      } else {
        body.classList.remove("dark-version");
        state.sidebarType = "bg-white";
      }
    },
    sidebarMinimize(state) {
      const app = document.querySelector("#app");
      const isSmall = window.innerWidth < 1200;
      if (isSmall) {
        // En móvil/tablet: mostrar/ocultar con translateX via clases de Argon
        if (state.isPinned) {
          app.classList.remove("g-sidenav-pinned");
          state.isPinned = false;
        } else {
          app.classList.add("g-sidenav-pinned");
          state.isPinned = true;
        }
      } else {
        // En desktop: mostrar/ocultar completamente
        state.showSidenav = !state.showSidenav;
      }
    },
    sidebarType(state, payload) {
      state.sidebarType = payload;
    },
    navbarFixed(state) {
      state.isNavFixed = !state.isNavFixed;
    },
  },
  actions: {
    toggleSidebarColor({ commit }, payload) {
      commit("sidebarType", payload);
    },
  },
  getters: {},
});

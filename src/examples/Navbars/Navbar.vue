<script setup>
import { computed, ref } from "vue";
import { useStore } from "vuex";

const showMenu = ref(false);
const showUserMenu = ref(false);
const store = useStore();
const darkMode = computed(() => store.state.darkMode);

const minimizeSidebar = () => store.commit("sidebarMinimize");
const toggleDarkMode = () => store.commit("toggleDarkMode");

const closeMenu = () => {
  setTimeout(() => {
    showMenu.value = false;
  }, 100);
};

const closeUserMenu = () => {
  setTimeout(() => {
    showUserMenu.value = false;
  }, 100);
};

const userName = computed(() => store.getters["auth/userName"] || "Usuario");
const userInitial = computed(() => userName.value.charAt(0).toUpperCase());
const userRole = computed(() => store.getters["auth/userRole"] || "");

const roleColor = computed(() => {
  const colors = {
    Estudiante: "bg-gradient-info",
    Docente: "bg-gradient-success",
    Administrador: "bg-gradient-primary",
  };
  return colors[userRole.value] || "bg-gradient-dark";
});

const handleLogout = () => {
  store.dispatch("auth/logout");
};
</script>
<template>
  <nav
    class="navbar navbar-main navbar-expand-lg px-0 mx-4 shadow-none border-radius-xl"
    v-bind="$attrs"
    id="navbarBlur"
    data-scroll="true"
  >
    <div class="px-3 py-1 container-fluid">
      <!-- Search bar -->
      <div class="d-flex align-items-center">
        <div class="input-group" style="max-width: 280px;">
          <input
            type="text"
            class="form-control"
            placeholder="Search here..."
            :class="darkMode ? 'bg-default text-white border-0' : ''"
          />
          <span class="input-group-text" :class="darkMode ? 'bg-default border-0' : ''">
            <i class="fas fa-search" :class="darkMode ? 'text-white' : 'text-body'" aria-hidden="true"></i>
          </span>
        </div>
      </div>

      <!-- Right icons -->
      <div class="d-flex align-items-center">
        <!-- Sidebar toggle -->
        <a
          href="#"
          @click.prevent="minimizeSidebar"
          class="nav-link p-0 me-3"
          :class="darkMode ? 'text-white' : 'text-body'"
        >
          <i class="fas fa-bars" style="font-size: 1.1rem;"></i>
        </a>

        <!-- Notifications -->
        <div class="dropdown me-3">
          <a
            href="#"
            class="nav-link p-0 position-relative"
            :class="darkMode ? 'text-white' : 'text-body'"
            id="dropdownMenuButton"
            aria-expanded="false"
            @click.prevent="showMenu = !showMenu"
            @blur="closeMenu"
          >
            <i class="fas fa-bell" style="font-size: 1.1rem;"></i>
            <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style="font-size: 0.55rem; padding: 0.2em 0.45em;">
              3
            </span>
          </a>
          <ul
            v-if="showMenu"
            class="px-2 py-3 dropdown-menu dropdown-menu-end me-sm-n4 show"
            aria-labelledby="dropdownMenuButton"
          >
            <li class="mb-2">
              <a class="dropdown-item border-radius-md" href="javascript:;">
                <div class="py-1 d-flex">
                  <div class="my-auto avatar avatar-sm bg-gradient-info me-3 d-flex align-items-center justify-content-center">
                    <i class="ni ni-paper-diploma text-white" style="font-size: 14px;"></i>
                  </div>
                  <div class="d-flex flex-column justify-content-center">
                    <h6 class="mb-1 text-sm font-weight-normal">
                      <span class="font-weight-bold">Nueva evaluacion</span> disponible
                    </h6>
                    <p class="mb-0 text-xs text-secondary">
                      <i class="fa fa-clock me-1"></i>
                      Hace 15 minutos
                    </p>
                  </div>
                </div>
              </a>
            </li>
            <li class="mb-2">
              <a class="dropdown-item border-radius-md" href="javascript:;">
                <div class="py-1 d-flex">
                  <div class="my-auto avatar avatar-sm bg-gradient-success me-3 d-flex align-items-center justify-content-center">
                    <i class="ni ni-check-bold text-white" style="font-size: 14px;"></i>
                  </div>
                  <div class="d-flex flex-column justify-content-center">
                    <h6 class="mb-1 text-sm font-weight-normal">
                      <span class="font-weight-bold">Resultados publicados</span> - Evaluacion 5
                    </h6>
                    <p class="mb-0 text-xs text-secondary">
                      <i class="fa fa-clock me-1"></i>
                      Hace 2 horas
                    </p>
                  </div>
                </div>
              </a>
            </li>
            <li>
              <a class="dropdown-item border-radius-md" href="javascript:;">
                <div class="py-1 d-flex">
                  <div class="my-auto avatar avatar-sm bg-gradient-warning me-3 d-flex align-items-center justify-content-center">
                    <i class="ni ni-bell-55 text-white" style="font-size: 14px;"></i>
                  </div>
                  <div class="d-flex flex-column justify-content-center">
                    <h6 class="mb-1 text-sm font-weight-normal">
                      Tienes <span class="font-weight-bold">3 alertas</span> pendientes
                    </h6>
                    <p class="mb-0 text-xs text-secondary">
                      <i class="fa fa-clock me-1"></i>
                      Hace 1 dia
                    </p>
                  </div>
                </div>
              </a>
            </li>
          </ul>
        </div>

        <!-- Dark mode toggle -->
        <a
          href="javascript:;"
          @click="toggleDarkMode"
          class="nav-link p-0 me-3 dark-mode-toggle"
          :class="darkMode ? 'text-warning' : 'text-body'"
          title="Modo oscuro"
        >
          <i
            :class="darkMode ? 'fas fa-sun' : 'fas fa-moon'"
            class="dark-mode-icon"
            style="font-size: 1.1rem;"
          ></i>
        </a>

        <!-- User avatar dropdown -->
        <div class="dropdown">
          <a
            href="#"
            class="d-flex align-items-center text-decoration-none"
            id="userDropdown"
            aria-expanded="false"
            @click.prevent="showUserMenu = !showUserMenu"
            @blur="closeUserMenu"
            style="cursor: pointer;"
          >
            <div
              class="d-flex align-items-center justify-content-center rounded-circle"
              :class="roleColor"
              style="width: 32px; height: 32px; font-size: 13px; color: white; font-weight: bold;"
            >
              {{ userInitial }}
            </div>
          </a>
          <ul v-if="showUserMenu" class="dropdown-menu dropdown-menu-end py-2 show" aria-labelledby="userDropdown">
            <li class="px-3 py-2 border-bottom">
              <h6 class="text-sm mb-0">{{ userName }}</h6>
              <p class="text-xs text-muted mb-0">{{ userRole }}</p>
            </li>
            <li>
              <a class="dropdown-item border-radius-md" href="javascript:;" @click="$router.push('/profile')">
                <i class="ni ni-circle-08 me-2 text-sm"></i> Mi Perfil
              </a>
            </li>
            <li><hr class="dropdown-divider"></li>
            <li>
              <a class="dropdown-item border-radius-md text-danger" href="javascript:;" @click="handleLogout">
                <i class="ni ni-user-run me-2 text-sm"></i> Cerrar Sesion
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.dark-mode-toggle {
  transition: all 0.3s ease;
}

.dark-mode-icon {
  transition: transform 0.4s ease, color 0.3s ease;
  display: inline-block;
}

.dark-mode-toggle:hover .dark-mode-icon {
  transform: rotate(30deg) scale(1.15);
}

.dropdown-toggle::after {
  display: none;
}

.navbar .nav-link:hover {
  opacity: 0.8;
}
</style>

<style>
#navbarBlur .dropdown .dropdown-menu::before {
  display: none !important;
}
#navbarBlur .dropdown:not(.dropdown-hover) .dropdown-menu {
  margin-top: 4px !important;
}

/* Notificaciones responsive en móvil */
@media (max-width: 767px) {
  #navbarBlur .dropdown .dropdown-menu {
    position: fixed !important;
    top: 60px !important;
    left: 50% !important;
    transform: translateX(-50%) !important;
    right: auto !important;
    width: 90vw !important;
    max-width: 360px !important;
    margin-top: 0 !important;
    z-index: 1050 !important;
  }
}
</style>

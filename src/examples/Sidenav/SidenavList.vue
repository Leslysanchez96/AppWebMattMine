<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import SidenavItem from "./SidenavItem.vue";

const store = useStore();
const handleLogout = () => {
  store.dispatch("auth/logout");
};

const getRoute = () => {
  const route = useRoute();
  const routeArr = route.path.split("/");
  return routeArr[1];
};

const rol = computed(() => store.getters["auth/userRole"] || "");

// Helper de permisos para mostrar/ocultar items del menú
const tienePermiso = (modulo, accion) => {
  return store.getters["permisos/tienePermiso"](modulo, accion);
};

const dashboardRoute = computed(() => {
  if (rol.value === "Estudiante") return "/dashboard-alumno";
  if (rol.value === "Docente") return "/dashboard-docente";
  if (rol.value === "Administrador") return "/dashboard-admin";
  return "/dashboard-default";
});
</script>
<template>
  <div
    class="collapse navbar-collapse w-auto h-auto h-100"
    id="sidenav-collapse-main"
  >
    <ul class="navbar-nav">
      <!-- Dashboard (todos los roles) -->
      <li class="nav-item">
        <sidenav-item
          :to="dashboardRoute"
          :class="getRoute().startsWith('dashboard') ? 'active' : ''"
          navText="Dashboard"
        >
          <template v-slot:icon>
            <i class="ni ni-tv-2 text-primary text-sm opacity-10"></i>
          </template>
        </sidenav-item>
      </li>

      <!-- ═══ MENÚ ALUMNO ═══ -->
      <template v-if="rol === 'Estudiante'">
        <li class="mt-3 nav-item">
          <h6 class="text-xs ps-4 text-uppercase font-weight-bolder opacity-6 ms-2">
            MI APRENDIZAJE
          </h6>
        </li>
        <li class="nav-item">
          <sidenav-item
            to="/mis-evaluaciones"
            :class="getRoute() === 'mis-evaluaciones' ? 'active' : ''"
            navText="Mis Evaluaciones"
          >
            <template v-slot:icon>
              <i class="ni ni-paper-diploma text-success text-sm opacity-10"></i>
            </template>
          </sidenav-item>
        </li>
        <li class="nav-item">
          <sidenav-item
            to="/mis-resultados"
            :class="getRoute() === 'mis-resultados' ? 'active' : ''"
            navText="Mis Resultados"
          >
            <template v-slot:icon>
              <i class="ni ni-chart-bar-32 text-info text-sm opacity-10"></i>
            </template>
          </sidenav-item>
        </li>
        <li class="nav-item">
          <sidenav-item
            to="/mis-temas"
            :class="getRoute() === 'mis-temas' ? 'active' : ''"
            navText="Temas del Curso"
          >
            <template v-slot:icon>
              <i class="ni ni-book-bookmark text-warning text-sm opacity-10"></i>
            </template>
          </sidenav-item>
        </li>

        <li class="mt-3 nav-item">
          <h6 class="text-xs ps-4 text-uppercase font-weight-bolder opacity-6 ms-2">
            PERSONALIZACIÓN
          </h6>
        </li>
        <li class="nav-item">
          <sidenav-item
            to="/mis-preferencias"
            :class="getRoute() === 'mis-preferencias' ? 'active' : ''"
            navText="Mis Preferencias"
          >
            <template v-slot:icon>
              <i class="fas fa-heart text-danger text-sm opacity-10"></i>
            </template>
          </sidenav-item>
        </li>
      </template>

      <!-- ═══ MENÚ DOCENTE ═══ -->
      <template v-if="rol === 'Docente'">
        <li class="mt-3 nav-item">
          <h6 class="text-xs ps-4 text-uppercase font-weight-bolder opacity-6 ms-2">
            GESTIÓN ACADÉMICA
          </h6>
        </li>
        <li class="nav-item">
          <sidenav-item
            to="/mis-aulas"
            :class="getRoute() === 'mis-aulas' ? 'active' : ''"
            navText="Mis Aulas"
          >
            <template v-slot:icon>
              <i class="ni ni-building text-success text-sm opacity-10"></i>
            </template>
          </sidenav-item>
        </li>
        <li class="nav-item">
          <sidenav-item
            to="/evaluaciones"
            :class="getRoute() === 'evaluaciones' ? 'active' : ''"
            navText="Evaluaciones"
          >
            <template v-slot:icon>
              <i class="ni ni-paper-diploma text-info text-sm opacity-10"></i>
            </template>
          </sidenav-item>
        </li>
        <li class="nav-item">
          <sidenav-item
            to="/resultados"
            :class="getRoute() === 'resultados' ? 'active' : ''"
            navText="Resultados"
          >
            <template v-slot:icon>
              <i class="ni ni-chart-bar-32 text-warning text-sm opacity-10"></i>
            </template>
          </sidenav-item>
        </li>

        <li class="mt-3 nav-item">
          <h6 class="text-xs ps-4 text-uppercase font-weight-bolder opacity-6 ms-2">
            CONTENIDOS
          </h6>
        </li>
        <li class="nav-item">
          <sidenav-item
            to="/temas"
            :class="getRoute() === 'temas' ? 'active' : ''"
            navText="Temas"
          >
            <template v-slot:icon>
              <i class="fas fa-list-ol text-primary text-sm opacity-10"></i>
            </template>
          </sidenav-item>
        </li>
        <li class="nav-item">
          <sidenav-item
            to="/materiales"
            :class="getRoute() === 'materiales' ? 'active' : ''"
            navText="Materiales"
          >
            <template v-slot:icon>
              <i class="fas fa-folder-open text-info text-sm opacity-10"></i>
            </template>
          </sidenav-item>
        </li>

        <li class="mt-3 nav-item">
          <h6 class="text-xs ps-4 text-uppercase font-weight-bolder opacity-6 ms-2">
            SEGUIMIENTO
          </h6>
        </li>
        <li class="nav-item">
          <sidenav-item
            to="/alertas"
            :class="getRoute() === 'alertas' ? 'active' : ''"
            navText="Alertas de Riesgo"
          >
            <template v-slot:icon>
              <i class="ni ni-bell-55 text-danger text-sm opacity-10"></i>
            </template>
          </sidenav-item>
        </li>
        <li class="nav-item">
          <sidenav-item
            to="/reportes"
            :class="getRoute() === 'reportes' ? 'active' : ''"
            navText="Reportes"
          >
            <template v-slot:icon>
              <i class="ni ni-single-copy-04 text-dark text-sm opacity-10"></i>
            </template>
          </sidenav-item>
        </li>
      </template>

      <!-- ═══ MENÚ ADMINISTRADOR ═══ -->
      <template v-if="rol === 'Administrador'">
        <li class="mt-3 nav-item">
          <h6 class="text-xs ps-4 text-uppercase font-weight-bolder opacity-6 ms-2">
            ADMINISTRACIÓN
          </h6>
        </li>
        <li class="nav-item" v-if="tienePermiso('usuarios', 'ver')">
          <sidenav-item
            to="/admin/usuarios"
            :class="$route.path === '/admin/usuarios' ? 'active' : ''"
            navText="Usuarios"
          >
            <template v-slot:icon>
              <i class="ni ni-single-02 text-primary text-sm opacity-10"></i>
            </template>
          </sidenav-item>
        </li>
        <li class="nav-item" v-if="tienePermiso('roles', 'ver')">
          <sidenav-item
            to="/admin/roles"
            :class="$route.path === '/admin/roles' ? 'active' : ''"
            navText="Roles y Permisos"
          >
            <template v-slot:icon>
              <i class="ni ni-badge text-warning text-sm opacity-10"></i>
            </template>
          </sidenav-item>
        </li>
        <li class="nav-item" v-if="tienePermiso('auditoria', 'ver')">
          <sidenav-item
            to="/admin/auditoria"
            :class="$route.path === '/admin/auditoria' ? 'active' : ''"
            navText="Auditoría"
          >
            <template v-slot:icon>
              <i class="ni ni-bullet-list-67 text-info text-sm opacity-10"></i>
            </template>
          </sidenav-item>
        </li>
        <li class="nav-item">
          <sidenav-item
            to="/admin/politicas-seguridad"
            :class="$route.path === '/admin/politicas-seguridad' ? 'active' : ''"
            navText="Políticas de Seguridad"
          >
            <template v-slot:icon>
              <i class="fas fa-shield-alt text-danger text-sm opacity-10"></i>
            </template>
          </sidenav-item>
        </li>
        <li class="nav-item">
          <sidenav-item
            to="/aulas"
            :class="getRoute() === 'aulas' ? 'active' : ''"
            navText="Aulas"
          >
            <template v-slot:icon>
              <i class="ni ni-building text-success text-sm opacity-10"></i>
            </template>
          </sidenav-item>
        </li>
        <li class="nav-item">
          <sidenav-item
            to="/admin/cursos"
            :class="getRoute() === 'admin' && $route.path.includes('cursos') ? 'active' : ''"
            navText="Cursos"
          >
            <template v-slot:icon>
              <i class="ni ni-book-bookmark text-info text-sm opacity-10"></i>
            </template>
          </sidenav-item>
        </li>
        <li class="nav-item">
          <sidenav-item
            to="/temas"
            :class="getRoute() === 'temas' ? 'active' : ''"
            navText="Temas"
          >
            <template v-slot:icon>
              <i class="fas fa-list-ol text-warning text-sm opacity-10"></i>
            </template>
          </sidenav-item>
        </li>
        <li class="nav-item">
          <sidenav-item
            to="/materiales"
            :class="getRoute() === 'materiales' ? 'active' : ''"
            navText="Materiales"
          >
            <template v-slot:icon>
              <i class="fas fa-folder-open text-success text-sm opacity-10"></i>
            </template>
          </sidenav-item>
        </li>

        <li class="mt-3 nav-item">
          <h6 class="text-xs ps-4 text-uppercase font-weight-bolder opacity-6 ms-2">
            ACADÉMICO
          </h6>
        </li>
        <li class="nav-item">
          <sidenav-item
            to="/evaluaciones"
            :class="getRoute() === 'evaluaciones' ? 'active' : ''"
            navText="Evaluaciones"
          >
            <template v-slot:icon>
              <i class="ni ni-paper-diploma text-warning text-sm opacity-10"></i>
            </template>
          </sidenav-item>
        </li>
        <li class="nav-item">
          <sidenav-item
            to="/reportes"
            :class="getRoute() === 'reportes' ? 'active' : ''"
            navText="Reportes"
          >
            <template v-slot:icon>
              <i class="ni ni-chart-pie-35 text-dark text-sm opacity-10"></i>
            </template>
          </sidenav-item>
        </li>
        <li class="nav-item">
          <sidenav-item
            to="/alertas"
            :class="getRoute() === 'alertas' ? 'active' : ''"
            navText="Alertas"
          >
            <template v-slot:icon>
              <i class="ni ni-bell-55 text-danger text-sm opacity-10"></i>
            </template>
          </sidenav-item>
        </li>
      </template>

      <!-- Perfil y Cerrar Sesión (todos los roles) -->
      <li class="mt-3 nav-item">
        <h6 class="text-xs ps-4 text-uppercase font-weight-bolder opacity-6 ms-2">
          MI CUENTA
        </h6>
      </li>
      <li class="nav-item">
        <sidenav-item
          to="/profile"
          :class="getRoute() === 'profile' ? 'active' : ''"
          navText="Mi Perfil"
        >
          <template v-slot:icon>
            <i class="ni ni-circle-08 text-dark text-sm opacity-10"></i>
          </template>
        </sidenav-item>
      </li>
      <li class="nav-item">
        <sidenav-item
          to="/cambiar-password"
          :class="getRoute() === 'cambiar-password' ? 'active' : ''"
          navText="Cambiar Contraseña"
        >
          <template v-slot:icon>
            <i class="ni ni-lock-circle-open text-warning text-sm opacity-10"></i>
          </template>
        </sidenav-item>
      </li>
      <li class="nav-item">
        <a href="javascript:;" class="nav-link" @click="handleLogout">
          <div class="icon icon-shape icon-sm text-center d-flex align-items-center justify-content-center">
            <i class="ni ni-user-run text-danger text-sm opacity-10"></i>
          </div>
          <span class="nav-link-text ms-1">Cerrar Sesión</span>
        </a>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import SidenavItem from "./SidenavItem.vue";

const router = useRouter();
const handleLogout = () => {
  localStorage.removeItem("usuario");
  router.push("/signin");
};

const getRoute = () => {
  const route = useRoute();
  const routeArr = route.path.split("/");
  return routeArr[1];
};

const usuario = computed(() => {
  try {
    return JSON.parse(localStorage.getItem("usuario")) || {};
  } catch {
    return {};
  }
});

const rol = computed(() => usuario.value.rol || "");

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
        <li class="nav-item">
          <sidenav-item
            to="/usuarios"
            :class="getRoute() === 'usuarios' ? 'active' : ''"
            navText="Usuarios"
          >
            <template v-slot:icon>
              <i class="ni ni-single-02 text-primary text-sm opacity-10"></i>
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
            to="/cursos"
            :class="getRoute() === 'cursos' ? 'active' : ''"
            navText="Cursos"
          >
            <template v-slot:icon>
              <i class="ni ni-book-bookmark text-info text-sm opacity-10"></i>
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

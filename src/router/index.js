import { createRouter, createWebHistory } from "vue-router";
import DashboardAlumno from "../views/DashboardAlumno.vue";
import DashboardDocente from "../views/DashboardDocente.vue";
import DashboardAdmin from "../views/DashboardAdmin.vue";
import Tables from "../views/Tables.vue";
import Billing from "../views/Billing.vue";
import VirtualReality from "../views/VirtualReality.vue";
import RTL from "../views/Rtl.vue";
import Profile from "../views/Profile.vue";
import Signin from "../views/Signin.vue";
import ResetPassword from "../views/ResetPassword.vue";
import ChangePassword from "../views/auth/ChangePassword.vue";
import UserManagement from "../views/admin/UserManagement.vue";
import RoleManagement from "../views/admin/RoleManagement.vue";
import AuditLog from "../views/admin/AuditLog.vue";
import CourseManager from "../views/admin/CourseManager.vue";
import TopicManager from "../views/TopicManager.vue";
import Materials from "../views/Materials.vue";
import Preferences from "../views/Preferences.vue";
import SecurityPolicies from "../views/admin/SecurityPolicies.vue";
import store from "@/store";

const routes = [
  {
    path: "/",
    name: "/",
    redirect: "/signin",
  },
  {
    path: "/dashboard-default",
    name: "Dashboard",
    meta: { requiresAuth: true },
    beforeEnter: (to, from, next) => {
      const rol = store.getters["auth/userRole"];
      if (rol === "Estudiante") return next("/dashboard-alumno");
      if (rol === "Docente") return next("/dashboard-docente");
      if (rol === "Administrador") return next("/dashboard-admin");
      return next("/signin");
    },
  },
  {
    path: "/dashboard-alumno",
    name: "DashboardAlumno",
    component: DashboardAlumno,
    meta: { requiresAuth: true, roles: ["Estudiante"] },
  },
  {
    path: "/dashboard-docente",
    name: "DashboardDocente",
    component: DashboardDocente,
    meta: { requiresAuth: true, roles: ["Docente"] },
  },
  {
    path: "/dashboard-admin",
    name: "DashboardAdmin",
    component: DashboardAdmin,
    meta: { requiresAuth: true, roles: ["Administrador"] },
  },
  {
    path: "/tables",
    name: "Tables",
    component: Tables,
    meta: { requiresAuth: true },
  },
  {
    path: "/billing",
    name: "Billing",
    component: Billing,
    meta: { requiresAuth: true },
  },
  {
    path: "/virtual-reality",
    name: "Virtual Reality",
    component: VirtualReality,

    meta: { requiresAuth: true },
  },
  {
    path: "/rtl-page",
    name: "RTL",
    component: RTL,

    meta: { requiresAuth: true },
  },
  {
    path: "/profile",
    name: "Profile",
    component: Profile,
    meta: { requiresAuth: true },
  },
  {
    path: "/cambiar-password",
    name: "ChangePassword",
    component: ChangePassword,
    meta: { requiresAuth: true },
  },
  {
    path: "/admin/usuarios",
    name: "UserManagement",
    component: UserManagement,
    meta: { requiresAuth: true, permiso: { modulo: "usuarios", accion: "ver" } },
  },
  {
    path: "/admin/roles",
    name: "RoleManagement",
    component: RoleManagement,
    meta: { requiresAuth: true, permiso: { modulo: "roles", accion: "ver" } },
  },
  {
    path: "/admin/auditoria",
    name: "AuditLog",
    component: AuditLog,
    meta: { requiresAuth: true, permiso: { modulo: "auditoria", accion: "ver" } },
  },
  {
    path: "/admin/politicas-seguridad",
    name: "SecurityPolicies",
    component: SecurityPolicies,
    meta: { requiresAuth: true, roles: ["Administrador"] },
  },
  {
    path: "/admin/cursos",
    name: "CourseManager",
    component: CourseManager,
    meta: { requiresAuth: true, permiso: { modulo: "cursos", accion: "ver" } },
  },
  {
    path: "/temas",
    name: "TopicManager",
    component: TopicManager,
    meta: { requiresAuth: true, permiso: { modulo: "temas", accion: "ver" } },
  },
  {
    path: "/materiales",
    name: "Materials",
    component: Materials,
    meta: { requiresAuth: true, permiso: { modulo: "materiales", accion: "ver" } },
  },
  {
    path: "/mis-preferencias",
    name: "Preferences",
    component: Preferences,
    meta: { requiresAuth: true, roles: ["Estudiante"] },
  },
  {
    path: "/signin",
    name: "Signin",
    component: Signin,
    meta: { guest: true },
  },
  {
    path: "/reset-password",
    name: "ResetPassword",
    component: ResetPassword,
    meta: { guest: true },
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  linkActiveClass: "active",
});

// Helper: redirigir al dashboard según rol
function redirigirDashboard(rol) {
  if (rol === "Estudiante") return "/dashboard-alumno";
  if (rol === "Docente") return "/dashboard-docente";
  if (rol === "Administrador") return "/dashboard-admin";
  return "/signin";
}

// Route guards
router.beforeEach((to, from, next) => {
  // Restaurar sesión desde localStorage antes de evaluar la ruta
  if (!store.getters["auth/isAuthenticated"]) {
    store.dispatch("auth/checkAuth");
  }

  const isAuthenticated = store.getters["auth/isAuthenticated"];
  const userRole = store.getters["auth/userRole"];

  // Rutas que requieren autenticación
  if (to.meta.requiresAuth && !isAuthenticated) {
    return next("/signin");
  }

  // Rutas solo para invitados (signin, reset)
  if (to.meta.guest && isAuthenticated) {
    return next(redirigirDashboard(userRole));
  }

  // Verificar permisos granulares
  if (to.meta.permiso) {
    const { modulo, accion } = to.meta.permiso;
    const tienePermiso = store.getters["permisos/tienePermiso"](modulo, accion);
    if (!tienePermiso) {
      return next(redirigirDashboard(userRole));
    }
  }

  // Verificar roles (para rutas que aún usan roles como dashboards)
  if (to.meta.roles && !to.meta.roles.includes(userRole)) {
    return next(redirigirDashboard(userRole));
  }

  next();
});

export default router;

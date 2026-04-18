<script setup>
import { ref, onMounted, computed } from "vue";
import permisoService from "@/services/permiso.service";

const roles = ["Administrador", "Docente", "Estudiante"];
const acciones = ["ver", "crear", "editar", "eliminar"];
const accionLabels = { ver: "Ver", crear: "Crear", editar: "Editar", eliminar: "Eliminar" };
const accionIcons = { ver: "fas fa-eye", crear: "fas fa-plus", editar: "fas fa-pen", eliminar: "fas fa-trash" };
const accionColors = { ver: "#6366f1", crear: "#10b981", editar: "#f59e0b", eliminar: "#ef4444" };

const selectedRol = ref("Administrador");
const permisos = ref([]);
const isLoading = ref(false);
const isSaving = ref(false);
const error = ref("");
const successMsg = ref("");
const hasChanges = ref(false);

// Estado original para detectar cambios
const originalState = ref("");

const moduloIcons = {
  usuarios: "fas fa-users",
  roles: "fas fa-shield-alt",
  auditoria: "fas fa-history",
  cursos: "fas fa-book",
  temas: "fas fa-list-ol",
  materiales: "fas fa-folder-open",
  evaluaciones: "fas fa-paper-plane",
  reportes: "fas fa-chart-pie",
};

const moduloColors = {
  usuarios: "#6366f1",
  roles: "#f59e0b",
  auditoria: "#8b5cf6",
  cursos: "#3b82f6",
  temas: "#10b981",
  materiales: "#06b6d4",
  evaluaciones: "#ec4899",
  reportes: "#f97316",
};

async function cargarPermisos() {
  isLoading.value = true;
  error.value = "";
  try {
    const data = await permisoService.obtenerPermisos(selectedRol.value);
    permisos.value = data.permisos;
    originalState.value = JSON.stringify(data.permisos);
    hasChanges.value = false;
  } catch (err) {
    error.value = err.response?.data?.error || "Error al cargar permisos.";
  } finally {
    isLoading.value = false;
  }
}

function tieneAccion(modulo, accion) {
  const mod = permisos.value.find((p) => p.modulo === modulo);
  return mod ? mod.acciones.includes(accion) : false;
}

function toggleAccion(modulo, accion) {
  const mod = permisos.value.find((p) => p.modulo === modulo);
  if (!mod) return;

  const idx = mod.acciones.indexOf(accion);
  if (idx >= 0) {
    mod.acciones.splice(idx, 1);
  } else {
    mod.acciones.push(accion);
    mod.acciones.sort();
  }
  hasChanges.value = JSON.stringify(permisos.value) !== originalState.value;
}

async function guardarPermisos() {
  isSaving.value = true;
  error.value = "";
  successMsg.value = "";
  try {
    for (const p of permisos.value) {
      await permisoService.actualizarPermisos(selectedRol.value, p.modulo, p.acciones);
    }
    successMsg.value = `Permisos de ${selectedRol.value} guardados correctamente.`;
    originalState.value = JSON.stringify(permisos.value);
    hasChanges.value = false;
    setTimeout(() => (successMsg.value = ""), 4000);
  } catch (err) {
    error.value = err.response?.data?.error || "Error al guardar permisos.";
  } finally {
    isSaving.value = false;
  }
}

function selectRol(rol) {
  selectedRol.value = rol;
  cargarPermisos();
}

function seleccionarTodo(modulo) {
  const mod = permisos.value.find((p) => p.modulo === modulo);
  if (!mod) return;
  mod.acciones = [...acciones];
  hasChanges.value = JSON.stringify(permisos.value) !== originalState.value;
}

function deseleccionarTodo(modulo) {
  const mod = permisos.value.find((p) => p.modulo === modulo);
  if (!mod) return;
  mod.acciones = [];
  hasChanges.value = JSON.stringify(permisos.value) !== originalState.value;
}

const totalPermisos = computed(() => {
  return permisos.value.reduce((sum, p) => sum + p.acciones.length, 0);
});

const totalPosibles = computed(() => {
  return permisos.value.length * acciones.length;
});

onMounted(cargarPermisos);
</script>

<template>
  <div class="container-fluid py-4">
    <!-- Alertas -->
    <transition name="fade">
      <div v-if="successMsg" class="alert alert-success text-white text-sm py-2 px-3 d-flex align-items-center" style="border-radius: 10px;">
        <i class="fas fa-check-circle me-2"></i>{{ successMsg }}
      </div>
    </transition>
    <transition name="fade">
      <div v-if="error" class="alert alert-danger text-white text-sm py-2 px-3 d-flex align-items-center" style="border-radius: 10px;">
        <i class="fas fa-exclamation-circle me-2"></i>{{ error }}
        <button class="btn-close btn-close-white ms-auto" @click="error = ''"></button>
      </div>
    </transition>

    <!-- Stats cards -->
    <div class="row g-3 mb-4">
      <div class="col-md-4" v-for="rol in roles" :key="rol">
        <div
          class="role-card"
          :class="{ active: selectedRol === rol }"
          @click="selectRol(rol)"
          :style="{ '--role-color': rolColor(rol) }"
        >
          <div class="role-card-bg"></div>
          <div class="role-card-content">
            <div class="role-icon-box" :style="{ background: rolColor(rol) }">
              <i :class="rolIcon(rol)" class="text-white"></i>
              <div class="role-ripple"></div>
            </div>
            <div class="role-info">
              <span class="role-label">{{ rol }}</span>
              <span class="role-sublabel">{{ rolDescripcion(rol) }}</span>
            </div>
            <div v-if="selectedRol === rol" class="role-active-badge">
              <i class="fas fa-check"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Card principal -->
    <div class="card shadow-lg border-0">
      <!-- Header -->
      <div class="card-header header-animated d-flex justify-content-between align-items-center"
           style="background: linear-gradient(135deg, #1e1b4b, #4338ca, #6366f1); border-radius: 12px 12px 0 0; position: relative; overflow: hidden;">
        <div class="header-particles"></div>
        <div class="d-flex align-items-center" style="position: relative; z-index: 2;">
          <div class="header-icon-box me-3">
            <i class="fas fa-shield-alt"></i>
          </div>
          <div>
            <h5 class="text-white mb-0 font-weight-bold">Permisos de {{ selectedRol }}</h5>
            <p class="text-white text-sm mb-0" style="opacity: 0.7;">
              {{ totalPermisos }} de {{ totalPosibles }} permisos activos
            </p>
          </div>
        </div>
        <button
          v-if="hasChanges"
          class="btn-guardar-permisos"
          :disabled="isSaving"
          @click="guardarPermisos"
        >
          <i class="fas fa-save me-2"></i>
          {{ isSaving ? "Guardando..." : "Guardar Cambios" }}
        </button>
      </div>

      <!-- Tabla de permisos -->
      <div class="card-body px-0 pt-0 pb-2">
        <div v-if="isLoading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="mt-2 text-muted text-sm">Cargando permisos...</p>
        </div>
        <div v-else class="table-responsive p-0">
          <table class="table align-items-center mb-0 permission-table">
            <thead>
              <tr>
                <th class="text-uppercase text-secondary text-xs font-weight-bolder opacity-7 ps-4" style="width: 30%;">Módulo</th>
                <th v-for="accion in acciones" :key="accion" class="text-uppercase text-secondary text-xs font-weight-bolder opacity-7 text-center" style="width: 14%;">
                  <div class="d-flex flex-column align-items-center">
                    <i :class="accionIcons[accion]" class="mb-1" :style="{ color: accionColors[accion], fontSize: '0.7rem' }"></i>
                    <span>{{ accionLabels[accion] }}</span>
                  </div>
                </th>
                <th class="text-uppercase text-secondary text-xs font-weight-bolder opacity-7 text-center" style="width: 16%;">Rápido</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in permisos" :key="p.modulo" class="permission-row">
                <td class="ps-4">
                  <div class="d-flex align-items-center">
                    <div class="modulo-icon-box me-3" :style="{ background: moduloColors[p.modulo] + '15', color: moduloColors[p.modulo] }">
                      <i :class="moduloIcons[p.modulo]"></i>
                    </div>
                    <div>
                      <h6 class="mb-0 text-sm text-capitalize">{{ p.modulo }}</h6>
                      <p class="text-xs text-muted mb-0">{{ p.descripcion }}</p>
                    </div>
                  </div>
                </td>
                <td v-for="accion in acciones" :key="accion" class="text-center">
                  <label class="toggle-switch" @click.prevent="toggleAccion(p.modulo, accion)">
                    <input type="checkbox" :checked="tieneAccion(p.modulo, accion)" />
                    <span class="toggle-slider" :style="tieneAccion(p.modulo, accion) ? { background: accionColors[accion] } : {}"></span>
                  </label>
                </td>
                <td class="text-center">
                  <button
                    v-if="p.acciones.length < acciones.length"
                    class="btn-quick btn-quick-all"
                    @click="seleccionarTodo(p.modulo)"
                    title="Seleccionar todos"
                  >
                    <i class="fas fa-check-double"></i>
                  </button>
                  <button
                    v-else
                    class="btn-quick btn-quick-none"
                    @click="deseleccionarTodo(p.modulo)"
                    title="Quitar todos"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Footer con botón guardar -->
      <div v-if="hasChanges" class="card-footer d-flex justify-content-between align-items-center" style="background: #fef3c7; border-top: 2px solid #f59e0b;">
        <div class="d-flex align-items-center">
          <i class="fas fa-exclamation-triangle text-warning me-2"></i>
          <span class="text-sm text-dark">Tienes cambios sin guardar</span>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-outline-secondary mb-0" @click="cargarPermisos">
            <i class="fas fa-undo me-1"></i>Descartar
          </button>
          <button class="btn btn-sm mb-0" style="background: #4338ca; color: white;" :disabled="isSaving" @click="guardarPermisos">
            <i class="fas fa-save me-1"></i>{{ isSaving ? "Guardando..." : "Guardar" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    rolColor(rol) {
      const map = { Administrador: "#f59e0b", Docente: "#3b82f6", Estudiante: "#10b981" };
      return map[rol] || "#6b7280";
    },
    rolIcon(rol) {
      const map = { Administrador: "fas fa-crown", Docente: "fas fa-chalkboard-teacher", Estudiante: "fas fa-user-graduate" };
      return map[rol] || "fas fa-user";
    },
    rolDescripcion(rol) {
      const map = {
        Administrador: "Control total del sistema",
        Docente: "Gestión académica y contenidos",
        Estudiante: "Acceso a evaluaciones y materiales",
      };
      return map[rol] || "";
    },
  },
};
</script>

<style scoped>
/* ═══ Role Cards ═══ */
.role-card {
  position: relative;
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: #fff;
  border: 2px solid #e5e7eb;
  overflow: hidden;
}
.role-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}
.role-card.active {
  border-color: var(--role-color);
  box-shadow: 0 8px 24px color-mix(in srgb, var(--role-color) 25%, transparent);
}
.role-card-bg {
  position: absolute;
  top: -30px;
  right: -30px;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: var(--role-color);
  opacity: 0.08;
  transition: all 0.3s;
}
.role-card:hover .role-card-bg {
  transform: scale(1.5);
  opacity: 0.12;
}
.role-card-content {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  z-index: 2;
}
.role-icon-box {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  position: relative;
  flex-shrink: 0;
}
.role-ripple {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: inherit;
  background: rgba(255, 255, 255, 0.3);
  animation: ripple-pulse 2s infinite;
}
@keyframes ripple-pulse {
  0%, 100% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(1.15); opacity: 0; }
}
.role-info {
  display: flex;
  flex-direction: column;
}
.role-label {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1e293b;
}
.role-sublabel {
  font-size: 0.75rem;
  color: #94a3b8;
}
.role-active-badge {
  margin-left: auto;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--role-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.7rem;
  animation: pop-in 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
@keyframes pop-in {
  0% { transform: scale(0); }
  100% { transform: scale(1); }
}

/* ═══ Header ═══ */
.header-animated {
  padding: 20px 24px;
}
.header-particles {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background:
    radial-gradient(2px 2px at 10% 20%, rgba(255,255,255,0.3), transparent),
    radial-gradient(2px 2px at 30% 70%, rgba(255,255,255,0.2), transparent),
    radial-gradient(2px 2px at 60% 30%, rgba(255,255,255,0.25), transparent),
    radial-gradient(2px 2px at 80% 80%, rgba(255,255,255,0.15), transparent),
    radial-gradient(2px 2px at 90% 10%, rgba(255,255,255,0.2), transparent);
  animation: float-particles 6s ease-in-out infinite;
}
@keyframes float-particles {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
.header-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.1rem;
}
.btn-guardar-permisos {
  position: relative;
  z-index: 2;
  background: rgba(255, 255, 255, 0.95);
  color: #4338ca;
  border: none;
  border-radius: 10px;
  padding: 8px 20px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}
.btn-guardar-permisos:hover {
  background: #fff;
  box-shadow: 0 4px 12px rgba(67, 56, 202, 0.3);
  transform: translateY(-1px);
}
.btn-guardar-permisos:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* ═══ Permission Table ═══ */
.permission-table thead th {
  background: #f8fafc;
  border-bottom: 2px solid #e2e8f0;
  padding: 14px 12px;
}
.permission-row {
  transition: background 0.2s;
}
.permission-row:hover {
  background: #f8fafc;
}
.permission-row td {
  padding: 14px 12px;
  vertical-align: middle;
  border-bottom: 1px solid #f1f5f9;
}
.modulo-icon-box {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  flex-shrink: 0;
}

/* ═══ Toggle Switch ═══ */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 42px;
  height: 22px;
  cursor: pointer;
  margin: 0;
}
.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}
.toggle-slider {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: #cbd5e1;
  border-radius: 22px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.toggle-slider::before {
  content: "";
  position: absolute;
  width: 18px;
  height: 18px;
  left: 2px;
  bottom: 2px;
  background: white;
  border-radius: 50%;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}
.toggle-switch input:checked + .toggle-slider::before {
  transform: translateX(20px);
}

/* ═══ Quick Buttons ═══ */
.btn-quick {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.75rem;
}
.btn-quick-all {
  background: #ecfdf5;
  color: #10b981;
}
.btn-quick-all:hover {
  background: #d1fae5;
  transform: scale(1.1);
}
.btn-quick-none {
  background: #fef2f2;
  color: #ef4444;
}
.btn-quick-none:hover {
  background: #fee2e2;
  transform: scale(1.1);
}

/* ═══ Transitions ═══ */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>

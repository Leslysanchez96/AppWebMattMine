<script setup>
import { ref, computed, onMounted, watch } from "vue";
import usuarioService from "@/services/usuario.service";

const usuarios = ref([]);
const total = ref(0);
const currentPage = ref(1);
const totalPages = ref(1);
const isLoading = ref(false);
const error = ref("");
const successMsg = ref("");

// Stats
const stats = ref({ total: 0, activos: 0, bloqueados: 0, inactivos: 0 });

// Filtros
const filtroRol = ref("");
const filtroEstado = ref("");
const filtroBusqueda = ref("");

// Modal crear/editar
const showModal = ref(false);
const editMode = ref(false);
const formData = ref({
    id: null, dni: "", codigo: "", password: "", correo: "",
    nombres: "", apellido: "", rol: "Estudiante",
});
const formError = ref("");
const formLoading = ref(false);

// Modal confirmar eliminación
const showDeleteModal = ref(false);
const deleteTarget = ref(null);

// Modal cambiar rol
const showRolModal = ref(false);
const rolTarget = ref(null);
const nuevoRol = ref("");

// Preview del código autogenerado
const codigoPreview = computed(() => {
    const prefijos = { Estudiante: "EST", Docente: "DOC", Administrador: "ADM" };
    const prefijo = prefijos[formData.value.rol] || "USR";
    const anio = new Date().getFullYear().toString().slice(-2);
    const dni = formData.value.dni || "";
    const dniSufijo = dni.length >= 4 ? dni.slice(-4) : "X".repeat(4 - dni.length) + dni;
    return `${prefijo}${anio}${dniSufijo}`;
});

async function cargarUsuarios() {
    isLoading.value = true;
    error.value = "";
    try {
        const data = await usuarioService.listar({
            rol: filtroRol.value || undefined,
            estado: filtroEstado.value || undefined,
            busqueda: filtroBusqueda.value || undefined,
            page: currentPage.value,
            limit: 10,
        });
        usuarios.value = data.usuarios;
        total.value = data.total;
        totalPages.value = data.totalPages;
    } catch (err) {
        error.value = err.response?.data?.error || "Error al cargar usuarios.";
    } finally {
        isLoading.value = false;
    }
}

function abrirCrear() {
    editMode.value = false;
    formData.value = { id: null, dni: "", codigo: "", password: "", correo: "", nombres: "", apellido: "", rol: "Estudiante" };
    formError.value = "";
    showModal.value = true;
}

function abrirEditar(u) {
    editMode.value = true;
    formData.value = { id: u.id_usuario, dni: u.dni, codigo: u.codigo, correo: u.correo, nombres: u.nombres, apellido: u.apellido, rol: u.rol, estado: u.estado };
    formError.value = "";
    showModal.value = true;
}

async function guardarUsuario() {
    formError.value = "";
    formLoading.value = true;
    try {
        if (editMode.value) {
            await usuarioService.actualizar(formData.value.id, {
                dni: formData.value.dni,
                nombres: formData.value.nombres,
                apellido: formData.value.apellido,
                correo: formData.value.correo,
                rol: formData.value.rol,
                estado: formData.value.estado,
            });
            successMsg.value = "Usuario actualizado correctamente.";
        } else {
            const resp = await usuarioService.crear(formData.value);
            successMsg.value = resp.message || "Usuario creado correctamente.";
        }
        showModal.value = false;
        cargarUsuarios();
        cargarStats();
        setTimeout(() => successMsg.value = "", 3000);
    } catch (err) {
        formError.value = err.response?.data?.error || "Error al guardar.";
    } finally {
        formLoading.value = false;
    }
}

function confirmarEliminar(u) {
    deleteTarget.value = u;
    showDeleteModal.value = true;
}

async function eliminarUsuario() {
    try {
        await usuarioService.eliminar(deleteTarget.value.id_usuario);
        successMsg.value = "Usuario desactivado correctamente.";
        showDeleteModal.value = false;
        cargarUsuarios();
        cargarStats();
        setTimeout(() => successMsg.value = "", 3000);
    } catch (err) {
        error.value = err.response?.data?.error || "Error al eliminar.";
        showDeleteModal.value = false;
    }
}

function abrirCambiarRol(u) {
    rolTarget.value = u;
    nuevoRol.value = u.rol;
    showRolModal.value = true;
}

async function cambiarRol() {
    if (nuevoRol.value === rolTarget.value.rol) {
        showRolModal.value = false;
        return;
    }
    try {
        await usuarioService.asignarRol(rolTarget.value.id_usuario, nuevoRol.value);
        successMsg.value = `Rol de ${rolTarget.value.nombres} cambiado a ${nuevoRol.value}`;
        showRolModal.value = false;
        cargarUsuarios();
        cargarStats();
        setTimeout(() => successMsg.value = "", 3000);
    } catch (err) {
        error.value = err.response?.data?.error || "Error al cambiar rol.";
        showRolModal.value = false;
    }
}

function cambiarPagina(page) {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
    }
}

watch([filtroRol, filtroEstado], () => { currentPage.value = 1; cargarUsuarios(); });
watch(currentPage, () => { cargarUsuarios(); });

const rolBadgeClass = (rol) => {
    const map = { Administrador: "badge-admin", Docente: "bg-gradient-info", Estudiante: "bg-gradient-success" };
    return map[rol] || "bg-gradient-secondary";
};

const rolIcon = (rol) => {
    const map = { Administrador: "fas fa-user-shield", Docente: "fas fa-chalkboard-teacher", Estudiante: "fas fa-user-graduate" };
    return map[rol] || "fas fa-user";
};

const rolAvatarColor = (rol) => {
    const map = { Administrador: "avatar-admin", Docente: "bg-gradient-info", Estudiante: "bg-gradient-success" };
    return map[rol] || "bg-gradient-secondary";
};

const estadoBadgeClass = (estado) => {
    const map = { Activo: "badge-activo", Inactivo: "bg-gradient-secondary", Bloqueado: "badge-bloqueado" };
    return map[estado] || "bg-gradient-secondary";
};

const userInitial = (u) => {
    return (u.nombres?.charAt(0) || "").toUpperCase() + (u.apellido?.charAt(0) || "").toUpperCase();
};

async function cargarStats() {
    try {
        const data = await usuarioService.estadisticas();
        stats.value.total = data.total || 0;
        const activos = data.porEstado?.find(e => e.estado === 'Activo');
        const bloqueados = data.porEstado?.find(e => e.estado === 'Bloqueado');
        const inactivos = data.porEstado?.find(e => e.estado === 'Inactivo');
        stats.value.activos = parseInt(activos?.cantidad || 0);
        stats.value.bloqueados = parseInt(bloqueados?.cantidad || 0);
        stats.value.inactivos = parseInt(inactivos?.cantidad || 0);
    } catch (err) {
        console.error("Error al cargar stats:", err);
    }
}

onMounted(() => { cargarUsuarios(); cargarStats(); });
</script>

<template>
  <div class="container-fluid py-4">
    <!-- Mensajes -->
    <div v-if="successMsg" class="alert alert-success d-flex align-items-center" role="alert">
      <i class="fas fa-check-circle me-2"></i>
      <span class="text-sm">{{ successMsg }}</span>
    </div>
    <div v-if="error" class="alert alert-danger d-flex align-items-center" role="alert">
      <i class="fas fa-exclamation-circle me-2"></i>
      <span class="text-sm">{{ error }}</span>
    </div>

    <!-- Stats rápidas -->
    <div class="row mb-4">
      <div class="col-lg-4 col-md-6 mb-3">
        <div class="morph-card morph-1">
          <div class="morph-bg morph-bg-blue"></div>
          <div class="morph-content">
            <div class="morph-icon-box morph-icon-blue">
              <i class="fas fa-users"></i>
              <div class="morph-ripple"></div>
            </div>
            <div class="morph-info">
              <span class="morph-label">Total Usuarios</span>
              <div class="morph-num-row">
                <span class="morph-num">{{ stats.total }}</span>
                <span class="morph-chip morph-chip-blue"><i class="fas fa-chart-line"></i> Total</span>
              </div>
            </div>
          </div>
          <div class="morph-bottom">
            <div class="morph-bar-track">
              <div class="morph-bar-fill morph-fill-blue"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-4 col-md-6 mb-3">
        <div class="morph-card morph-2">
          <div class="morph-bg morph-bg-green"></div>
          <div class="morph-content">
            <div class="morph-icon-box morph-icon-green">
              <i class="fas fa-user-check"></i>
              <div class="morph-ripple"></div>
            </div>
            <div class="morph-info">
              <span class="morph-label">Activos</span>
              <div class="morph-num-row">
                <span class="morph-num">{{ stats.activos }}</span>
                <span class="morph-chip morph-chip-green"><i class="fas fa-circle" style="font-size:6px;"></i> Online</span>
              </div>
            </div>
          </div>
          <div class="morph-bottom">
            <div class="morph-bar-track">
              <div class="morph-bar-fill morph-fill-green"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-4 col-md-6 mb-3">
        <div class="morph-card morph-3">
          <div class="morph-bg morph-bg-red"></div>
          <div class="morph-content">
            <div class="morph-icon-box morph-icon-red">
              <i class="fas fa-user-lock"></i>
              <div class="morph-ripple"></div>
            </div>
            <div class="morph-info">
              <span class="morph-label">Bloqueados</span>
              <div class="morph-num-row">
                <span class="morph-num">{{ stats.bloqueados }}</span>
                <span class="morph-chip morph-chip-red"><i class="fas fa-ban"></i> Bloq.</span>
              </div>
            </div>
          </div>
          <div class="morph-bottom">
            <div class="morph-bar-track">
              <div class="morph-bar-fill morph-fill-red" style="width: 10%;"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card shadow-lg border-0">
      <!-- Header con gradiente -->
      <div class="card-header header-animated d-flex justify-content-between align-items-center" style="background: linear-gradient(135deg, #1e1b4b, #4338ca, #6366f1); border-radius: 12px 12px 0 0; position: relative; overflow: hidden;">
        <div class="header-particles"></div>
        <div class="d-flex align-items-center" style="position: relative; z-index: 2;">
          <div class="header-icon-box me-3">
            <i class="fas fa-users-cog"></i>
          </div>
          <div>
            <h5 class="text-white mb-0 font-weight-bold">Gestión de Usuarios</h5>
            <p class="text-white text-sm mb-0" style="opacity: 0.7;">Administra usuarios, roles y permisos</p>
          </div>
        </div>
        <button class="btn-nuevo-usuario" @click="abrirCrear">
          <i class="fas fa-user-plus me-2"></i> Nuevo Usuario
        </button>
      </div>

      <!-- Filtros -->
      <div class="card-body pb-0 pt-3">
        <div class="d-flex align-items-end justify-content-center gap-3 flex-wrap">
          <div>
            <label class="form-label text-xs text-uppercase font-weight-bolder opacity-7 mb-1">Buscar</label>
            <div class="input-group input-group-sm" style="border: 1px solid #d2d6da; border-radius: 0.5rem; overflow: hidden; width: 250px;">
              <span class="input-group-text" style="border: none; background: #fff; padding: 0.25rem 0.5rem;"><i class="fas fa-search text-xs"></i></span>
              <input type="text" class="form-control" placeholder="Nombre, código, correo..." v-model="filtroBusqueda" @input="cargarUsuarios" style="border: none; padding: 0.25rem 0.5rem; font-size: 0.8rem;" />
            </div>
          </div>
          <div>
            <label class="form-label text-xs text-uppercase font-weight-bolder opacity-7 mb-1">Rol</label>
            <select class="form-select" v-model="filtroRol" style="padding: 0.25rem 0.5rem; font-size: 0.8rem; width: 160px;">
              <option value="">Todos los roles</option>
              <option value="Estudiante">Estudiante</option>
              <option value="Docente">Docente</option>
              <option value="Administrador">Administrador</option>
            </select>
          </div>
          <div>
            <label class="form-label text-xs text-uppercase font-weight-bolder opacity-7 mb-1">Estado</label>
            <select class="form-select" v-model="filtroEstado" style="padding: 0.25rem 0.5rem; font-size: 0.8rem; width: 160px;">
              <option value="">Todos los estados</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
              <option value="Bloqueado">Bloqueado</option>
            </select>
          </div>
          <div>
            <label class="form-label text-xxs text-uppercase font-weight-bolder opacity-0 mb-1">.</label>
            <button class="btn mb-0 d-block" style="padding: 0.4rem 1rem; font-size: 0.85rem; background: #f8f9fa; border: 1px solid #d2d6da; border-radius: 0.375rem; color: #344767;" @click="filtroRol = ''; filtroEstado = ''; filtroBusqueda = ''; cargarUsuarios()">
              <i class="fas fa-eraser me-1" style="color: #e74c3c;"></i>Limpiar
            </button>
          </div>
        </div>
      </div>

      <!-- Tabla -->
      <div class="card-body px-0 pt-3 pb-2">
        <div v-if="isLoading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="mt-2 text-muted text-sm">Cargando usuarios...</p>
        </div>
        <div v-else-if="usuarios.length === 0" class="text-center py-5">
          <i class="fas fa-users fa-3x text-muted opacity-5 mb-3"></i>
          <p class="text-muted">No se encontraron usuarios</p>
        </div>
        <div v-else class="table-responsive p-0">
          <table class="table align-items-center mb-0">

            <thead>
              <tr>
                <th class="text-uppercase text-secondary text-xs font-weight-bolder opacity-7" style="padding-left: 7.5rem;">Usuario</th>
                <th class="text-uppercase text-secondary text-xs font-weight-bolder opacity-7 px-3 text-center">Correo</th>
                <th class="text-uppercase text-secondary text-xs font-weight-bolder opacity-7 px-3 text-center">Código</th>
                <th class="text-uppercase text-secondary text-xs font-weight-bolder opacity-7 px-3 text-center">DNI</th>
                <th class="text-uppercase text-secondary text-xs font-weight-bolder opacity-7 px-3 text-center">Rol</th>
                <th class="text-uppercase text-secondary text-xs font-weight-bolder opacity-7 px-3 text-center">Estado</th>
                <th class="text-uppercase text-secondary text-xs font-weight-bolder opacity-7 px-3 text-center">Último Acceso</th>
                <th class="text-uppercase text-secondary text-xs font-weight-bolder opacity-7 px-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in usuarios" :key="u.id_usuario">
                <td style="padding-left: 3rem !important;">
                  <div class="d-flex py-2 align-items-center">
                    <div class="d-flex align-items-center justify-content-center rounded-circle me-2" :class="rolAvatarColor(u.rol)" style="width: 40px; height: 40px; min-width: 40px; font-size: 13px; color: white; font-weight: bold;">
                      {{ userInitial(u) }}
                    </div>
                    <h6 class="mb-0 text-sm" style="white-space: nowrap;">{{ u.nombres }} {{ u.apellido }}</h6>
                  </div>
                </td>
                <td class="px-3 text-center">
                  <span class="text-sm text-secondary" style="white-space: nowrap;">{{ u.correo || 'Sin correo' }}</span>
                </td>
                <td class="px-3 text-center">
                  <span class="text-sm font-weight-bold">{{ u.codigo }}</span>
                </td>
                <td class="px-3 text-center">
                  <span class="text-sm text-secondary">{{ u.dni }}</span>
                </td>
                <td class="px-3 text-center">
                  <span class="badge" :class="rolBadgeClass(u.rol)">
                    <i :class="rolIcon(u.rol)" class="me-1"></i>{{ u.rol }}
                  </span>
                </td>
                <td class="px-3 text-center">
                  <span class="badge" :class="estadoBadgeClass(u.estado)">{{ u.estado }}</span>
                </td>
                <td class="px-3 text-center">
                  <span class="text-sm text-secondary" style="white-space: nowrap;">{{ u.ultimo_acceso ? new Date(u.ultimo_acceso).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Nunca' }}</span>
                </td>
                <td class="px-3 text-center" style="vertical-align: middle;">
                  <div class="d-flex justify-content-center align-items-center gap-2" style="min-height: 34px;">
                    <button class="action-btn action-edit" @click="abrirEditar(u)" title="Editar">
                      <i class="fas fa-pencil-alt"></i>
                    </button>
                    <button class="action-btn action-role" @click="abrirCambiarRol(u)" title="Cambiar Rol">
                      <i class="fas fa-user-tag"></i>
                    </button>
                    <button class="action-btn action-delete" @click="confirmarEliminar(u)" title="Desactivar" v-if="u.estado === 'Activo'">
                      <i class="fas fa-user-times"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Paginación -->
        <div class="d-flex justify-content-between align-items-center px-4 py-3" v-if="totalPages > 1">
          <span class="text-sm text-muted">Página {{ currentPage }} de {{ totalPages }}</span>
          <div class="d-flex gap-2">
            <button class="pag-btn" :class="{ 'pag-disabled': currentPage === 1 }" :disabled="currentPage === 1" @click="cambiarPagina(currentPage - 1)">
              <i class="fas fa-chevron-left"></i>
            </button>
            <button v-for="p in totalPages" :key="p" class="pag-btn" :class="{ 'pag-active': p === currentPage }" @click="cambiarPagina(p)">
              {{ p }}
            </button>
            <button class="pag-btn" :class="{ 'pag-disabled': currentPage === totalPages }" :disabled="currentPage === totalPages" @click="cambiarPagina(currentPage + 1)">
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Crear/Editar -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-box">
        <div class="modal-header-custom mb-4">
          <div class="d-flex align-items-center justify-content-center">
            <div class="shadow rounded-circle d-flex align-items-center justify-content-center me-3" :class="editMode ? 'bg-gradient-info' : 'bg-gradient-success'" style="width: 48px; height: 48px; min-width: 48px;">
              <i :class="editMode ? 'fas fa-user-edit' : 'fas fa-user-plus'" class="text-white" style="font-size: 20px;"></i>
            </div>
            <h5 class="mb-0 font-weight-bold">{{ editMode ? 'Editar Usuario' : 'Nuevo Usuario' }}</h5>
          </div>
        </div>
        <div v-if="formError" class="alert alert-danger d-flex align-items-center py-2 px-3" role="alert">
          <i class="fas fa-exclamation-triangle me-2 text-sm"></i>
          <span class="text-sm">{{ formError }}</span>
        </div>
        <form @submit.prevent="guardarUsuario" autocomplete="off">
          <div class="row g-3 mb-3">
            <div class="col-6">
              <label class="form-label text-xs font-weight-bold text-uppercase opacity-7">Nombres *</label>
              <input type="text" class="form-control" v-model="formData.nombres" placeholder="Nombres completos" required />
            </div>
            <div class="col-6">
              <label class="form-label text-xs font-weight-bold text-uppercase opacity-7">Apellido *</label>
              <input type="text" class="form-control" v-model="formData.apellido" placeholder="Apellido" required />
            </div>
          </div>
          <div class="row g-3 mb-3">
            <div :class="editMode ? 'col-6' : 'col-6'">
              <label class="form-label text-xs font-weight-bold text-uppercase opacity-7">Rol *</label>
              <select class="form-select" v-model="formData.rol" required>
                <option value="Estudiante">Estudiante</option>
                <option value="Docente">Docente</option>
                <option value="Administrador">Administrador</option>
              </select>
            </div>
            <div class="col-6">
              <label class="form-label text-xs font-weight-bold text-uppercase opacity-7">DNI *</label>
              <input type="text" class="form-control" v-model="formData.dni" placeholder="Documento de identidad" required maxlength="8" />
            </div>
          </div>
          <div v-if="editMode" class="row g-3 mb-3">
            <div class="col-6">
              <label class="form-label text-xs font-weight-bold text-uppercase opacity-7">Código</label>
              <input type="text" class="form-control" v-model="formData.codigo" disabled style="background: #f1f5f9; cursor: not-allowed;" />
            </div>
            <div class="col-6">
              <label class="form-label text-xs font-weight-bold text-uppercase opacity-7">Estado</label>
              <select class="form-select" v-model="formData.estado">
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
                <option value="Bloqueado">Bloqueado</option>
              </select>
            </div>
          </div>
          <div v-if="!editMode" class="mb-3">
            <label class="form-label text-xs font-weight-bold text-uppercase opacity-7">Código (generado automáticamente)</label>
            <div class="input-group">
              <span class="input-group-text" style="background: #eff6ff; border-color: #bfdbfe;"><i class="fas fa-id-badge text-xs" style="color: #3b82f6;"></i></span>
              <input type="text" class="form-control" disabled :value="codigoPreview" style="background: #eff6ff; border-color: #bfdbfe; color: #1e40af; font-weight: 700; letter-spacing: 1px;" />
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label text-xs font-weight-bold text-uppercase opacity-7">Correo electrónico</label>
            <div class="input-group">
              <span class="input-group-text"><i class="fas fa-envelope text-xs opacity-6"></i></span>
              <input type="email" class="form-control" v-model="formData.correo" autocomplete="new-email" placeholder="correo@ejemplo.com" />
            </div>
          </div>
          <div v-if="!editMode" class="mb-3">
            <label class="form-label text-xs font-weight-bold text-uppercase opacity-7">Contraseña *</label>
            <div class="input-group">
              <span class="input-group-text"><i class="fas fa-lock text-xs opacity-6"></i></span>
              <input type="password" class="form-control" v-model="formData.password" autocomplete="new-password" placeholder="Contraseña segura" required />
            </div>
          </div>
          <hr class="horizontal dark mt-0 mb-3">
          <div class="d-flex justify-content-end gap-2">
            <button type="button" class="btn btn-outline-secondary" @click="showModal = false">Cancelar</button>
            <button type="submit" class="btn text-white" style="background: linear-gradient(135deg, #0A4174, #4E8EA2);" :disabled="formLoading">
              <i :class="formLoading ? 'fas fa-spinner fa-spin' : (editMode ? 'fas fa-save' : 'fas fa-user-plus')" class="me-1"></i>
              {{ formLoading ? 'Guardando...' : (editMode ? 'Actualizar' : 'Crear Usuario') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Confirmar Eliminación -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
      <div class="modal-box text-center" style="max-width: 420px;">
        <div class="d-flex align-items-center justify-content-center mb-3">
          <div class="bg-gradient-danger shadow rounded-circle d-flex align-items-center justify-content-center me-3" style="width: 48px; height: 48px; min-width: 48px;">
            <i class="fas fa-user-times text-white" style="font-size: 20px;"></i>
          </div>
          <h5 class="font-weight-bold mb-0">Confirmar Desactivación</h5>
        </div>
        <p class="text-sm text-muted">
          ¿Estás seguro de desactivar a <strong>{{ deleteTarget?.nombres }} {{ deleteTarget?.apellido }}</strong>?
          El usuario no podrá iniciar sesión.
        </p>
        <hr class="horizontal dark">
        <div class="d-flex justify-content-center gap-2">
          <button class="btn btn-outline-secondary" @click="showDeleteModal = false">Cancelar</button>
          <button class="btn btn-danger" @click="eliminarUsuario">
            <i class="fas fa-user-times me-1"></i> Desactivar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Cambiar Rol -->
    <div v-if="showRolModal" class="modal-overlay" @click.self="showRolModal = false">
      <div class="modal-box text-center" style="max-width: 420px;">
        <div class="d-flex align-items-center justify-content-center mb-3">
          <div class="bg-gradient-warning shadow rounded-circle d-flex align-items-center justify-content-center me-3" style="width: 48px; height: 48px; min-width: 48px;">
            <i class="fas fa-user-tag text-white" style="font-size: 20px;"></i>
          </div>
          <h5 class="font-weight-bold mb-0">Cambiar Rol</h5>
        </div>
        <p class="text-sm text-muted mb-3">
          Usuario: <strong>{{ rolTarget?.nombres }} {{ rolTarget?.apellido }}</strong>
        </p>
        <div class="d-flex justify-content-center align-items-center gap-3 mb-3">
          <span class="badge" :class="rolBadgeClass(rolTarget?.rol)">
            <i :class="rolIcon(rolTarget?.rol)" class="me-1"></i>{{ rolTarget?.rol }}
          </span>
          <i class="fas fa-arrow-right text-muted"></i>
          <span class="badge" :class="rolBadgeClass(nuevoRol)">
            <i :class="rolIcon(nuevoRol)" class="me-1"></i>{{ nuevoRol }}
          </span>
        </div>
        <div class="mb-4 text-start" style="max-width: 280px; margin: 0 auto;">
          <label class="form-label text-xs font-weight-bold text-uppercase opacity-7">Nuevo Rol</label>
          <select class="form-select" v-model="nuevoRol">
            <option value="Estudiante">Estudiante</option>
            <option value="Docente">Docente</option>
            <option value="Administrador">Administrador</option>
          </select>
        </div>
        <hr class="horizontal dark">
        <div class="d-flex justify-content-center gap-2">
          <button class="btn btn-outline-secondary" @click="showRolModal = false">Cancelar</button>
          <button class="btn btn-warning text-white" @click="cambiarRol">
            <i class="fas fa-exchange-alt me-1"></i> Cambiar Rol
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}
.modal-box {
  background: #fff;
  border-radius: 16px;
  padding: 32px;
  max-width: 580px;
  width: 92%;
  box-shadow: 0 25px 65px rgba(0, 0, 0, 0.3);
  animation: modalIn 0.25s ease-out;
}
@keyframes modalIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
.stat-icon {
  width: 48px;
  height: 48px;
  min-width: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  line-height: 1;
}

/* ── Morph Stat Cards ── */
.morph-card {
  position: relative;
  border-radius: 1rem;
  padding: 1rem 1.25rem;
  overflow: hidden;
  border: 1px solid rgba(0,0,0,0.04);
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
}
.morph-1 { animation: morphDrop 0.5s ease both; }
.morph-2 { animation: morphDrop 0.5s ease 0.15s both; }
.morph-3 { animation: morphDrop 0.5s ease 0.3s both; }
@keyframes morphDrop {
  0% { opacity: 0; transform: translateY(-30px) rotateX(10deg); }
  100% { opacity: 1; transform: translateY(0) rotateX(0); }
}
.morph-card:hover {
  transform: translateY(-10px) scale(1.03);
  box-shadow: 0 25px 50px rgba(0,0,0,0.15);
  border-color: transparent;
}

/* Fondo animado */
.morph-bg {
  position: absolute;
  top: -50%;
  right: -30%;
  width: 250px;
  height: 250px;
  border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
  opacity: 0.06;
  animation: morphBlob 8s ease-in-out infinite;
  pointer-events: none;
}
.morph-card:hover .morph-bg { opacity: 0.12; }
@keyframes morphBlob {
  0%, 100% { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; transform: rotate(0deg); }
  25% { border-radius: 58% 42% 75% 25% / 76% 46% 54% 24%; }
  50% { border-radius: 50% 50% 33% 67% / 55% 27% 73% 45%; transform: rotate(90deg); }
  75% { border-radius: 33% 67% 58% 42% / 63% 68% 32% 37%; }
}
.morph-bg-blue { background: #fff; }
.morph-bg-green { background: #fff; }
.morph-bg-red { background: #fff; }

.morph-1 .morph-content, .morph-1 .morph-bottom { position: relative; z-index: 2; }
.morph-2 .morph-content, .morph-2 .morph-bottom { position: relative; z-index: 2; }
.morph-3 .morph-content, .morph-3 .morph-bottom { position: relative; z-index: 2; }

.morph-1 { background: linear-gradient(135deg, #f3e8ff, #e0d0f5); }
.morph-2 { background: linear-gradient(135deg, #e6fbf0, #c8f5de); }
.morph-3 { background: linear-gradient(135deg, #fde8ec, #fcd0d8); }

/* Contenido */
.morph-content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 1.25rem;
}
.morph-info { flex: 1; }
.morph-label {
  display: block;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  color: #94a3b8;
  margin-bottom: 0.35rem;
}
.morph-num-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.morph-num {
  font-size: 1.85rem;
  font-weight: 800;
  color: #1e293b;
  line-height: 1;
  animation: numCount 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both 0.3s;
}
@keyframes numCount {
  from { opacity: 0; transform: scale(0.6) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
.morph-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.2rem 0.6rem;
  border-radius: 2rem;
  white-space: nowrap;
}
.morph-chip-blue { background: #f3e8ff; color: #7c3aed; }
.morph-chip-green { background: #ecfdf5; color: #059669; }
.morph-chip-red { background: #fef2f2; color: #dc2626; }

/* Icono con ripple */
.morph-icon-box {
  position: relative;
  width: 48px;
  height: 48px;
  min-width: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: #fff;
  transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.morph-card:hover .morph-icon-box {
  transform: scale(1.15) rotate(-10deg);
}
.morph-icon-blue { background: linear-gradient(135deg, #7c3aed, #a855f7); box-shadow: 0 6px 20px rgba(124,58,237,0.35); }
.morph-icon-green { background: linear-gradient(135deg, #059669, #2dce89); box-shadow: 0 6px 20px rgba(5,150,105,0.35); }
.morph-icon-red { background: linear-gradient(135deg, #dc2626, #f5365c); box-shadow: 0 6px 20px rgba(220,38,38,0.35); }

.morph-ripple {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 2px solid currentColor;
  opacity: 0;
  animation: rippleOut 2.5s ease-out infinite;
}
.morph-icon-blue .morph-ripple { border-color: #a855f7; }
.morph-icon-green .morph-ripple { border-color: #2dce89; }
.morph-icon-red .morph-ripple { border-color: #f5365c; }
@keyframes rippleOut {
  0% { transform: scale(1); opacity: 0.5; }
  100% { transform: scale(1.8); opacity: 0; }
}

/* Barra inferior */
.morph-bottom {
  position: relative;
  z-index: 2;
  margin-top: 0.75rem;
}
.morph-bar-track {
  height: 4px;
  background: #f1f5f9;
  border-radius: 4px;
  overflow: hidden;
}
.morph-bar-fill {
  height: 100%;
  border-radius: 4px;
  width: 100%;
  animation: barSlide 1.2s ease both 0.5s;
  position: relative;
}
.morph-bar-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  animation: barShine 2s ease-in-out infinite;
}
@keyframes barSlide {
  from { width: 0; }
}
@keyframes barShine {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
.morph-fill-blue { background: linear-gradient(90deg, #7c3aed, #a855f7); }
.morph-fill-green { background: linear-gradient(90deg, #059669, #2dce89); }
.morph-fill-red { background: linear-gradient(90deg, #dc2626, #f5365c); }

/* ── Header animado ── */
.header-animated {
  animation: headerFade 0.6s ease both;
}
@keyframes headerFade {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
.header-particles {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 20% 50%, rgba(255,255,255,0.08) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255,255,255,0.06) 0%, transparent 40%),
    radial-gradient(circle at 60% 80%, rgba(255,255,255,0.04) 0%, transparent 50%);
  animation: particleFloat 6s ease-in-out infinite;
}
@keyframes particleFloat {
  0%, 100% { transform: translateX(0) translateY(0); }
  50% { transform: translateX(10px) translateY(-5px); }
}
.header-icon-box {
  width: 48px;
  height: 48px;
  min-width: 48px;
  border-radius: 0.875rem;
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #fff;
  transition: transform 0.3s ease, background 0.3s ease;
}
.header-animated:hover .header-icon-box {
  transform: rotate(8deg) scale(1.05);
  background: rgba(255,255,255,0.25);
}

/* Botón Nuevo Usuario */
.btn-nuevo-usuario {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  padding: 0.6rem 1.5rem;
  font-size: 0.85rem;
  font-weight: 700;
  color: #4338ca;
  background: #fff;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow: hidden;
}
.btn-nuevo-usuario:hover {
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 8px 25px rgba(67,56,202,0.25);
  background: #f5f3ff;
  color: #4338ca;
}
.btn-nuevo-usuario i,
.btn-nuevo-usuario span {
  position: relative;
  z-index: 1;
}
.btn-nuevo-usuario:active {
  transform: translateY(0) scale(0.98);
}

/* ── Action Buttons ── */
.action-btn {
  width: 34px;
  height: 34px;
  border-radius: 0.6rem;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Editar - azul */
.action-edit {
  background: #eff6ff;
  color: #3b82f6;
}
.action-edit:hover {
  background: #dbeafe;
  color: #2563eb;
  transform: translateY(-3px) scale(1.15);
  box-shadow: 0 6px 15px rgba(59, 130, 246, 0.25);
}
.action-edit:hover i {
  animation: editWiggle 0.5s ease;
}
@keyframes editWiggle {
  0%, 100% { transform: rotate(0); }
  25% { transform: rotate(-15deg); }
  75% { transform: rotate(15deg); }
}

/* Cambiar Rol - ámbar */
.action-role {
  background: #fef3c7;
  color: #d97706;
}
.action-role:hover {
  background: #fde68a;
  color: #b45309;
  transform: translateY(-3px) scale(1.15);
  box-shadow: 0 6px 15px rgba(217, 119, 6, 0.25);
}
.action-role:hover i {
  animation: roleFlip 0.5s ease;
}
@keyframes roleFlip {
  0% { transform: rotateY(0); }
  100% { transform: rotateY(360deg); }
}

/* Desactivar - rojo */
.action-delete {
  background: #fef2f2;
  color: #ef4444;
}
.action-delete:hover {
  background: #fecaca;
  color: #dc2626;
  transform: translateY(-3px) scale(1.15);
  box-shadow: 0 6px 15px rgba(239, 68, 68, 0.25);
}
.action-delete:hover i {
  animation: deleteShake 0.4s ease;
}
@keyframes deleteShake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-3px); }
  40% { transform: translateX(3px); }
  60% { transform: translateX(-2px); }
  80% { transform: translateX(2px); }
}

.action-btn:active {
  transform: scale(0.9) !important;
}

/* ── Badges Estado ── */
.badge-activo {
  background: linear-gradient(135deg, #06b6d4, #22d3ee) !important;
  color: #fff !important;
}
.badge-bloqueado {
  background: linear-gradient(135deg, #e11d48, #f43f5e) !important;
  color: #fff !important;
}
.badge-admin {
  background: linear-gradient(135deg, #ea580c, #f97316) !important;
  color: #fff !important;
}
.avatar-admin {
  background: linear-gradient(135deg, #ea580c, #f97316) !important;
}

/* ── Paginación ── */
.pag-btn {
  width: 36px;
  height: 36px;
  border-radius: 0.6rem;
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #4338ca;
  font-size: 0.8rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.pag-btn:hover:not(.pag-disabled):not(.pag-active) {
  background: #f5f3ff;
  border-color: #6366f1;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
}
.pag-active {
  background: linear-gradient(135deg, #1e1b4b, #4338ca) !important;
  color: #fff !important;
  border-color: transparent !important;
  box-shadow: 0 4px 15px rgba(67, 56, 202, 0.35);
  transform: scale(1.08);
}
.pag-disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>

<script setup>
import { ref, onMounted } from "vue";
import contenidoService from "@/services/contenido.service";

const cursos = ref([]);
const loading = ref(true);
const mensaje = ref("");
const error = ref("");

const showModal = ref(false);
const editando = ref(false);
const showDeleteModal = ref(false);
const cursoAEliminar = ref(null);

const form = ref({ nombre: "", descripcion: "", orden: 0 });
const cursoId = ref(null);

const cargar = async () => {
  loading.value = true;
  try {
    const { data } = await contenidoService.listarCursos();
    cursos.value = data;
  } catch (err) {
    error.value = "Error al cargar cursos";
  } finally {
    loading.value = false;
  }
};

onMounted(cargar);

const abrirCrear = () => {
  form.value = { nombre: "", descripcion: "", orden: 0 };
  cursoId.value = null;
  editando.value = false;
  showModal.value = true;
};

const abrirEditar = (curso) => {
  form.value = { nombre: curso.nombre, descripcion: curso.descripcion || "", orden: curso.orden || 0 };
  cursoId.value = curso.id_curso;
  editando.value = true;
  showModal.value = true;
};

const guardar = async () => {
  mensaje.value = "";
  error.value = "";
  try {
    if (editando.value) {
      await contenidoService.actualizarCurso(cursoId.value, form.value);
      mensaje.value = "Curso actualizado";
    } else {
      await contenidoService.crearCurso(form.value);
      mensaje.value = "Curso creado";
    }
    showModal.value = false;
    await cargar();
    setTimeout(() => (mensaje.value = ""), 3000);
  } catch (err) {
    error.value = err.response?.data?.error || "Error al guardar";
  }
};

const confirmarEliminar = (curso) => {
  cursoAEliminar.value = curso;
  showDeleteModal.value = true;
};

const eliminar = async () => {
  error.value = "";
  try {
    await contenidoService.eliminarCurso(cursoAEliminar.value.id_curso);
    mensaje.value = "Curso eliminado";
    showDeleteModal.value = false;
    await cargar();
    setTimeout(() => (mensaje.value = ""), 3000);
  } catch (err) {
    error.value = err.response?.data?.error || "Error al eliminar";
    showDeleteModal.value = false;
  }
};
</script>

<template>
  <div class="container-fluid py-4">
    <div class="row">
      <div class="col-12">
        <div v-if="mensaje" class="alert alert-success"><i class="fas fa-check-circle me-2"></i>{{ mensaje }}</div>
        <div v-if="error" class="alert alert-danger"><i class="fas fa-exclamation-circle me-2"></i>{{ error }}</div>

        <div class="card shadow-lg border-0">
          <div class="card-header d-flex justify-content-between align-items-center" style="background: linear-gradient(135deg, #0A4174, #4E8EA2); border-radius: 12px 12px 0 0;">
            <div class="d-flex align-items-center">
              <div class="icon-shape bg-white shadow rounded-circle d-flex align-items-center justify-content-center me-3" style="width: 48px; height: 48px;">
                <i class="fas fa-book" style="color: #0A4174; font-size: 20px;"></i>
              </div>
              <h5 class="text-white mb-0 font-weight-bold">Gestión de Cursos</h5>
            </div>
            <button class="btn btn-sm bg-white text-dark font-weight-bold" @click="abrirCrear">
              <i class="fas fa-plus me-1"></i> Nuevo Curso
            </button>
          </div>
          <div class="card-body px-0 pt-0 pb-2">
            <div v-if="loading" class="text-center py-5">
              <div class="spinner-border text-primary"></div>
            </div>
            <div v-else-if="cursos.length === 0" class="text-center py-5 text-muted">
              <i class="fas fa-book-open fa-3x mb-3 opacity-5"></i>
              <p>No hay cursos registrados</p>
            </div>
            <div v-else class="table-responsive p-0">
              <table class="table align-items-center mb-0">
                <thead>
                  <tr>
                    <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Curso</th>
                    <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Descripción</th>
                    <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 text-center">Orden</th>
                    <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="curso in cursos" :key="curso.id_curso">
                    <td>
                      <div class="d-flex px-3 py-2">
                        <div class="icon-shape bg-gradient-primary shadow rounded-circle d-flex align-items-center justify-content-center me-3" style="width: 36px; height: 36px; min-width: 36px;">
                          <i class="fas fa-book text-white text-sm"></i>
                        </div>
                        <div class="d-flex flex-column justify-content-center">
                          <h6 class="mb-0 text-sm">{{ curso.nombre }}</h6>
                        </div>
                      </div>
                    </td>
                    <td><p class="text-xs text-secondary mb-0">{{ curso.descripcion || '-' }}</p></td>
                    <td class="text-center"><span class="badge bg-gradient-info">{{ curso.orden }}</span></td>
                    <td class="text-center">
                      <a href="javascript:;" class="text-info me-3" @click="abrirEditar(curso)" title="Editar">
                        <i class="fas fa-edit text-sm"></i>
                      </a>
                      <a href="javascript:;" class="text-danger" @click="confirmarEliminar(curso)" title="Eliminar">
                        <i class="fas fa-trash text-sm"></i>
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Crear/Editar -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-box">
        <h5 class="font-weight-bold mb-3">{{ editando ? 'Editar Curso' : 'Nuevo Curso' }}</h5>
        <form @submit.prevent="guardar">
          <div class="mb-3">
            <label class="form-label text-sm font-weight-bold">Nombre *</label>
            <input v-model="form.nombre" type="text" class="form-control" required />
          </div>
          <div class="mb-3">
            <label class="form-label text-sm font-weight-bold">Descripción</label>
            <textarea v-model="form.descripcion" class="form-control" rows="3"></textarea>
          </div>
          <div class="mb-3">
            <label class="form-label text-sm font-weight-bold">Orden</label>
            <input v-model.number="form.orden" type="number" class="form-control" />
          </div>
          <div class="d-flex justify-content-end gap-2">
            <button type="button" class="btn btn-outline-secondary btn-sm" @click="showModal = false">Cancelar</button>
            <button type="submit" class="btn btn-sm text-white" style="background: linear-gradient(135deg, #0A4174, #4E8EA2);">
              {{ editando ? 'Actualizar' : 'Crear' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Eliminar -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
      <div class="modal-box">
        <h5 class="font-weight-bold mb-3 text-danger"><i class="fas fa-exclamation-triangle me-2"></i>Confirmar Eliminación</h5>
        <p>¿Estás seguro de eliminar el curso <strong>{{ cursoAEliminar?.nombre }}</strong>?</p>
        <div class="d-flex justify-content-end gap-2">
          <button class="btn btn-outline-secondary btn-sm" @click="showDeleteModal = false">Cancelar</button>
          <button class="btn btn-danger btn-sm" @click="eliminar">Eliminar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.5); z-index: 9999;
  display: flex; align-items: center; justify-content: center;
}
.modal-box {
  background: #fff; border-radius: 16px; padding: 30px;
  max-width: 500px; width: 90%; box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}
</style>

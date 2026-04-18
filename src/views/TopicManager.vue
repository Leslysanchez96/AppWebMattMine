<script setup>
import { ref, onMounted } from "vue";
import contenidoService from "@/services/contenido.service";

const temas = ref([]);
const cursos = ref([]);
const loading = ref(true);
const mensaje = ref("");
const error = ref("");
const filtroIdCurso = ref("");

const showModal = ref(false);
const editando = ref(false);
const showDeleteModal = ref(false);
const temaAEliminar = ref(null);

const form = ref({ id_curso: "", nombre_tema: "", descripcion: "", orden: 0 });
const temaId = ref(null);

const cargar = async () => {
  loading.value = true;
  try {
    const [temasRes, cursosRes] = await Promise.all([
      contenidoService.listarTemas(filtroIdCurso.value || undefined),
      contenidoService.listarCursos(),
    ]);
    temas.value = temasRes.data;
    cursos.value = cursosRes.data;
  } catch (err) {
    error.value = "Error al cargar datos";
  } finally {
    loading.value = false;
  }
};

onMounted(cargar);

const filtrar = () => cargar();

const abrirCrear = () => {
  form.value = { id_curso: cursos.value[0]?.id_curso || "", nombre_tema: "", descripcion: "", orden: 0 };
  temaId.value = null;
  editando.value = false;
  showModal.value = true;
};

const abrirEditar = (tema) => {
  form.value = {
    id_curso: tema.id_curso,
    nombre_tema: tema.nombre_tema,
    descripcion: tema.descripcion || "",
    orden: tema.orden || 0,
  };
  temaId.value = tema.id_tema;
  editando.value = true;
  showModal.value = true;
};

const guardar = async () => {
  mensaje.value = "";
  error.value = "";
  try {
    if (editando.value) {
      await contenidoService.actualizarTema(temaId.value, form.value);
      mensaje.value = "Tema actualizado";
    } else {
      await contenidoService.crearTema(form.value);
      mensaje.value = "Tema creado";
    }
    showModal.value = false;
    await cargar();
    setTimeout(() => (mensaje.value = ""), 3000);
  } catch (err) {
    error.value = err.response?.data?.error || "Error al guardar";
  }
};

const confirmarEliminar = (tema) => {
  temaAEliminar.value = tema;
  showDeleteModal.value = true;
};

const eliminar = async () => {
  error.value = "";
  try {
    await contenidoService.eliminarTema(temaAEliminar.value.id_tema);
    mensaje.value = "Tema eliminado";
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
          <div class="card-header" style="background: linear-gradient(135deg, #0A4174, #4E8EA2); border-radius: 12px 12px 0 0;">
            <div class="d-flex justify-content-between align-items-center">
              <div class="d-flex align-items-center">
                <div class="icon-shape bg-white shadow rounded-circle d-flex align-items-center justify-content-center me-3" style="width: 48px; height: 48px;">
                  <i class="fas fa-list-ol" style="color: #0A4174; font-size: 20px;"></i>
                </div>
                <h5 class="text-white mb-0 font-weight-bold">Gestión de Temas</h5>
              </div>
              <button class="btn btn-sm bg-white text-dark font-weight-bold" @click="abrirCrear">
                <i class="fas fa-plus me-1"></i> Nuevo Tema
              </button>
            </div>
            <!-- Filtro por curso -->
            <div class="mt-3">
              <select v-model="filtroIdCurso" class="form-select form-select-sm" style="max-width: 300px;" @change="filtrar">
                <option value="">Todos los cursos</option>
                <option v-for="c in cursos" :key="c.id_curso" :value="c.id_curso">{{ c.nombre }}</option>
              </select>
            </div>
          </div>
          <div class="card-body px-0 pt-0 pb-2">
            <div v-if="loading" class="text-center py-5">
              <div class="spinner-border text-primary"></div>
            </div>
            <div v-else-if="temas.length === 0" class="text-center py-5 text-muted">
              <i class="fas fa-clipboard-list fa-3x mb-3 opacity-5"></i>
              <p>No hay temas registrados</p>
            </div>
            <div v-else class="table-responsive p-0">
              <table class="table align-items-center mb-0">
                <thead>
                  <tr>
                    <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Tema</th>
                    <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Curso</th>
                    <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Descripción</th>
                    <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 text-center">Orden</th>
                    <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="tema in temas" :key="tema.id_tema">
                    <td>
                      <div class="d-flex px-3 py-2">
                        <div class="icon-shape bg-gradient-success shadow rounded-circle d-flex align-items-center justify-content-center me-3" style="width: 36px; height: 36px; min-width: 36px;">
                          <i class="fas fa-bookmark text-white text-sm"></i>
                        </div>
                        <div class="d-flex flex-column justify-content-center">
                          <h6 class="mb-0 text-sm">{{ tema.nombre_tema }}</h6>
                        </div>
                      </div>
                    </td>
                    <td><span class="badge bg-gradient-primary">{{ tema.curso_nombre }}</span></td>
                    <td><p class="text-xs text-secondary mb-0">{{ tema.descripcion || '-' }}</p></td>
                    <td class="text-center"><span class="badge bg-gradient-info">{{ tema.orden }}</span></td>
                    <td class="text-center">
                      <a href="javascript:;" class="text-info me-3" @click="abrirEditar(tema)" title="Editar">
                        <i class="fas fa-edit text-sm"></i>
                      </a>
                      <a href="javascript:;" class="text-danger" @click="confirmarEliminar(tema)" title="Eliminar">
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
        <h5 class="font-weight-bold mb-3">{{ editando ? 'Editar Tema' : 'Nuevo Tema' }}</h5>
        <form @submit.prevent="guardar">
          <div class="mb-3">
            <label class="form-label text-sm font-weight-bold">Curso *</label>
            <select v-model="form.id_curso" class="form-select" required>
              <option v-for="c in cursos" :key="c.id_curso" :value="c.id_curso">{{ c.nombre }}</option>
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label text-sm font-weight-bold">Nombre del Tema *</label>
            <input v-model="form.nombre_tema" type="text" class="form-control" required />
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
        <p>¿Estás seguro de eliminar el tema <strong>{{ temaAEliminar?.nombre_tema }}</strong>?</p>
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

<script setup>
import { ref, onMounted } from "vue";
import contenidoService from "@/services/contenido.service";

const materiales = ref([]);
const temas = ref([]);
const cursos = ref([]);
const loading = ref(true);
const mensaje = ref("");
const error = ref("");
const filtroIdTema = ref("");

const showModal = ref(false);
const editando = ref(false);
const showDeleteModal = ref(false);
const materialAEliminar = ref(null);

const form = ref({ id_tema: "", titulo: "", tipo: "", url: "", descripcion: "", activo: true });
const materialId = ref(null);

const tiposMaterial = [
  { value: "PDF", label: "PDF" },
  { value: "Video", label: "Video" },
  { value: "Enlace", label: "Enlace web" },
  { value: "Imagen", label: "Imagen" },
  { value: "Documento", label: "Documento" },
  { value: "Otro", label: "Otro" },
];

const cargar = async () => {
  loading.value = true;
  try {
    const [matRes, temasRes, cursosRes] = await Promise.all([
      contenidoService.listarMateriales(filtroIdTema.value || undefined),
      contenidoService.listarTemas(),
      contenidoService.listarCursos(),
    ]);
    materiales.value = matRes.data;
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
  form.value = { id_tema: temas.value[0]?.id_tema || "", titulo: "", tipo: "PDF", url: "", descripcion: "", activo: true };
  materialId.value = null;
  editando.value = false;
  showModal.value = true;
};

const abrirEditar = (mat) => {
  form.value = {
    id_tema: mat.id_tema,
    titulo: mat.titulo,
    tipo: mat.tipo || "PDF",
    url: mat.url || "",
    descripcion: mat.descripcion || "",
    activo: mat.activo,
  };
  materialId.value = mat.id_material;
  editando.value = true;
  showModal.value = true;
};

const guardar = async () => {
  mensaje.value = "";
  error.value = "";
  try {
    if (editando.value) {
      await contenidoService.actualizarMaterial(materialId.value, form.value);
      mensaje.value = "Material actualizado";
    } else {
      await contenidoService.crearMaterial(form.value);
      mensaje.value = "Material creado";
    }
    showModal.value = false;
    await cargar();
    setTimeout(() => (mensaje.value = ""), 3000);
  } catch (err) {
    error.value = err.response?.data?.error || "Error al guardar";
  }
};

const confirmarEliminar = (mat) => {
  materialAEliminar.value = mat;
  showDeleteModal.value = true;
};

const eliminar = async () => {
  error.value = "";
  try {
    await contenidoService.eliminarMaterial(materialAEliminar.value.id_material);
    mensaje.value = "Material eliminado";
    showDeleteModal.value = false;
    await cargar();
    setTimeout(() => (mensaje.value = ""), 3000);
  } catch (err) {
    error.value = err.response?.data?.error || "Error al eliminar";
    showDeleteModal.value = false;
  }
};

const tipoIcon = (tipo) => {
  const icons = { PDF: "fas fa-file-pdf", Video: "fas fa-video", Enlace: "fas fa-link", Imagen: "fas fa-image", Documento: "fas fa-file-alt" };
  return icons[tipo] || "fas fa-file";
};

const tipoColor = (tipo) => {
  const colors = { PDF: "bg-gradient-danger", Video: "bg-gradient-info", Enlace: "bg-gradient-primary", Imagen: "bg-gradient-warning", Documento: "bg-gradient-success" };
  return colors[tipo] || "bg-gradient-secondary";
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
                  <i class="fas fa-folder-open" style="color: #0A4174; font-size: 20px;"></i>
                </div>
                <h5 class="text-white mb-0 font-weight-bold">Materiales de Estudio</h5>
              </div>
              <button class="btn btn-sm bg-white text-dark font-weight-bold" @click="abrirCrear">
                <i class="fas fa-plus me-1"></i> Nuevo Material
              </button>
            </div>
            <div class="mt-3">
              <select v-model="filtroIdTema" class="form-select form-select-sm" style="max-width: 300px;" @change="filtrar">
                <option value="">Todos los temas</option>
                <option v-for="t in temas" :key="t.id_tema" :value="t.id_tema">{{ t.nombre_tema }} ({{ t.curso_nombre }})</option>
              </select>
            </div>
          </div>
          <div class="card-body px-0 pt-0 pb-2">
            <div v-if="loading" class="text-center py-5">
              <div class="spinner-border text-primary"></div>
            </div>
            <div v-else-if="materiales.length === 0" class="text-center py-5 text-muted">
              <i class="fas fa-folder-open fa-3x mb-3 opacity-5"></i>
              <p>No hay materiales registrados</p>
            </div>
            <div v-else class="table-responsive p-0">
              <table class="table align-items-center mb-0">
                <thead>
                  <tr>
                    <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Material</th>
                    <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Tema / Curso</th>
                    <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 text-center">Tipo</th>
                    <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 text-center">Estado</th>
                    <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="mat in materiales" :key="mat.id_material">
                    <td>
                      <div class="d-flex px-3 py-2">
                        <div class="icon-shape shadow rounded-circle d-flex align-items-center justify-content-center me-3" :class="tipoColor(mat.tipo)" style="width: 36px; height: 36px; min-width: 36px;">
                          <i :class="tipoIcon(mat.tipo)" class="text-white text-sm"></i>
                        </div>
                        <div class="d-flex flex-column justify-content-center">
                          <h6 class="mb-0 text-sm">{{ mat.titulo }}</h6>
                          <p class="text-xs text-secondary mb-0">{{ mat.descripcion || '' }}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <p class="text-xs font-weight-bold mb-0">{{ mat.nombre_tema }}</p>
                      <p class="text-xs text-secondary mb-0">{{ mat.curso_nombre }}</p>
                    </td>
                    <td class="text-center"><span class="badge" :class="tipoColor(mat.tipo)">{{ mat.tipo || 'N/A' }}</span></td>
                    <td class="text-center">
                      <span class="badge" :class="mat.activo ? 'bg-gradient-success' : 'bg-gradient-secondary'">
                        {{ mat.activo ? 'Activo' : 'Inactivo' }}
                      </span>
                    </td>
                    <td class="text-center">
                      <a v-if="mat.url" :href="mat.url" target="_blank" class="text-primary me-2" title="Abrir enlace">
                        <i class="fas fa-external-link-alt text-sm"></i>
                      </a>
                      <a href="javascript:;" class="text-info me-2" @click="abrirEditar(mat)" title="Editar">
                        <i class="fas fa-edit text-sm"></i>
                      </a>
                      <a href="javascript:;" class="text-danger" @click="confirmarEliminar(mat)" title="Eliminar">
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
        <h5 class="font-weight-bold mb-3">{{ editando ? 'Editar Material' : 'Nuevo Material' }}</h5>
        <form @submit.prevent="guardar">
          <div class="mb-3">
            <label class="form-label text-sm font-weight-bold">Tema *</label>
            <select v-model="form.id_tema" class="form-select" required>
              <option v-for="t in temas" :key="t.id_tema" :value="t.id_tema">{{ t.nombre_tema }} ({{ t.curso_nombre }})</option>
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label text-sm font-weight-bold">Título *</label>
            <input v-model="form.titulo" type="text" class="form-control" required />
          </div>
          <div class="mb-3">
            <label class="form-label text-sm font-weight-bold">Tipo</label>
            <select v-model="form.tipo" class="form-select">
              <option v-for="t in tiposMaterial" :key="t.value" :value="t.value">{{ t.label }}</option>
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label text-sm font-weight-bold">URL / Enlace</label>
            <input v-model="form.url" type="text" class="form-control" placeholder="https://..." />
          </div>
          <div class="mb-3">
            <label class="form-label text-sm font-weight-bold">Descripción</label>
            <textarea v-model="form.descripcion" class="form-control" rows="2"></textarea>
          </div>
          <div v-if="editando" class="mb-3 form-check">
            <input v-model="form.activo" type="checkbox" class="form-check-input" id="activoCheck" />
            <label class="form-check-label text-sm" for="activoCheck">Activo</label>
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
        <p>¿Estás seguro de eliminar el material <strong>{{ materialAEliminar?.titulo }}</strong>?</p>
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

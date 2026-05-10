<script setup>
import { ref, computed, onBeforeMount, onBeforeUnmount, onMounted } from "vue";
import { useStore } from "vuex";
import * as faceapi from "face-api.js";
import usuarioService from "@/services/usuario.service";
import perfilService from "@/services/perfil.service";
import { mascararDni } from "@/utils/mask";

import setNavPills from "@/assets/js/nav-pills.js";
import setTooltip from "@/assets/js/tooltip.js";
import ProfileCard from "./components/ProfileCard.vue";

const store = useStore();
const body = document.getElementsByTagName("body")[0];
const API_ORIGIN = "http://localhost:3000";
const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Estado de cuenta
const cuenta = ref(null);
const isLoading = ref(true);
const errorMsg = ref("");
const successMsg = ref("");
const mostrarDni = ref(false);

const dniMostrado = computed(() => {
  if (!cuenta.value?.dni) return "";
  return mostrarDni.value ? cuenta.value.dni : mascararDni(cuenta.value.dni);
});

// Modal de cambio de avatar
const showAvatarModal = ref(false);
const showConfirmDialog = ref(false);
const avatarFile = ref(null);
const avatarPreview = ref(null);
const avatarUploading = ref(false);
const avatarError = ref("");
const fileInput = ref(null);

// Detección facial
const facialModelsLoaded = ref(false);
const validandoRostro = ref(false);
const rostroDetectado = ref(false);

async function cargarModelosFaciales() {
  if (facialModelsLoaded.value) return;
  try {
    await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
    facialModelsLoaded.value = true;
  } catch (err) {
    console.error("Error cargando modelos faciales:", err);
  }
}

async function validarRostro(imgDataUrl) {
  if (!facialModelsLoaded.value) await cargarModelosFaciales();
  if (!facialModelsLoaded.value) {
    return { ok: false, msg: "No se pudo cargar el detector facial. Intenta de nuevo." };
  }
  const img = await faceapi.fetchImage(imgDataUrl);
  const detections = await faceapi.detectAllFaces(
    img,
    new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 })
  );
  if (detections.length === 0) {
    return { ok: false, msg: "No se detectó un rostro en la imagen. La foto debe mostrar tu rostro claramente." };
  }
  if (detections.length > 1) {
    return { ok: false, msg: `Se detectaron ${detections.length} rostros. La foto debe mostrar solo tu rostro.` };
  }
  return { ok: true };
}

const inicial = computed(() => {
  if (!cuenta.value) return "?";
  return (cuenta.value.nombres?.[0] || "") + (cuenta.value.apellido?.[0] || "");
});

async function cargarCuenta() {
  isLoading.value = true;
  errorMsg.value = "";
  try {
    cuenta.value = await usuarioService.miCuenta();
  } catch (err) {
    errorMsg.value = err.response?.data?.error || "No se pudo cargar la información de tu cuenta.";
  } finally {
    isLoading.value = false;
  }
}

function abrirModalAvatar() {
  showAvatarModal.value = true;
  avatarFile.value = null;
  avatarPreview.value = null;
  avatarError.value = "";
  rostroDetectado.value = false;
  // Pre-cargar modelos en background si aún no están listos
  if (!facialModelsLoaded.value) cargarModelosFaciales();
}

function cerrarModalAvatar() {
  showAvatarModal.value = false;
  showConfirmDialog.value = false;
  avatarFile.value = null;
  avatarPreview.value = null;
  avatarError.value = "";
  if (fileInput.value) fileInput.value.value = "";
}

function abrirSelectorArchivo() {
  fileInput.value?.click();
}

async function onArchivoSeleccionado(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  avatarError.value = "";
  rostroDetectado.value = false;

  if (!ACCEPTED_TYPES.includes(file.type)) {
    avatarError.value = "Formato no permitido. Usa JPG, PNG o WEBP.";
    return;
  }
  if (file.size > MAX_AVATAR_SIZE) {
    avatarError.value = "La imagen supera los 2 MB.";
    return;
  }

  // Cargar preview
  const dataUrl = await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (ev) => resolve(ev.target.result);
    reader.readAsDataURL(file);
  });
  avatarPreview.value = dataUrl;

  // Detectar rostro automáticamente
  validandoRostro.value = true;
  const resultado = await validarRostro(dataUrl);
  validandoRostro.value = false;

  if (!resultado.ok) {
    avatarError.value = resultado.msg;
    avatarFile.value = null;
    rostroDetectado.value = false;
    return;
  }

  rostroDetectado.value = true;
  avatarFile.value = file;
}

function pedirConfirmacion() {
  if (!avatarFile.value) {
    avatarError.value = "Selecciona una imagen primero.";
    return;
  }
  showConfirmDialog.value = true;
}

async function confirmarSubida() {
  showConfirmDialog.value = false;
  avatarUploading.value = true;
  try {
    const res = await perfilService.subirAvatar(avatarFile.value);
    cuenta.value.avatar = res.data.avatar;
    const usr = store.getters["auth/currentUser"];
    if (usr) store.commit("auth/SET_USER", { ...usr, avatar: res.data.avatar });
    successMsg.value = "Avatar actualizado correctamente.";
    cerrarModalAvatar();
    setTimeout(() => { successMsg.value = ""; }, 3500);
  } catch (err) {
    avatarError.value = err.response?.data?.error || "No se pudo subir el avatar.";
  } finally {
    avatarUploading.value = false;
  }
}

onMounted(() => {
  store.state.isAbsolute = true;
  setNavPills();
  setTooltip();
});
onBeforeMount(() => {
  store.state.imageLayout = "profile-overview";
  store.state.showNavbar = false;
  store.state.showFooter = true;
  store.state.hideConfigButton = true;
  body.classList.add("profile-overview");
  cargarCuenta();
});
onBeforeUnmount(() => {
  store.state.isAbsolute = false;
  store.state.imageLayout = "default";
  store.state.showNavbar = true;
  store.state.showFooter = true;
  store.state.hideConfigButton = false;
  body.classList.remove("profile-overview");
});
</script>

<template>
  <main>
    <div class="container-fluid">
      <div
        class="page-header min-height-300"
        style="
          background-image: url(&quot;https://images.unsplash.com/photo-1531512073830-ba890ca4eba2?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80&quot;);
          margin-right: -24px;
          margin-left: -34%;
        "
      >
        <span class="mask bg-gradient-success opacity-6"></span>
      </div>
      <div class="card shadow-lg mt-n6">
        <div class="card-body p-3">
          <div class="row gx-4">
            <div class="col-auto">
              <div class="avatar avatar-xl position-relative">
                <img
                  v-if="cuenta?.avatar"
                  :src="`${API_ORIGIN}${cuenta.avatar}`"
                  alt="profile_image"
                  class="shadow-sm w-100 h-100 border-radius-lg"
                  style="object-fit: cover;"
                />
                <div
                  v-else
                  class="shadow-sm w-100 h-100 border-radius-lg d-flex align-items-center justify-content-center bg-gradient-success text-white"
                  style="font-size: 1.6rem; font-weight: 700;"
                >
                  {{ inicial }}
                </div>
                <button
                  type="button"
                  class="avatar-edit-btn"
                  title="Cambiar avatar"
                  @click="abrirModalAvatar"
                >
                  <i class="fas fa-camera"></i>
                </button>
              </div>
            </div>
            <div class="col-auto my-auto">
              <div class="h-100">
                <h5 class="mb-1" v-if="cuenta">{{ cuenta.nombres }} {{ cuenta.apellido }}</h5>
                <h5 class="mb-1 text-muted" v-else>Cargando...</h5>
                <p class="mb-0 font-weight-bold text-sm" v-if="cuenta">{{ cuenta.rol }}</p>
              </div>
            </div>
            <div
              class="mx-auto mt-3 col-lg-4 col-md-6 my-sm-auto ms-sm-auto me-sm-0"
            >
              <div class="nav-wrapper position-relative end-0">
                <ul
                  class="p-1 bg-transparent nav nav-pills nav-fill"
                  role="tablist"
                >
                  <li class="nav-item">
                    <a
                      class="px-0 py-1 mb-0 nav-link active"
                      data-bs-toggle="tab"
                      href="javascript:;"
                      role="tab"
                      aria-selected="true"
                    >
                      <i class="fas fa-id-card text-dark me-1"></i>
                      <span class="ms-1">Cuenta</span>
                    </a>
                  </li>
                  <li class="nav-item">
                    <a
                      class="px-0 py-1 mb-0 nav-link"
                      data-bs-toggle="tab"
                      href="javascript:;"
                      role="tab"
                      aria-selected="false"
                    >
                      <i class="fas fa-shield-alt text-dark me-1"></i>
                      <span class="ms-1">Seguridad</span>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Alertas globales -->
    <div class="container-fluid mt-3" v-if="successMsg || errorMsg">
      <div v-if="successMsg" class="alert alert-success py-2 mb-0">
        <i class="fas fa-check-circle me-2"></i>{{ successMsg }}
      </div>
      <div v-if="errorMsg" class="alert alert-danger py-2 mb-0">
        <i class="fas fa-exclamation-circle me-2"></i>{{ errorMsg }}
      </div>
    </div>

    <div class="py-4 container-fluid" v-if="cuenta">
      <div class="row">
        <div class="col-md-8">
          <div class="card">
            <div class="card-header pb-0">
              <h6 class="mb-0">
                Mi información <span class="text-muted text-xs">· HU10</span>
              </h6>
            </div>
            <div class="card-body">
              <div class="row g-3">
                <!-- Nombre completo (no editable) -->
                <div class="col-md-6">
                  <label class="info-label">Nombre completo</label>
                  <input type="text" class="form-control" :value="`${cuenta.nombres} ${cuenta.apellido}`" readonly />
                  <small class="info-help">Este campo solo puede ser modificado por el administrador.</small>
                </div>

                <!-- Código de alumno -->
                <div class="col-md-6">
                  <label class="info-label">Código {{ cuenta.rol === 'Estudiante' ? 'de alumno' : '' }}</label>
                  <input type="text" class="form-control" :value="cuenta.codigo" readonly />
                </div>

                <!-- DNI con toggle ojo -->
                <div class="col-md-6">
                  <label class="info-label">DNI</label>
                  <div class="dni-field">
                    <input type="text" class="form-control" :value="dniMostrado" readonly />
                    <button
                      type="button"
                      class="dni-toggle-btn"
                      :title="mostrarDni ? 'Ocultar DNI' : 'Mostrar DNI'"
                      @click="mostrarDni = !mostrarDni"
                    >
                      <i :class="mostrarDni ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                    </button>
                  </div>
                </div>

                <!-- Aula (placeholder hasta integrar backend) -->
                <div class="col-md-6">
                  <label class="info-label">Aula</label>
                  <input type="text" class="form-control" :value="cuenta.aula || 'Sin asignar'" readonly />
                </div>

                <!-- Correo institucional -->
                <div class="col-md-12">
                  <label class="info-label">Correo institucional</label>
                  <input type="email" class="form-control" :value="cuenta.correo || '—'" readonly />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <profile-card />
        </div>
      </div>
    </div>

    <!-- Modal de cambio de avatar -->
    <Teleport to="body">
      <div v-if="showAvatarModal" class="modal-backdrop-custom" @click.self="cerrarModalAvatar">
        <div class="modal-dialog-custom">
          <div class="modal-header-custom">
            <h5 class="mb-0">
              <i class="fas fa-camera-retro me-2 text-primary"></i>Cambiar avatar
            </h5>
            <button type="button" class="btn-close-custom" @click="cerrarModalAvatar">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="modal-body-custom">
            <!-- Aviso de uso responsable -->
            <div class="alert alert-info py-2 mb-3" style="font-size: 0.85rem;">
              <i class="fas fa-info-circle me-2"></i>
              <strong>Uso responsable:</strong> tu foto debe mostrar tu rostro claramente. No subas imágenes inapropiadas, ofensivas u obscenas. Las imágenes son revisadas automáticamente.
            </div>

            <!-- Estados de validación facial -->
            <div v-if="validandoRostro" class="alert alert-secondary py-2 mb-2 d-flex align-items-center" style="font-size: 0.85rem;">
              <i class="fas fa-spinner fa-spin me-2"></i> Detectando rostro...
            </div>
            <div v-else-if="rostroDetectado && !avatarError" class="alert alert-success py-2 mb-2 d-flex align-items-center" style="font-size: 0.85rem;">
              <i class="fas fa-check-circle me-2"></i> Rostro detectado correctamente.
            </div>

            <!-- Preview / drop zone -->
            <div class="avatar-preview-zone" @click="abrirSelectorArchivo">
              <img v-if="avatarPreview" :src="avatarPreview" alt="preview" class="avatar-preview-img" />
              <div v-else class="avatar-preview-empty">
                <i class="fas fa-cloud-upload-alt"></i>
                <p class="mb-0 mt-2">Haz clic para seleccionar una foto</p>
                <small class="text-muted">JPG, PNG o WEBP · máx. 2 MB</small>
              </div>
            </div>
            <input
              ref="fileInput"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style="display: none;"
              @change="onArchivoSeleccionado"
            />

            <!-- Error -->
            <div v-if="avatarError" class="alert alert-danger py-2 mt-2 mb-0" style="font-size: 0.85rem;">
              <i class="fas fa-exclamation-circle me-1"></i>{{ avatarError }}
            </div>
          </div>

          <div class="modal-footer-custom">
            <button class="btn btn-sm btn-outline-secondary mb-0" @click="cerrarModalAvatar" :disabled="avatarUploading">
              Cancelar
            </button>
            <button
              class="btn btn-sm btn-primary mb-0"
              @click="pedirConfirmacion"
              :disabled="!avatarFile || avatarUploading"
            >
              <i class="fas fa-check me-1"></i> Continuar
            </button>
          </div>
        </div>
      </div>

      <!-- Diálogo de confirmación final -->
      <div v-if="showConfirmDialog" class="modal-backdrop-custom" style="z-index: 10001;">
        <div class="modal-dialog-custom" style="max-width: 420px;">
          <div class="modal-body-custom text-center py-4">
            <div class="confirm-icon">
              <i class="fas fa-question-circle"></i>
            </div>
            <h5 class="mt-3 mb-2">¿Estás seguro?</h5>
            <p class="text-sm text-muted mb-0">
              Esta foto será tu avatar en la plataforma y será visible para tus compañeros, docentes y administradores.
            </p>
          </div>
          <div class="modal-footer-custom justify-content-center gap-2">
            <button class="btn btn-sm btn-outline-secondary mb-0" @click="showConfirmDialog = false" :disabled="avatarUploading">
              No, revisar
            </button>
            <button class="btn btn-sm btn-primary mb-0" @click="confirmarSubida" :disabled="avatarUploading">
              <i v-if="!avatarUploading" class="fas fa-check me-1"></i>
              <i v-else class="fas fa-spinner fa-spin me-1"></i>
              Sí, usar esta foto
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </main>
</template>

<style scoped>
.avatar-edit-btn {
  position: absolute;
  bottom: -4px;
  right: -4px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid #fff;
  background: #4338ca;
  color: #fff;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}
.avatar-edit-btn:hover {
  transform: scale(1.1) rotate(-8deg);
  background: #4f46e5;
}

/* Modal */
.modal-backdrop-custom {
  position: fixed; inset: 0; z-index: 10000;
  background: rgba(15, 23, 42, 0.55);
  display: flex; align-items: center; justify-content: center;
  padding: 1rem;
  animation: fadeIn 0.2s;
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.modal-dialog-custom {
  background: #fff; border-radius: 14px; width: 100%; max-width: 520px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  animation: slideUp 0.25s;
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.modal-header-custom {
  padding: 1rem 1.5rem; border-bottom: 1px solid #e2e8f0;
  display: flex; justify-content: space-between; align-items: center;
}
.btn-close-custom {
  border: none; background: none; color: #94a3b8;
  font-size: 1rem; cursor: pointer; padding: 4px 8px; border-radius: 6px;
  transition: all 0.2s;
}
.btn-close-custom:hover { background: #f1f5f9; color: #1e293b; }
.modal-body-custom { padding: 1.25rem 1.5rem; }
.modal-footer-custom {
  padding: 0.75rem 1.5rem 1rem; border-top: 1px solid #e2e8f0;
  display: flex; justify-content: flex-end; gap: 0.5rem;
}

/* Preview */
.avatar-preview-zone {
  border: 2px dashed #cbd5e1; border-radius: 12px; padding: 1.5rem;
  text-align: center; cursor: pointer; transition: all 0.2s;
  min-height: 200px; display: flex; align-items: center; justify-content: center;
}
.avatar-preview-zone:hover { border-color: #4338ca; background: #eef2ff; }
.avatar-preview-img {
  max-width: 180px; max-height: 180px; border-radius: 12px;
  object-fit: cover;
}
.avatar-preview-empty { color: #94a3b8; }
.avatar-preview-empty i { font-size: 2.4rem; opacity: 0.5; }

.confirm-icon {
  width: 64px; height: 64px; margin: 0 auto;
  border-radius: 50%; background: #dbeafe; color: #2563eb;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.8rem;
}

/* DNI con toggle ojo */
.dni-field { position: relative; }
.dni-toggle-btn {
  position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
  border: none; background: transparent; color: #94a3b8;
  cursor: pointer; padding: 6px 8px; border-radius: 6px;
  font-size: 0.85rem; transition: all 0.2s;
}
.dni-toggle-btn:hover { color: #4338ca; background: #eef2ff; }

/* Mi información */
.info-label {
  font-size: 0.85rem; font-weight: 700; color: #1e293b;
  margin-bottom: 6px; display: flex; align-items: center; gap: 8px;
}
.info-help {
  display: block; font-size: 0.75rem; color: #94a3b8;
  margin-top: 4px;
}
.badge-editable {
  font-size: 0.65rem; font-weight: 600;
  background: #d1fae5; color: #047857;
  padding: 2px 8px; border-radius: 12px;
  text-transform: lowercase;
}
</style>

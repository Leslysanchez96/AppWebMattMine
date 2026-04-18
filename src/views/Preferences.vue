<script setup>
import { ref, onMounted } from "vue";
import perfilService from "@/services/perfil.service";

const loading = ref(true);
const saving = ref(false);
const mensaje = ref("");
const error = ref("");

const form = ref({
  deporte: "",
  hobby: "",
  color: "",
  mascota: "",
  comida_favorita: "",
  artista: "",
  interes_adicional: "",
});

const campos = [
  { key: "deporte", label: "Deporte favorito", icon: "fas fa-futbol", placeholder: "Ej: Fútbol, Básquet..." },
  { key: "hobby", label: "Hobby o pasatiempo", icon: "fas fa-gamepad", placeholder: "Ej: Dibujar, Leer..." },
  { key: "color", label: "Color favorito", icon: "fas fa-palette", placeholder: "Ej: Azul, Rojo..." },
  { key: "mascota", label: "Mascota favorita", icon: "fas fa-paw", placeholder: "Ej: Perro, Gato..." },
  { key: "comida_favorita", label: "Comida favorita", icon: "fas fa-utensils", placeholder: "Ej: Pizza, Ceviche..." },
  { key: "artista", label: "Artista o personaje favorito", icon: "fas fa-star", placeholder: "Ej: Bad Bunny, Messi..." },
  { key: "interes_adicional", label: "Otros intereses", icon: "fas fa-lightbulb", placeholder: "Algo más que te guste..." },
];

onMounted(async () => {
  try {
    const { data } = await perfilService.obtenerPreferencias();
    if (data && data.id_preferencia) {
      Object.keys(form.value).forEach((key) => {
        if (data[key]) form.value[key] = data[key];
      });
    }
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
});

const guardar = async () => {
  saving.value = true;
  mensaje.value = "";
  error.value = "";
  try {
    await perfilService.actualizarPreferencias(form.value);
    mensaje.value = "Preferencias guardadas correctamente";
    setTimeout(() => (mensaje.value = ""), 3000);
  } catch (err) {
    error.value = err.response?.data?.error || "Error al guardar preferencias";
  } finally {
    saving.value = false;
  }
};
</script>

<template>
  <div class="container-fluid py-4">
    <div class="row justify-content-center">
      <div class="col-lg-8">
        <div class="card shadow-lg border-0">
          <div class="card-header pb-0" style="background: linear-gradient(135deg, #0A4174, #4E8EA2); border-radius: 12px 12px 0 0;">
            <div class="d-flex align-items-center py-2">
              <div class="icon-shape bg-white shadow rounded-circle d-flex align-items-center justify-content-center me-3" style="width: 48px; height: 48px;">
                <i class="fas fa-heart" style="color: #0A4174; font-size: 20px;"></i>
              </div>
              <div>
                <h5 class="text-white mb-0 font-weight-bold">Mis Preferencias</h5>
                <p class="text-white text-sm mb-0 opacity-8">Cuéntanos qué te gusta para personalizar tus evaluaciones</p>
              </div>
            </div>
          </div>
          <div class="card-body px-4 py-4">
            <div v-if="loading" class="text-center py-5">
              <div class="spinner-border text-primary" role="status"></div>
              <p class="mt-2 text-muted">Cargando preferencias...</p>
            </div>

            <form v-else @submit.prevent="guardar">
              <div v-if="mensaje" class="alert alert-success alert-dismissible fade show" role="alert">
                <i class="fas fa-check-circle me-2"></i>{{ mensaje }}
              </div>
              <div v-if="error" class="alert alert-danger alert-dismissible fade show" role="alert">
                <i class="fas fa-exclamation-circle me-2"></i>{{ error }}
              </div>

              <div class="row">
                <div v-for="campo in campos" :key="campo.key" class="col-md-6 mb-3">
                  <label class="form-label text-sm font-weight-bold text-dark">
                    <i :class="campo.icon" class="me-2" style="color: #4E8EA2;"></i>
                    {{ campo.label }}
                  </label>
                  <input
                    v-model="form[campo.key]"
                    type="text"
                    class="form-control"
                    :placeholder="campo.placeholder"
                  />
                </div>
              </div>

              <div class="text-end mt-3">
                <button type="submit" class="btn text-white px-4" style="background: linear-gradient(135deg, #0A4174, #4E8EA2);" :disabled="saving">
                  <span v-if="saving"><i class="fas fa-spinner fa-spin me-2"></i>Guardando...</span>
                  <span v-else><i class="fas fa-save me-2"></i>Guardar Preferencias</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import politicaService from "@/services/politicaSeguridad.service";

const isLoading = ref(false);
const isSaving = ref(false);
const error = ref("");
const successMsg = ref("");

// Campos del formulario
const longitud_minima = ref(8);
const vigencia_dias = ref(90);
const requiere_mayuscula = ref(true);
const requiere_minuscula = ref(true);
const requiere_numero = ref(true);
const requiere_especial = ref(true);
const dias_aviso_expiracion = ref(5);
const intentos_fallidos_max = ref(3);

// Estado original para detectar cambios
const originalState = ref("");

const hasChanges = computed(() => {
  return JSON.stringify(currentState()) !== originalState.value;
});

function currentState() {
  return {
    longitud_minima: longitud_minima.value,
    vigencia_dias: vigencia_dias.value,
    requiere_mayuscula: requiere_mayuscula.value,
    requiere_minuscula: requiere_minuscula.value,
    requiere_numero: requiere_numero.value,
    requiere_especial: requiere_especial.value,
    dias_aviso_expiracion: dias_aviso_expiracion.value,
    intentos_fallidos_max: intentos_fallidos_max.value,
  };
}

async function cargarPolitica() {
  isLoading.value = true;
  error.value = "";
  try {
    const data = await politicaService.obtener();
    longitud_minima.value = data.longitud_minima;
    vigencia_dias.value = data.vigencia_dias;
    requiere_mayuscula.value = data.requiere_mayuscula;
    requiere_minuscula.value = data.requiere_minuscula;
    requiere_numero.value = data.requiere_numero;
    requiere_especial.value = data.requiere_especial;
    dias_aviso_expiracion.value = data.dias_aviso_expiracion;
    intentos_fallidos_max.value = data.intentos_fallidos_max;
    originalState.value = JSON.stringify(currentState());
  } catch (err) {
    error.value = err.response?.data?.error || "Error al cargar la configuración.";
  } finally {
    isLoading.value = false;
  }
}

async function guardarPolitica() {
  isSaving.value = true;
  error.value = "";
  successMsg.value = "";
  try {
    await politicaService.actualizar(currentState());
    successMsg.value = "Política de seguridad actualizada correctamente.";
    originalState.value = JSON.stringify(currentState());
    setTimeout(() => (successMsg.value = ""), 4000);
  } catch (err) {
    error.value = err.response?.data?.error || "Error al guardar la configuración.";
  } finally {
    isSaving.value = false;
  }
}

function restaurarDefecto() {
  longitud_minima.value = 8;
  vigencia_dias.value = 90;
  requiere_mayuscula.value = true;
  requiere_minuscula.value = true;
  requiere_numero.value = true;
  requiere_especial.value = true;
  dias_aviso_expiracion.value = 5;
  intentos_fallidos_max.value = 3;
}

onMounted(cargarPolitica);
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

    <!-- Header -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="d-flex align-items-center justify-content-between">
          <div>
            <h4 class="mb-1" style="color: #001D39; font-weight: 800;">
              <i class="fas fa-shield-alt me-2" style="color: #0A4174;"></i>
              Política de Contraseñas Seguras
            </h4>
            <p class="text-sm mb-0" style="color: #6b7280;">
              Define los requisitos de seguridad para las contraseñas de todos los usuarios
            </p>
          </div>
          <button
            class="btn btn-sm mb-0"
            style="background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; border-radius: 10px; font-weight: 600;"
            @click="restaurarDefecto"
            :disabled="isSaving"
          >
            <i class="fas fa-undo me-1"></i> Restaurar Valores por Defecto
          </button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border" style="color: #0A4174;" role="status"></div>
      <p class="text-sm mt-2" style="color: #6b7280;">Cargando configuración...</p>
    </div>

    <div v-else>
      <!-- Card: Requisitos de Complejidad -->
      <div class="card mb-4" style="border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.06);">
        <div class="card-body p-4">
          <h6 class="mb-3" style="color: #001D39; font-weight: 700; font-size: 1.05rem;">
            <i class="fas fa-key me-2" style="color: #0A4174;"></i>
            Requisitos de Complejidad
          </h6>

          <div class="row mb-4">
            <div class="col-md-6 mb-3 mb-md-0">
              <label class="form-label sp-label">Longitud mínima (caracteres)</label>
              <input
                type="number"
                class="form-control sp-input"
                v-model.number="longitud_minima"
                min="4"
                max="30"
              />
              <small class="text-muted">Entre 4 y 30 caracteres</small>
            </div>
            <div class="col-md-6">
              <label class="form-label sp-label">Vigencia (días)</label>
              <input
                type="number"
                class="form-control sp-input"
                v-model.number="vigencia_dias"
                min="1"
                max="365"
              />
              <small class="text-muted">Días antes de solicitar cambio de contraseña</small>
            </div>
          </div>

          <div class="sp-checks-grid">
            <label class="sp-check-item">
              <input type="checkbox" v-model="requiere_mayuscula" class="sp-checkbox" />
              <span class="sp-check-text">Requerir letra mayúscula</span>
            </label>
            <label class="sp-check-item">
              <input type="checkbox" v-model="requiere_minuscula" class="sp-checkbox" />
              <span class="sp-check-text">Requerir letra minúscula</span>
            </label>
            <label class="sp-check-item">
              <input type="checkbox" v-model="requiere_numero" class="sp-checkbox" />
              <span class="sp-check-text">Requerir número</span>
            </label>
            <label class="sp-check-item">
              <input type="checkbox" v-model="requiere_especial" class="sp-checkbox" />
              <span class="sp-check-text">Requerir carácter especial</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Card: Notificaciones y Bloqueo -->
      <div class="card mb-4" style="border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.06);">
        <div class="card-body p-4">
          <h6 class="mb-3" style="color: #001D39; font-weight: 700; font-size: 1.05rem;">
            <i class="fas fa-bell me-2" style="color: #f59e0b;"></i>
            Notificaciones y Bloqueo
          </h6>

          <div class="row">
            <div class="col-md-6 mb-3 mb-md-0">
              <label class="form-label sp-label">Días de anticipación para notificar expiración</label>
              <input
                type="number"
                class="form-control sp-input"
                v-model.number="dias_aviso_expiracion"
                min="1"
                max="30"
              />
              <small class="text-muted">Días antes de expirar para mostrar aviso</small>
            </div>
            <div class="col-md-6">
              <label class="form-label sp-label">Intentos fallidos antes del bloqueo</label>
              <input
                type="number"
                class="form-control sp-input"
                v-model.number="intentos_fallidos_max"
                min="1"
                max="10"
              />
              <small class="text-muted">Número máximo de intentos antes de bloquear la cuenta</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Botón Guardar -->
      <div class="d-flex justify-content-end gap-2">
        <button
          class="btn mb-0"
          style="background: linear-gradient(135deg, #0A4174 0%, #4E8EA2 100%); color: #fff; border: none; border-radius: 12px; padding: 12px 32px; font-weight: 700; font-size: 0.95rem; box-shadow: 0 4px 15px rgba(10,65,116,0.3); transition: all 0.3s ease;"
          :disabled="isSaving || !hasChanges"
          @click="guardarPolitica"
        >
          <i class="fas fa-save me-2"></i>
          {{ isSaving ? 'Guardando...' : 'Guardar Configuración' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sp-label {
  color: #001D39;
  font-weight: 600;
  font-size: 0.85rem;
  margin-bottom: 6px;
}

.sp-input {
  border: 1px solid #BDD8E9 !important;
  border-radius: 10px !important;
  padding: 10px 14px !important;
  font-size: 0.95rem !important;
  color: #001D39 !important;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.sp-input:focus {
  border-color: #0A4174 !important;
  box-shadow: 0 0 0 3px rgba(10, 65, 116, 0.12) !important;
}

.sp-checks-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.sp-check-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: #f8fafc;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 0;
}

.sp-check-item:hover {
  background: #EBF5FB;
  border-color: #BDD8E9;
}

.sp-checkbox {
  width: 18px;
  height: 18px;
  accent-color: #0A4174;
  cursor: pointer;
  flex-shrink: 0;
}

.sp-check-text {
  color: #334155;
  font-size: 0.9rem;
  font-weight: 500;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .sp-checks-grid {
    grid-template-columns: 1fr;
  }
}
</style>

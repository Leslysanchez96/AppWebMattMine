<script setup>
import { ref, computed } from "vue";
import { useStore } from "vuex";
import authService from "@/services/auth.service";

const store = useStore();

const currentUser = computed(() => store.getters["auth/currentUser"]);
const passwordActual = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
const showActual = ref(false);
const showNew = ref(false);
const showConfirm = ref(false);
const isLoading = ref(false);
const message = ref("");
const error = ref("");

// Validaciones de política (HU33)
const politicaCheck = computed(() => {
  const p = newPassword.value;
  return {
    longitud: p.length >= 8,
    mayuscula: /[A-Z]/.test(p),
    minuscula: /[a-z]/.test(p),
    numero: /[0-9]/.test(p),
    especial: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(p),
  };
});

const politicaValida = computed(() =>
  Object.values(politicaCheck.value).every(Boolean)
);

const handleChangePassword = async () => {
  error.value = "";
  message.value = "";

  if (!politicaValida.value) {
    error.value = "La contraseña no cumple con la política de seguridad.";
    return;
  }

  if (newPassword.value !== confirmPassword.value) {
    error.value = "Las contraseñas no coinciden.";
    return;
  }

  isLoading.value = true;

  try {
    await authService.cambiarPassword(passwordActual.value, newPassword.value);
    message.value = "Contraseña actualizada. Serás redirigido al inicio de sesión...";
    setTimeout(() => {
      store.dispatch("auth/logout");
    }, 2500);
  } catch (err) {
    error.value = err.response?.data?.error || "Error al cambiar la contraseña.";
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="cp-wrapper">
    <!-- Banner superior -->
    <div class="cp-top-banner">
      <div class="cp-top-content">
        <div class="d-flex align-items-center justify-content-center gap-3 mb-2">
          <div class="cp-icon-circle">
            <i class="ni ni-lock-circle-open" style="font-size: 1.8rem; color: #fff;"></i>
          </div>
          <h2 class="text-white fw-bold mb-0">Seguridad de tu cuenta</h2>
        </div>
        <p class="text-white-50 text-center mb-3" style="font-size: 0.95rem;">
          Mantén tu cuenta protegida actualizando tu contraseña regularmente.
        </p>
        <div class="d-flex justify-content-center gap-3 flex-wrap">
          <div class="cp-tip-item">
            <i class="fas fa-shield-alt me-2 text-white-50"></i>
            <span>No compartas tu contraseña</span>
          </div>
          <div class="cp-tip-item">
            <i class="fas fa-key me-2 text-white-50"></i>
            <span>Usa combinaciones únicas</span>
          </div>
          <div class="cp-tip-item">
            <i class="fas fa-sync-alt me-2 text-white-50"></i>
            <span>Cámbiala cada 90 días</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Formulario centrado -->
    <div class="d-flex justify-content-center cp-right-panel">
      <div class="cp-form-container">
          <!-- Header -->
          <div class="text-center mb-4">
            <h3 class="fw-bold mb-1" style="color: #001D39; font-size: 1.6rem;">Cambiar Contraseña</h3>
            <p class="text-muted mb-0">
              Hola, <strong style="color: #0A4174;">{{ currentUser?.nombres }}</strong>. Actualiza tu contraseña.
            </p>
          </div>

          <!-- Requisitos de seguridad (siempre visible arriba) -->
          <div class="cp-policy-static mb-3">
            <p class="cp-policy-static-title mb-2">
              <i class="fas fa-shield-alt me-1"></i>Tu contraseña debe cumplir con:
            </p>
            <ul class="cp-policy-static-list mb-0">
              <li>Mínimo <strong>8 caracteres</strong></li>
              <li>Al menos <strong>1 letra mayúscula</strong> y <strong>1 minúscula</strong></li>
              <li>Al menos <strong>1 número</strong></li>
              <li>Al menos <strong>1 carácter especial</strong> (!@#$%&*...)</li>
            </ul>
          </div>

          <!-- Mensajes -->
          <div v-if="error" class="cp-alert cp-alert-error mb-3">
            <i class="fas fa-exclamation-circle me-2"></i>{{ error }}
          </div>
          <div v-if="message" class="cp-alert cp-alert-success mb-3">
            <i class="fas fa-check-circle me-2"></i>{{ message }}
          </div>

          <form @submit.prevent="handleChangePassword">
            <!-- Contraseña actual -->
            <div class="mb-3">
              <label class="cp-label">Contraseña actual</label>
              <div class="cp-input-wrapper">
                <i class="ni ni-key-25 cp-input-icon"></i>
                <input
                  :type="showActual ? 'text' : 'password'"
                  class="form-control cp-input"
                  v-model="passwordActual"
                  placeholder="Ingresa tu contraseña actual"
                  required
                />
                <button class="cp-toggle-btn" type="button" @click="showActual = !showActual">
                  <i class="fas" :class="showActual ? 'fa-eye-slash' : 'fa-eye'"></i>
                </button>
              </div>
            </div>

            <!-- Nueva contraseña -->
            <div class="mb-3">
              <label class="cp-label">Nueva contraseña</label>
              <div class="cp-input-wrapper">
                <i class="ni ni-lock-circle-open cp-input-icon"></i>
                <input
                  :type="showNew ? 'text' : 'password'"
                  class="form-control cp-input"
                  v-model="newPassword"
                  placeholder="Ingresa tu nueva contraseña"
                  required
                />
                <button class="cp-toggle-btn" type="button" @click="showNew = !showNew">
                  <i class="fas" :class="showNew ? 'fa-eye-slash' : 'fa-eye'"></i>
                </button>
              </div>
            </div>

            <!-- Indicadores de política (HU33) -->
            <div class="cp-policy-box mb-3" v-if="newPassword">
              <p class="cp-policy-title mb-2">
                <i class="fas fa-info-circle me-1"></i>Requisitos de seguridad
              </p>
              <div class="row g-2">
                <div class="col-6">
                  <span class="cp-policy-item" :class="{ 'cp-check': politicaCheck.longitud }">
                    <i class="fas" :class="politicaCheck.longitud ? 'fa-check-circle' : 'fa-times-circle'"></i>
                    Mínimo 8 caracteres
                  </span>
                </div>
                <div class="col-6">
                  <span class="cp-policy-item" :class="{ 'cp-check': politicaCheck.mayuscula }">
                    <i class="fas" :class="politicaCheck.mayuscula ? 'fa-check-circle' : 'fa-times-circle'"></i>
                    Una mayúscula
                  </span>
                </div>
                <div class="col-6">
                  <span class="cp-policy-item" :class="{ 'cp-check': politicaCheck.minuscula }">
                    <i class="fas" :class="politicaCheck.minuscula ? 'fa-check-circle' : 'fa-times-circle'"></i>
                    Una minúscula
                  </span>
                </div>
                <div class="col-6">
                  <span class="cp-policy-item" :class="{ 'cp-check': politicaCheck.numero }">
                    <i class="fas" :class="politicaCheck.numero ? 'fa-check-circle' : 'fa-times-circle'"></i>
                    Un número
                  </span>
                </div>
                <div class="col-6">
                  <span class="cp-policy-item" :class="{ 'cp-check': politicaCheck.especial }">
                    <i class="fas" :class="politicaCheck.especial ? 'fa-check-circle' : 'fa-times-circle'"></i>
                    Un carácter especial
                  </span>
                </div>
              </div>
            </div>

            <!-- Confirmar contraseña -->
            <div class="mb-4">
              <label class="cp-label">Confirmar nueva contraseña</label>
              <div class="cp-input-wrapper">
                <i class="ni ni-check-bold cp-input-icon"></i>
                <input
                  :type="showConfirm ? 'text' : 'password'"
                  class="form-control cp-input"
                  v-model="confirmPassword"
                  placeholder="Confirma tu nueva contraseña"
                  required
                />
                <button class="cp-toggle-btn" type="button" @click="showConfirm = !showConfirm">
                  <i class="fas" :class="showConfirm ? 'fa-eye-slash' : 'fa-eye'"></i>
                </button>
              </div>
              <div v-if="confirmPassword && newPassword !== confirmPassword" class="cp-match-error mt-1">
                <i class="fas fa-exclamation-triangle me-1"></i>Las contraseñas no coinciden
              </div>
              <div v-if="confirmPassword && newPassword === confirmPassword && confirmPassword.length > 0" class="cp-match-ok mt-1">
                <i class="fas fa-check me-1"></i>Las contraseñas coinciden
              </div>
            </div>

            <!-- Botón -->
            <button
              type="submit"
              class="btn cp-submit-btn w-100"
              :disabled="isLoading || !politicaValida || newPassword !== confirmPassword || !passwordActual"
            >
              <span v-if="isLoading">
                <i class="fas fa-spinner fa-spin me-2"></i>Actualizando...
              </span>
              <span v-else>
                <i class="fas fa-save me-2"></i>Cambiar Contraseña
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
</template>

<style scoped>
.cp-wrapper {
  min-height: calc(100vh - 60px);
  background: #f8fafc;
}

/* Banner superior */
.cp-top-banner {
  background: linear-gradient(135deg, #001D39 0%, #0A4174 40%, #4E8EA2 100%);
  padding: 2rem 2rem 1.8rem;
}

.cp-top-content {
  max-width: 700px;
  margin: 0 auto;
}

.cp-icon-circle {
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
}

.cp-icon-circle-sm {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #0A4174, #4E8EA2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cp-tips {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.cp-tip-item {
  display: flex;
  align-items: center;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Panel formulario */
.cp-right-panel {
  padding: 2rem;
  margin-top: -1rem;
}

.cp-form-container {
  width: 100%;
  max-width: 480px;
}

/* Labels e inputs */
.cp-label {
  display: block;
  color: #001D39;
  font-weight: 600;
  font-size: 0.85rem;
  margin-bottom: 6px;
}

.cp-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.cp-input-icon {
  position: absolute;
  left: 14px;
  color: #6EA2B3;
  font-size: 0.9rem;
  z-index: 1;
}

.cp-input {
  padding: 12px 48px 12px 40px !important;
  border: 1.5px solid #BDD8E9 !important;
  border-radius: 10px !important;
  font-size: 0.9rem !important;
  transition: border-color 0.3s, box-shadow 0.3s;
  background: #fff !important;
}

.cp-input:focus {
  border-color: #0A4174 !important;
  box-shadow: 0 0 0 3px rgba(10, 65, 116, 0.12) !important;
}

.cp-toggle-btn {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: #6EA2B3;
  cursor: pointer;
  padding: 4px 8px;
  z-index: 1;
  transition: color 0.2s;
}

.cp-toggle-btn:hover {
  color: #0A4174;
}

/* Requisitos estáticos arriba */
.cp-policy-static {
  background: #EBF5FB;
  border-radius: 12px;
  padding: 14px 18px;
  border-left: 4px solid #0A4174;
}

.cp-policy-static-title {
  color: #0A4174;
  font-size: 0.85rem;
  font-weight: 700;
}

.cp-policy-static-list {
  padding-left: 18px;
  color: #334155;
  font-size: 0.82rem;
  line-height: 1.9;
}

.cp-policy-static-list strong {
  color: #0A4174;
}

/* Política de contraseña dinámica */
.cp-policy-box {
  background: #f0f7fb;
  border: 1px solid #BDD8E9;
  border-radius: 12px;
  padding: 14px 16px;
}

.cp-policy-title {
  color: #0A4174;
  font-size: 0.8rem;
  font-weight: 600;
}

.cp-policy-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  color: #991b1b;
  transition: color 0.3s;
}

.cp-policy-item.cp-check {
  color: #166534;
}

.cp-policy-item i {
  font-size: 0.7rem;
}

/* Coincidencia de contraseñas */
.cp-match-error {
  color: #991b1b;
  font-size: 0.78rem;
}

.cp-match-ok {
  color: #166534;
  font-size: 0.78rem;
}

/* Alertas */
.cp-alert {
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
}

.cp-alert-error {
  background: #fef2f2;
  border: 1px solid #fca5a5;
  color: #991b1b;
}

.cp-alert-success {
  background: #f0fdf4;
  border: 1px solid #86efac;
  color: #166534;
}

/* Botón submit */
.cp-submit-btn {
  background: linear-gradient(135deg, #0A4174 0%, #4E8EA2 100%) !important;
  color: #fff !important;
  border: none !important;
  border-radius: 12px !important;
  padding: 14px !important;
  font-weight: 700 !important;
  font-size: 1rem !important;
  box-shadow: 0 4px 20px rgba(10, 65, 116, 0.35);
  transition: all 0.3s ease;
}

.cp-submit-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #49769F 0%, #7BBDE8 100%) !important;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(10, 65, 116, 0.4);
}

.cp-submit-btn:disabled {
  opacity: 0.5 !important;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .cp-top-banner {
    padding: 1.5rem 1rem;
  }
  .cp-tip-item {
    font-size: 0.75rem;
  }
  .cp-right-panel {
    padding: 1.5rem 1rem;
  }
}
</style>

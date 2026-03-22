<script setup>
import { onBeforeUnmount, onBeforeMount, ref, computed } from "vue";
import { useStore } from "vuex";
import { useRouter, useRoute } from "vue-router";
import loginBg from "@/assets/img/login-school.jpg";

const body = document.getElementsByTagName("body")[0];
const store = useStore();
const router = useRouter();
const route = useRoute();

const token = computed(() => route.query.token || "");
const newPassword = ref("");
const confirmPassword = ref("");
const showPassword = ref(false);
const showConfirm = ref(false);
const isLoading = ref(false);
const message = ref("");
const error = ref("");
const tokenValid = ref(false);
const userName = ref("");
const checking = ref(true);

// Verificar token al cargar
const verifyToken = async () => {
  if (!token.value) {
    error.value = "Enlace no válido.";
    checking.value = false;
    return;
  }

  try {
    const response = await fetch(`http://localhost:3000/api/verificar-token/${token.value}`);
    const data = await response.json();

    if (!response.ok) {
      error.value = data.error;
    } else {
      tokenValid.value = true;
      userName.value = data.nombres;
    }
  } catch (err) {
    error.value = "No se pudo conectar con el servidor.";
  } finally {
    checking.value = false;
  }
};

const handleReset = async () => {
  error.value = "";
  message.value = "";

  if (newPassword.value.length < 8) {
    error.value = "La contraseña debe tener al menos 8 caracteres.";
    return;
  }

  if (newPassword.value !== confirmPassword.value) {
    error.value = "Las contraseñas no coinciden.";
    return;
  }

  isLoading.value = true;

  try {
    const response = await fetch("http://localhost:3000/api/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: token.value, newPassword: newPassword.value }),
    });

    const data = await response.json();

    if (!response.ok) {
      error.value = data.error;
    } else {
      message.value = "Contraseña actualizada correctamente. Redirigiendo...";
      setTimeout(() => router.push("/signin"), 2500);
    }
  } catch (err) {
    error.value = "No se pudo conectar con el servidor.";
  } finally {
    isLoading.value = false;
  }
};

onBeforeMount(() => {
  store.state.hideConfigButton = true;
  store.state.showNavbar = false;
  store.state.showSidenav = false;
  store.state.showFooter = false;
  body.classList.remove("bg-gray-100");
  verifyToken();
});

onBeforeUnmount(() => {
  store.state.hideConfigButton = false;
  store.state.showNavbar = true;
  store.state.showSidenav = true;
  store.state.showFooter = true;
  body.classList.add("bg-gray-100");
});
</script>

<style scoped>
.reset-wrapper {
  position: relative;
  min-height: 100vh;
  width: 100%;
  overflow: hidden;
}

.reset-bg {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background-size: cover;
  background-position: 55% center;
  z-index: 0;
}

.reset-bg::after {
  content: '';
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: linear-gradient(
    to bottom,
    rgba(0, 29, 57, 0.15) 0%,
    rgba(10, 65, 116, 0.1) 50%,
    rgba(0, 29, 57, 0.2) 100%
  );
}

.reset-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1;
}

.reset-content {
  position: relative;
  z-index: 2;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

@keyframes bounceIn {
  0% { opacity: 0; transform: scale(0.3) translateY(40px); }
  50% { opacity: 1; transform: scale(1.05) translateY(-5px); }
  70% { transform: scale(0.95) translateY(2px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}

.reset-card {
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  padding: 3rem 2.8rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  max-width: 480px;
  width: 100%;
  animation: bounceIn 0.8s ease-out both;
}

.reset-card .form-control {
  background: rgba(255, 255, 255, 0.9) !important;
  border: 1px solid #BDD8E9 !important;
  border-radius: 10px !important;
  padding: 12px 16px !important;
  font-size: 0.9rem !important;
  color: #001D39 !important;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.reset-card .form-control::placeholder {
  color: #6EA2B3;
}

.reset-card .form-control::-ms-reveal,
.reset-card .form-control::-ms-clear {
  display: none !important;
}

.reset-card .form-control:focus {
  border-color: #0A4174 !important;
  box-shadow: 0 0 0 3px rgba(10, 65, 116, 0.15) !important;
  background: #fff !important;
}

.btn-reset {
  background: linear-gradient(135deg, #0A4174 0%, #4E8EA2 100%);
  color: #fff;
  border: none;
  padding: 14px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  width: 100%;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(10, 65, 116, 0.4);
}

.btn-reset:hover:not(:disabled) {
  background: linear-gradient(135deg, #49769F 0%, #7BBDE8 100%);
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(10, 65, 116, 0.5);
  color: #fff;
}

.btn-reset:disabled {
  opacity: 0.4;
}

.back-link {
  color: #0A4174;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  transition: color 0.2s;
}

.back-link:hover {
  color: #7BBDE8;
}
</style>

<template>
  <main class="mt-0 main-content">
    <div class="reset-wrapper">
      <div class="reset-bg" :style="{ backgroundImage: `url(${loginBg})` }"></div>
      <div class="reset-overlay"></div>

      <div class="reset-content">
        <div class="reset-card">

          <!-- Cargando -->
          <div v-if="checking" class="text-center py-4">
            <div class="spinner-border" style="color: #0A4174;" role="status"></div>
            <p class="mt-3" style="color: #49769F;">Verificando enlace...</p>
          </div>

          <!-- Token inválido o expirado -->
          <div v-else-if="!tokenValid" class="text-center">
            <div style="font-size: 4rem; margin-bottom: 1rem;">⚠️</div>
            <h4 style="color: #001D39; font-weight: 800;">Enlace no válido</h4>
            <p style="color: #49769F; font-size: 0.9rem;">{{ error || 'El enlace ha expirado o ya fue utilizado.' }}</p>
            <div class="d-flex align-items-start p-3 mb-4" style="background: #EBF5FB; border-radius: 12px; border-left: 4px solid #0A4174;">
              <p class="mb-0" style="color: #0A4174; font-size: 0.85rem;">
                Solicita un nuevo enlace de recuperación desde la pantalla de inicio de sesión.
              </p>
            </div>
            <router-link to="/signin" class="back-link">← Volver al inicio de sesión</router-link>
          </div>

          <!-- Formulario para nueva contraseña -->
          <div v-else-if="!message">
            <div class="text-center mb-4">
              <div style="font-size: 3rem; margin-bottom: 0.5rem;">🔐</div>
              <h4 style="color: #001D39; font-weight: 800;">Nueva Contraseña</h4>
              <p style="color: #49769F; font-size: 0.9rem;">Hola {{ userName }}, ingresa tu nueva contraseña</p>
            </div>

            <form @submit.prevent="handleReset">
              <div class="mb-3">
                <label class="form-label" style="color: #001D39; font-weight: 600; font-size: 0.85rem;">Nueva Contraseña</label>
                <div class="position-relative">
                  <input :type="showPassword ? 'text' : 'password'" class="form-control" style="padding-right: 45px;" placeholder="Mínimo 8 caracteres" v-model="newPassword" />
                  <span class="position-absolute cursor-pointer" style="right: 12px; top: 50%; transform: translateY(-50%); color: #49769F;" @click="showPassword = !showPassword">
                    <i class="fas" :class="showPassword ? 'fa-eye-slash' : 'fa-eye'"></i>
                  </span>
                </div>
              </div>

              <div class="mb-4">
                <label class="form-label" style="color: #001D39; font-weight: 600; font-size: 0.85rem;">Confirmar Contraseña</label>
                <div class="position-relative">
                  <input :type="showConfirm ? 'text' : 'password'" class="form-control" style="padding-right: 45px;" placeholder="Repite la contraseña" v-model="confirmPassword" />
                  <span class="position-absolute cursor-pointer" style="right: 12px; top: 50%; transform: translateY(-50%); color: #49769F;" @click="showConfirm = !showConfirm">
                    <i class="fas" :class="showConfirm ? 'fa-eye-slash' : 'fa-eye'"></i>
                  </span>
                </div>
              </div>

              <!-- Error -->
              <div v-if="error" class="alert py-2 px-3 mb-3 text-center" style="background: #fef2f2; border: 1px solid #fca5a5; border-radius: 10px; color: #991b1b; font-size: 0.85rem;">
                {{ error }}
              </div>

              <button type="submit" class="btn-reset mb-3" :disabled="!newPassword || !confirmPassword || isLoading">
                {{ isLoading ? 'Actualizando...' : 'Restablecer Contraseña' }}
              </button>
            </form>

          </div>

          <!-- Éxito -->
          <div v-else class="text-center py-3">
            <div style="font-size: 4rem; margin-bottom: 1rem;">✅</div>
            <h4 style="color: #001D39; font-weight: 800;">Contraseña Actualizada</h4>
            <p style="color: #49769F; font-size: 0.95rem; line-height: 1.6;">
              Tu contraseña se ha cambiado exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
            </p>
            <div class="d-flex align-items-start p-3 mb-4" style="background: #ecfdf5; border-radius: 12px; border-left: 4px solid #059669;">
              <p class="mb-0" style="color: #065f46; font-size: 0.85rem;">
                Serás redirigido al inicio de sesión en unos segundos...
              </p>
            </div>
            <router-link to="/signin" class="back-link">Ir al inicio de sesión ahora</router-link>
          </div>

        </div>
      </div>
    </div>
  </main>
</template>

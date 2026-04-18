<script setup>
import { onBeforeUnmount, onBeforeMount, ref, computed } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import ArgonButton from "@/components/ArgonButton.vue";
import loginBg from "@/assets/img/login-school.jpg";
import authService from "@/services/auth.service";
const body = document.getElementsByTagName("body")[0];
const formCard = ref(null);
const mouseX = ref(0);
const mouseY = ref(0);

const handleMouseMove = (e) => {
  if (!formCard.value) return;
  const rect = formCard.value.getBoundingClientRect();
  mouseX.value = e.clientX - rect.left;
  mouseY.value = e.clientY - rect.top;
  formCard.value.style.setProperty('--mouse-x', `${mouseX.value}px`);
  formCard.value.style.setProperty('--mouse-y', `${mouseY.value}px`);
};

const store = useStore();
const showResetModal = ref(false);
const documentNumber = ref("");
const showTermsModal = ref(false);
const showPrivacyModal = ref(false);
const selectedRole = ref("Alumno");
const password = ref("");
const showPassword = ref(false);
const documentTouched = ref(false);
const passwordTouched = ref(false);
const recoveryEmail = ref("");
const recoveryMessage = ref("");
const recoveryError = ref("");
const recoveryLoading = ref(false);
const emailSent = ref(false);
const maskedEmail = ref("");

const maskEmail = (email) => {
  const [user, domain] = email.split("@");
  const masked = user.substring(0, 2) + "*".repeat(Math.max(user.length - 2, 4));
  return `${masked}@${domain}`;
};

const handleRecoveryEmail = async () => {
  recoveryMessage.value = "";
  recoveryError.value = "";
  recoveryLoading.value = true;

  try {
    await authService.recuperarPassword(recoveryEmail.value);
    maskedEmail.value = maskEmail(recoveryEmail.value);
    emailSent.value = true;
  } catch (err) {
    recoveryError.value = err.response?.data?.error || "No se pudo conectar con el servidor.";
  } finally {
    recoveryLoading.value = false;
  }
};

const closeResetModal = () => {
  showResetModal.value = false;
  emailSent.value = false;
  recoveryEmail.value = "";
  recoveryError.value = "";
  recoveryMessage.value = "";
};

const labelText = computed(() => {
  return selectedRole.value === "Docente" ? "Código de Docente" : "Código de Alumno";
});

const placeholderText = computed(() => {
  return selectedRole.value === "Docente" ? "Ingresa tu código de docente" : "Ingresa tu código de alumno";
});

const router = useRouter();
const loginError = ref("");
const isLoading = ref(false);
const showBlockedModal = ref(false);
const blockedIntentosInfo = ref(3);

const handleLogin = async () => {
  loginError.value = "";
  isLoading.value = true;

  try {
    const data = await store.dispatch("auth/login", {
      codigo: documentNumber.value,
      password: password.value,
      rol: selectedRole.value,
    });

    // Redirigir según rol
    const rol = data.usuario.rol;
    if (rol === "Estudiante") {
      router.push("/dashboard-alumno");
    } else if (rol === "Docente") {
      router.push("/dashboard-docente");
    } else if (rol === "Administrador") {
      router.push("/dashboard-admin");
    } else {
      router.push("/dashboard-default");
    }

  } catch (err) {
    const data = err.response?.data;
    if (data?.bloqueado) {
      blockedIntentosInfo.value = data.intentosFallidos || 3;
      showBlockedModal.value = true;
      loginError.value = "";
    } else if (data?.intentosRestantes !== undefined && data.intentosRestantes <= 1) {
      loginError.value = `Contraseña incorrecta. Te queda ${data.intentosRestantes} intento antes de que tu cuenta sea bloqueada.`;
    } else {
      loginError.value = data?.error || "No se pudo conectar con el servidor. Intenta de nuevo.";
    }
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
.login-wrapper {
  position: relative;
  min-height: 100vh;
  width: 100%;
  overflow: hidden;
}

/* ── Background image ── */
.login-bg {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background-size: cover;
  background-position: 55% center;
  z-index: 0;
}

.login-bg::after {
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

/* ── Content ── */
.login-content {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: 10rem 4rem 2rem;
}

.login-left {
  max-width: none;
  margin-bottom: 1.5rem;
  text-align: center;
}

/* ── Animations ── */
@keyframes fadeSlideRight {
  from { opacity: 0; transform: translateX(-40px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.92); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes pulseGlow {
  0%, 100% { text-shadow: 2px 2px 10px rgba(0, 0, 0, 0.6); }
  50% { text-shadow: 2px 2px 15px rgba(0, 0, 0, 0.7), 0 0 20px rgba(255, 255, 255, 0.3); }
}

@keyframes bounceIn {
  0% { opacity: 0; transform: scale(0.3) translateY(40px); }
  50% { opacity: 1; transform: scale(1.05) translateY(-5px); }
  70% { transform: scale(0.95) translateY(2px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}

/* ── Title ── */
.login-title {
  font-size: clamp(2.5rem, 5vw, 5rem);
  white-space: nowrap;
  line-height: 1.15;
  font-weight: 800;
  letter-spacing: -0.5px;
  color: #ffffff;
  text-shadow: 2px 2px 10px rgba(0, 29, 57, 0.4);
  text-align: center;
  animation: bounceIn 1s ease-out both;
}

.login-description {
  color: #ffffff;
  font-size: 1.3rem;
  line-height: 1.6;
  max-width: 550px;
  font-weight: 600;
  margin: 0 auto;
  text-shadow: 2px 2px 12px rgba(0, 0, 0, 0.7), 0 0 20px rgba(0, 0, 0, 0.3);
  text-align: center;
  letter-spacing: 0.3px;
  animation: fadeSlideUp 0.8s ease-out 0.5s both, pulseGlow 3s ease-in-out 1.5s infinite;
}

/* ── Form ── */
.login-right {
  max-width: 520px;
  margin-top: 5rem;
  margin-left: 20rem;
  animation: scaleIn 0.6s ease-out 0.5s both;
}

.login-form-card {
  --mouse-x: 50%;
  --mouse-y: 50%;
  position: relative;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  padding: 3rem 2.8rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.4s ease, transform 0.3s ease, border-color 0.3s ease;
  overflow: hidden;
}

/* Fluent Light effect - glow follows cursor */
.login-form-card::before {
  content: '';
  position: absolute;
  top: var(--mouse-y);
  left: var(--mouse-x);
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(123, 189, 232, 0.18) 0%, transparent 70%);
  transform: translate(-50%, -50%);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 0;
}

.login-form-card:hover::before {
  opacity: 1;
}

.login-form-card:hover {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
  border-color: rgba(123, 189, 232, 0.4);
}

.login-form-card > * {
  position: relative;
  z-index: 1;
}

.login-form-card .form-control {
  background: rgba(255, 255, 255, 0.9) !important;
  border: 1px solid #BDD8E9 !important;
  border-radius: 10px !important;
  padding: 12px 16px !important;
  font-size: 0.9rem !important;
  color: #001D39 !important;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.login-form-card .form-control::placeholder {
  color: #6EA2B3;
}

/* Ocultar el ojo nativo del navegador */
.login-form-card .form-control::-ms-reveal,
.login-form-card .form-control::-ms-clear,
.login-form-card .form-control::-webkit-credentials-auto-fill-button {
  display: none !important;
}

.login-form-card .form-control:focus {
  border-color: #0A4174 !important;
  box-shadow: 0 0 0 3px rgba(10, 65, 116, 0.15) !important;
  background: #fff !important;
}

/* ── Buttons ── */
.btn-custom-gold {
  background: linear-gradient(135deg, #0A4174 0%, #4E8EA2 100%) !important;
  border: none !important;
  transition: all 0.3s ease !important;
  border-radius: 12px !important;
  font-weight: 700 !important;
  font-size: 1rem !important;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 20px rgba(10, 65, 116, 0.4) !important;
}

.btn-custom-gold:hover:not(:disabled) {
  background: linear-gradient(135deg, #49769F 0%, #7BBDE8 100%) !important;
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(10, 65, 116, 0.5) !important;
}

.btn-custom-gold:active:not(:disabled),
.btn-custom-gold:focus:not(:disabled) {

  background: linear-gradient(135deg, #001D39 0%, #0A4174 100%) !important;
  transform: translateY(0);
}

.btn-custom-gold:disabled {
  opacity: 0.35 !important;
}

.role-button {
  background: rgba(255, 255, 255, 0.8) !important;
  color: #0A4174 !important;
  border: 2px solid #BDD8E9 !important;
  border-radius: 50px !important;
  padding: 8px 20px !important;
  font-weight: 600 !important;
  font-size: 0.85rem !important;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
  cursor: pointer !important;
  position: relative;
  overflow: hidden;
}

.role-button:hover {
  border-color: #0A4174 !important;
  transform: translateY(-3px) scale(1.05);
  color: #001D39 !important;
  box-shadow: 0 6px 20px rgba(10, 65, 116, 0.2) !important;
}

.role-button.active {
  background: linear-gradient(135deg, #0A4174 0%, #4E8EA2 100%) !important;
  color: white !important;
  border-color: transparent !important;
  box-shadow: 0 4px 18px rgba(10, 65, 116, 0.45) !important;
  transform: scale(1.08);
}

/* ── Modal accept button ── */
.btn-modal-accept {
  background: linear-gradient(135deg, #0A4174 0%, #4E8EA2 100%);
  color: #fff;
  border: none;
  padding: 10px 40px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(10, 65, 116, 0.3);
}

.btn-modal-accept:hover {
  background: linear-gradient(135deg, #49769F 0%, #7BBDE8 100%);
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 8px 25px rgba(10, 65, 116, 0.4);
  color: #fff;
}

.btn-modal-accept:active {
  transform: translateY(0) scale(1);
  background: linear-gradient(135deg, #001D39 0%, #0A4174 100%);
}

/* ── Links ── */
.login-link {
  color: #6EA2B3 !important;
  text-decoration: none;
  transition: color 0.2s;
  font-size: 0.8rem;
}

.login-link:hover { color: #7BBDE8 !important; }

.login-link-primary {
  color: #001D39 !important;
  font-size: 0.85rem !important;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s;
  font-size: 0.85rem;
}

.login-link-primary:hover { color: #BDD8E9 !important; }

/* ── Responsive ── */
@media (max-width: 991px) {
  .login-content {
    padding: 4rem 1.5rem 2rem;
    align-items: center;
  }
  .login-left { text-align: center; }
  .login-title { white-space: normal; }
  .login-right {
    max-width: 100%;
    width: 100%;
    margin-left: 0;
    margin-top: 2rem;
  }
}
</style>
<template>
  <main class="mt-0 main-content">
    <div class="login-wrapper">

      <!-- Background image -->
      <div class="login-bg" :style="{ backgroundImage: `url(${loginBg})` }"></div>

      <!-- Content over image -->
      <div class="login-content">

        <!-- Title -->
        <div class="login-left">
          <h1 class="login-title mb-3">¡Bienvenido a MattLearn!</h1>
          <p class="login-description mb-0">
            Plataforma educativa del Colegio Privado. Accede a tus evaluaciones, materiales y seguimiento académico.
          </p>
        </div>

        <!-- Form below title -->
        <div class="login-right">
            <div class="login-form-card" ref="formCard" @mousemove="handleMouseMove">
              <h5 class="font-weight-bolder mb-3 text-center" style="font-size: 1.25rem; color: #001D39;">
                Iniciar Sesión
              </h5>

              <div class="d-flex justify-content-center gap-2 mb-3 flex-wrap">
                <button type="button" class="role-button" :class="{ active: selectedRole === 'Alumno' }" @click="selectedRole = 'Alumno'">Alumno</button>
                <button type="button" class="role-button" :class="{ active: selectedRole === 'Docente' }" @click="selectedRole = 'Docente'">Docente</button>
              </div>

              <p class="mb-3 text-center" style="color: #6b7280; font-size: 0.85rem;">
                Ingresa tus credenciales para acceder a la plataforma estudiantil.
              </p>

              <form role="form">
                <div class="mb-3">
                  <label for="documentNumber" class="form-label" style="color: #001D39; font-weight: 600; font-size: 0.85rem;">{{ labelText }}</label>
                  <input id="documentNumber" type="text" class="form-control" :placeholder="placeholderText" v-model="documentNumber" @blur="documentTouched = true" autocomplete="off" />
                  <p v-if="!documentNumber && documentTouched" class="text-danger text-xs mt-1 mb-0">*Completa este campo</p>
                </div>
                <div class="mb-3">
                  <label for="password" class="form-label" style="color: #001D39; font-weight: 600; font-size: 0.85rem;">Contraseña</label>
                  <div class="position-relative">
                    <input id="password" :type="showPassword ? 'text' : 'password'" class="form-control" style="padding-right: 45px;" placeholder="Contraseña" v-model="password" @blur="passwordTouched = true" autocomplete="new-password" />
                    <span class="position-absolute cursor-pointer" style="right: 12px; top: 50%; transform: translateY(-50%); color: #49769F;" @click="showPassword = !showPassword">
                      <i class="fas" :class="showPassword ? 'fa-eye-slash' : 'fa-eye'"></i>
                    </span>
                  </div>
                  <p v-if="!password && passwordTouched" class="text-danger text-xs mt-1 mb-0">*Completa este campo</p>
                </div>

                <div class="mb-3 text-end">
                  <a href="javascript:;" class="login-link-primary" @click="showResetModal = true" style="font-size: 0.85rem;">¿Olvidaste tu contraseña?</a>
                </div>

                <!-- Error message -->
                <div v-if="loginError" class="alert mb-3 py-2 px-3 text-center" style="background: #fef2f2; border: 1px solid #fca5a5; border-radius: 10px; color: #991b1b; font-size: 0.85rem;">
                  {{ loginError }}
                </div>

                <argon-button class="btn-custom-gold w-100 mb-2" variant="gradient" fullWidth size="lg" :disabled="!documentNumber || !password || isLoading" @click.prevent="handleLogin">
                  {{ isLoading ? 'Ingresando...' : 'Iniciar Sesión' }}
                </argon-button>
              </form>

              <div class="d-flex justify-content-center gap-3 mt-3">
                <a href="javascript:;" class="login-link" @click="showTermsModal = true">Términos y Condiciones</a>
                <a href="javascript:;" class="login-link" @click="showPrivacyModal = true">Política de protección de Datos Personales</a>
              </div>
            </div>
          </div>

      </div>

    </div>
  </main>

  <!-- Blocked Account Modal -->
  <Teleport to="body">
    <div v-if="showBlockedModal" class="modal-backdrop fade show" style="z-index: 1050;"></div>
    <div v-if="showBlockedModal" class="modal fade show d-block" tabindex="-1" style="z-index: 1055;">
      <div class="modal-dialog modal-dialog-centered" style="max-width: 420px;">
        <div class="modal-content" style="border: none; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.2);">
          <div class="modal-body px-4 pt-4 pb-4">
            <!-- Header con icono -->
            <div class="text-center mb-3">
              <div style="width: 72px; height: 72px; background: #fef2f2; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 12px;">
                <span style="font-size: 36px;">🔒</span>
              </div>
              <h4 class="mb-1" style="color: #001D39; font-weight: 800; font-size: 1.3rem;">Cuenta Bloqueada</h4>
              <p class="text-muted mb-0" style="font-size: 0.9rem;">Has excedido el número de intentos permitidos</p>
            </div>
            <!-- Warning box -->
            <div class="d-flex align-items-start p-3 mb-3" style="background: #fef2f2; border-radius: 12px; border: 1px solid #fca5a5;">
              <span style="font-size: 1.3rem; margin-right: 10px;">⚠️</span>
              <p class="mb-0" style="color: #991b1b; font-size: 0.85rem; line-height: 1.5;">
                <strong>{{ blockedIntentosInfo }} intentos fallidos registrados.</strong><br>
                Tu cuenta ha sido bloqueada temporalmente por <strong>15 minutos</strong>.
              </p>
            </div>

            <!-- Instrucciones -->
            <div class="p-3 mb-3" style="background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
              <p class="mb-2" style="color: #001D39; font-weight: 700; font-size: 0.9rem;">¿Cómo desbloquear tu cuenta?</p>
              <ol class="mb-0 ps-3" style="color: #475569; font-size: 0.85rem; line-height: 1.8;">
                <li>Espera 15 minutos y vuelve a intentar</li>
                <li v-if="selectedRole === 'Docente'">Usa la opción "Recuperar contraseña" por correo</li>
                <li v-else>Usa la opción "Recuperar contraseña" con tu pregunta de seguridad</li>
              </ol>
            </div>

            <!-- Botón Recuperar -->
            <button
              type="button"
              class="btn w-100 text-white mb-2"
              style="background: linear-gradient(135deg, #0A4174, #4E8EA2); border: none; border-radius: 12px; padding: 14px; font-weight: 700; font-size: 1rem; box-shadow: 0 4px 15px rgba(10,65,116,0.3);"
              @click="showBlockedModal = false; showResetModal = true;"
            >
              Recuperar Contraseña
            </button>

            <!-- Botón secundario -->
            <button
              type="button"
              class="btn btn-outline-secondary w-100"
              style="border-radius: 12px; padding: 12px; font-weight: 600; font-size: 0.9rem;"
              @click="showBlockedModal = false"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- Reset Password Modal -->
  <Teleport to="body">
  <div v-if="showResetModal" class="modal-backdrop fade show" @click="closeResetModal"></div>
  <div
    v-if="showResetModal"
    class="modal fade show d-block"
    tabindex="-1"
    role="dialog"
    aria-labelledby="modal-default"
    aria-hidden="true"
    @click.self="closeResetModal"
  >
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content">
        <div class="modal-header border-0 pb-0">
          <div class="w-100 text-center">
            <h4 class="font-weight-bolder mb-1" style="color: #001D39;">Recuperar Contraseña</h4>
            <p class="text-secondary mb-0" style="font-size: 0.9rem;">
              {{ selectedRole === 'Docente' ? 'Recibirás un enlace en tu correo institucional' : 'Responde tu pregunta de seguridad' }}
            </p>
          </div>
          <button
            type="button"
            class="btn-close text-dark d-flex align-items-center justify-content-center position-absolute" style="width: 32px; height: 32px; padding: 0; background: none; top: 16px; right: 16px;"
            @click="closeResetModal"
            aria-label="Close"
          >
            <span aria-hidden="true" style="font-size: 1.8rem; line-height: 1;">&times;</span>
          </button>
        </div>
        <div class="modal-body pt-3">

          <!-- Docente: recuperación por correo -->
          <div v-if="selectedRole === 'Docente'">

            <!-- Vista: formulario de correo -->
            <div v-if="!emailSent">
              <div class="mb-3">
                <label class="form-label" style="color: #001D39; font-weight: 600; font-size: 0.85rem;">Correo Institucional</label>
                <input type="email" class="form-control form-control-lg" placeholder="docente@mattlearn.edu.pe" style="border: 1px solid #BDD8E9; border-radius: 10px;" v-model="recoveryEmail" />
              </div>

              <div class="d-flex align-items-start p-3 mb-4" style="background: #EBF5FB; border-radius: 12px; border-left: 4px solid #0A4174;">
                <span style="font-size: 1.5rem; margin-right: 12px;">📧</span>
                <p class="mb-0" style="color: #0A4174; font-size: 0.85rem;">
                  Te enviaremos un enlace seguro de recuperación válido por 5 minutos.
                </p>
              </div>

              <div v-if="recoveryError" class="alert py-2 px-3 mb-3 text-center" style="background: #fef2f2; border: 1px solid #fca5a5; border-radius: 10px; color: #991b1b; font-size: 0.85rem;">
                {{ recoveryError }}
              </div>

              <button type="button" class="btn btn-modal-accept w-100 mb-3" style="padding: 14px; font-size: 1.05rem;" :disabled="!recoveryEmail || recoveryLoading" @click="handleRecoveryEmail">
                {{ recoveryLoading ? 'Enviando...' : 'Enviar Enlace de Recuperación' }}
              </button>
            </div>

            <!-- Vista: email enviado -->
            <div v-else class="text-center py-2">
              <div style="font-size: 3.5rem; margin-bottom: 1rem;">✉️</div>
              <h4 style="color: #001D39; font-weight: 800; margin-bottom: 0.5rem;">Email enviado</h4>
              <p style="color: #49769F; font-size: 0.95rem; line-height: 1.6;">
                Te enviamos un email con instrucciones para restablecer la contraseña a
                <strong style="color: #001D39;">{{ maskedEmail }}</strong>.
                Si no lo ves en tu bandeja de entrada, revisa la carpeta de correo no deseado.
              </p>
              <p style="color: #6EA2B3; font-size: 0.85rem; margin-top: 1rem;">
                Si ya no tienes acceso a esta cuenta de email,
                <a href="javascript:;" style="color: #0A4174; font-weight: 600; text-decoration: none;">contáctanos</a>.
              </p>
              <button type="button" class="btn btn-modal-accept mt-3" style="padding: 10px 30px;" @click="closeResetModal">
                Entendido
              </button>
            </div>

          </div>

          <!-- Alumno: recuperación por pregunta de seguridad -->
          <div v-else>
            <p class="font-weight-bold mb-3" style="color: #001D39;">Selecciona tu pregunta de seguridad</p>

            <div class="form-check mb-2">
              <input class="form-check-input" type="radio" name="securityQuestion" id="q1" value="mascota" checked>
              <label class="form-check-label" for="q1">¿Cuál es el nombre de tu primera mascota?</label>
            </div>
            <div class="form-check mb-2">
              <input class="form-check-input" type="radio" name="securityQuestion" id="q2" value="comida_favorita">
              <label class="form-check-label" for="q2">¿Cuál es tu comida favorita?</label>
            </div>
            <div class="form-check mb-4">
              <input class="form-check-input" type="radio" name="securityQuestion" id="q3" value="color">
              <label class="form-check-label" for="q3">¿Cuál es tu color favorito?</label>
            </div>

            <div class="mb-3">
              <label class="form-label" style="color: #001D39; font-weight: 600; font-size: 0.85rem;">Respuesta</label>
              <input type="text" class="form-control" placeholder="Ingresa tu respuesta" style="border: 1px solid #BDD8E9; border-radius: 10px;" />
            </div>

            <button type="button" class="btn btn-modal-accept w-100 mb-3">Verificar</button>

            <p class="text-xs text-center text-secondary fst-italic">
              *IMPORTANTE: En caso de olvidar su pregunta y/o respuesta de seguridad comunicarse con la sede para restablecer su contraseña.
            </p>
          </div>

        </div>
      </div>
    </div>
  </div>
  </Teleport>
  <!-- Terms Modal -->
  <Teleport to="body">
  <div v-if="showTermsModal" class="modal-backdrop fade show" @click="showTermsModal = false"></div>
  <div
    v-if="showTermsModal"
    class="modal fade show d-block"
    tabindex="-1"
    role="dialog"
    aria-labelledby="modal-terms"
    aria-hidden="true"
    @click.self="showTermsModal = false"
  >
    <div class="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="modal-terms">Terminos y Condiciones</h5>
          <button
            type="button"
            class="btn-close text-dark d-flex align-items-center justify-content-center" style="width: 32px; height: 32px; padding: 0; background: none;"
            @click="showTermsModal = false"
            aria-label="Close"
          >
            <span aria-hidden="true" style="font-size: 1.8rem; line-height: 1;">&times;</span>
          </button>
        </div>
        <div class="modal-body text-start">
          <p><strong>¡Bienvenido a los términos y condiciones de la Plataforma Virtual MATTMINE!</strong></p>
          <p>
            En esta oportunidad agradecemos el empleo de nuestra Plataforma Virtual MattLearn. Asimismo, hacemos de su conocimiento que el uso de nuestra plataforma Virtual MattLearn implica la aceptación de los TÉRMINOS Y CONDICIONES correspondientes, por lo que recomendamos que los lea detenidamente. En ese sentido, cualquier persona que haga uso de nuestra plataforma Virtual MattLearn declara y reconoce que ha leído y acepta todos y cada uno de los TÉRMINOS Y CONDICIONES descritos a continuación.
          </p>

          <p><strong>1. TÉRMINOS DE USO</strong></p>
          <p>

            La utilización del sitio web (página web de la plataforma virtual MattLearn ), propiedad de (propietario del sitio web o plataforma) (en adelante EL PRESTATARIO), es absolutamente voluntaria y supone la aceptación plena por quien accede al mismo (en adelante EL USUARIO) de todas las Condiciones Generales de Uso vigentes en cada momento que se encuentre en el dominio (denominación del dominio web); por lo cual EL USUARIO deberá leer detenidamente y aceptar sin ningún tipo de reservas la presente declaración de TÉRMINOS Y CONDICIONES antes de realizar cualquier tipo de operación, visionado, utilización, etc., dentro de este sitio web.
          </p>
          <ol type="a">
            <li>EL USUARIO se compromete a utilizar la plataforma de forma responsable y sin la intención de alterar, vulnerar y/o manipular la información contenida de conformidad con la legislación vigente, así como respetar las normas de convivencia, la moral y buenas costumbres generalmente aceptadas.</li>
            <li>EL USUARIO se obliga y compromete a NO utilizar la plataforma con fines o efectos ilícitos, prohibidos por la legislación vigente, lesivos de los derechos e intereses de terceros.</li>
            <li>EL PRESTATARIO se reserva el derecho a retirar el acceso a la plataforma, sin necesidad de previo aviso, a cualquier USUARIO que contravenga lo dispuesto en estas Condiciones Generales de Uso.</li>
            <li>EL PRESTATARIO se reserva el derecho de modificar en cualquier momento los TÉRMINOS Y CONDICIONES, así como cualquier otro requerimiento general o particular, reglamento de uso o aviso que resulte aplicable.</li>
            <li>EL PRESTATARIO, se reserva el derecho a modificar en cualquier momento la presentación, configuración y localización de la plataforma, así como los contenidos y las condiciones requeridas para utilizar la misma.</li>
          </ol>

          <p><strong>2. SOBRE EL CONTENIDO DE LA PLATAFORMA</strong></p>
          <ol type="a">
            <li>EL PRESTATARIO proporciona información clara a LOS USUARIOS sobre los servicios que pone a disposición de los miembros de la Institución Educativa, así como sus respectivas características y datos sobre la propia entidad.</li>
            <li>Al ingresar o durante el uso de (página web de la plataforma virtual MattLearn) podrían mostrarse enlaces a otras páginas, las cuales no son gestionadas por EL PRESTATARIO. Dichos enlaces o hipervínculos provienen de otras fuentes de información, no suponiendo su inclusión, recomendación, invitación o sugerencia de visita un requerimiento por parte de EL PRESTATARIO; por lo tanto, EL PRESTATARIO declina toda responsabilidad que pudiese surgir al acceder a las páginas de terceros. Asimismo, se excluye de cualquier responsabilidad por los daños de cualquier clase causados a EL USUARIO por este motivo.</li>
            <li>EL PRESTATARIO no garantiza la inexistencia de interrupciones o errores en el acceso a la plataforma, aunque desarrollará sus mejores esfuerzos para, en su caso, evitarlos, subsanarlos o actualizarlos. Por consiguiente, EL PRESTATARIO no se responsabiliza de los daños o perjuicios de cualquier tipo producidos en EL USUARIO debido a fallos o desconexiones en las redes de telecomunicaciones que produzcan la suspensión, cancelación o interrupción del servicio de la plataforma durante la prestación del mismo o con carácter previo.</li>
            <li>EL PRESTATARIO se excluye cualquier responsabilidad por los daños y perjuicios de toda naturaleza que puedan deberse a la falta de disponibilidad, continuidad o calidad del funcionamiento de la plataforma y al no cumplimiento de la expectativa de utilidad que los usuarios hubieren podido atribuir a la plataforma.</li>
            <li>El acceso a la plataforma no implica la obligación por parte de EL PRESTATARIO de controlar la ausencia de virus, gusanos o cualquier otro elemento informático dañino, a pesar de las buenas prácticas establecidas por EL PRESTATARIO para el control y mejoramiento de nuestros servidores. Corresponde al Usuario, en todo caso, la disponibilidad de herramientas adecuadas para la detección y desinfección de programas informáticos dañinos.</li>
            <p>Por lo tanto, EL PRESTATARIO no se hace responsable de los posibles errores de seguridad que se puedan producir durante la prestación del servicio de la plataforma, ni de los posibles daños que puedan causarse al sistema informático de EL USUARIO o de terceros (hardware y software), los ficheros o documentos almacenados en el mismo, como consecuencia de la presencia de virus en el ordenador de EL USUARIO utilizado para la conexión a los servicios de la plataforma, de un mal funcionamiento del navegador o del uso de versiones no actualizadas del mismo.</p>
            <li>La Plataforma Virtual constituye un espacio integral diseñado para facilitar la interacción, comunicación y gestión educativa entre la institución, los estudiantes y sus familias. Con el objetivo de brindar un servicio eficiente y transparente, la plataforma pone a disposición de LOS USUARIOS diversos módulos digitales, cada uno con funciones específicas orientadas al acompañamiento del proceso formativo, la gestión administrativa y la participación en la vida escolar.</li>
            <p>Los módulos que tiene la presente plataforma son los siguientes:</p>
            <ul>
                <li>Horario: Permite consultar la programación académica del estudiante, incluyendo horarios de clases, actividades y modificaciones que la institución considere necesarias.</li>
                <li>Informe de progreso (notas): Facilita el acceso a los resultados académicos y reportes de desempeño emitidos oficialmente por la institución.</li>
                <li>Asistencia: Proporciona información actualizada sobre el registro de asistencia y puntualidad del estudiante.</li>
                <li>Acciones Positivas / Incidencias conductuales: Permite visualizar reconocimientos, observaciones o reportes relacionados con el comportamiento del estudiante dentro del entorno escolar.</li>
                <li>Libros: Brinda información sobre los textos escolares y materiales bibliográficos asignados a cada nivel o curso.</li>
                <li>Calendario académico: Ofrece el cronograma oficial de actividades institucionales, evaluaciones, eventos y periodos administrativos.</li>
                <li>Encuestas: Herramienta de participación mediante la cual los usuarios pueden emitir opiniones o responder formularios relacionados con la gestión educativa.</li>
                <li>Documentos: Espacio para la descarga y consulta de documentos oficiales, comunicados, reglamentos y otros archivos relevantes.</li>
                <li>Pagos: Permite visualizar el estado de cuenta, realizar el seguimiento de obligaciones económicas y registrar pagos efectuados a la institución.</li>
                <li>Matrícula: Gestiona el proceso de inscripción anual de los estudiantes, conforme a las disposiciones establecidas por la institución.</li>
                <li>Matrícula Vacacional y/o Talleres: Facilita la inscripción en programas complementarios, actividades extracurriculares o talleres vacacionales.</li>
                <li>Citas: Herramienta destinada a solicitar, agendar y gestionar reuniones con el personal docente, administrativo o directivo.</li>
                <li>Tópico: Registro informativo relacionado con las atenciones de salud escolar y reportes médicos que se generen dentro del ámbito institucional.</li>
                <li>Avisos y mensajes: Canal oficial de comunicación a través del cual la institución emite comunicados, recordatorios, alertas o notificaciones importantes.</li>
            </ul>
            <p>El acceso a cada uno de estos módulos estará disponible conforme a las políticas internas de la institución educativa y podrá ser modificado, ampliado o restringido por EL PRESTATARIO en cualquier momento, sin necesidad de previo aviso. El uso de los servicios implica la aceptación expresa de los presentes Términos y Condiciones y del reglamento interno institucional.</p>
          </ol>

          <p><strong>3. SOBRE LA PROPIEDAD INTELECTUAL E INDUSTRIAL</strong></p>
          <ol type="a">
            <li>EL USUARIO reconoce y acepta que todos los derechos de propiedad intelectual sobre la plataforma virtual MattLearn pertenecen a EL PRESTATARIO; así como todas las marcas, nombres comerciales o signos distintivos de cualquier clase que aparecen en la plataforma son propiedad de EL PRESTATARIO o, en su caso, de terceros que han autorizado su uso.</li>
            <p>Por tanto, los derechos de propiedad intelectual son titularidad de EL PRESTATARIO o de terceros que han autorizado su uso, a quienes corresponde el ejercicio exclusivo de los derechos de explotación de los mismos en cualquier forma y, en especial, los derechos de reproducción, distribución, comunicación pública y transformación, salvo en lo mencionado en el literal b) del apartado anterior referente a enlaces o hipervínculos.</p>
            <li>EL PRESTATARIO es titular de los elementos que integran el diseño gráfico de la plataforma virtual MattLearn, los menús, botones de navegación, el código HTML, los textos, las imágenes, las texturas, los gráficos y cualquier otro contenido de la plataforma u otro material al que tuviera acceso EL USUARIO durante el uso de la misma, sin que esta enumeración tenga carácter limitativo. En cualquier caso, EL PRESTATARIO dispone de la correspondiente autorización para la utilización de dichos elementos.</li>
            <li>EL USUARIO solo está autorizado a visualizar todo el material y contenido de la plataforma virtual MattLearn tal y como se presenta y a descargar copias del material para su uso personal y privado, nunca con propósitos comerciales, siempre que EL USUARIO cumpla con todas las normativas de propiedad intelectual.</li>
            <p>De igual manera, queda prohibido suprimir, eludir o manipular el copyright y demás datos identificativos, así como los dispositivos técnicos de protección o cualquier mecanismo de información que pudiera contener los contenidos.</p>
            <li>La utilización no autorizada de la plataforma, así como la lesión de los derechos de propiedad intelectual o industrial de EL PRESTATARIO o de terceros que han autorizado elementos incluidos en la plataforma, dará lugar a las responsabilidades legalmente establecidas.</li>
          </ol>
          <p>EL PRESTATARIO autoriza el establecimiento de enlaces o hipervínculos hacia otras páginas webs y la suya, siempre que se respeten las siguientes condiciones:</p>
          <ul>
            <li>Que el enlace no se establezca desde una web cuyos contenidos resulten contrarios a la Ley, a la moral y al orden público;</li>
            <li>Que no se ofrezca una imagen de EL PRESTATARIO o de sus servicios que resulte distorsionada, perjudicial o equivocada;</li>
            <li>Que no se cree la impresión de que concurre una inexistente relación o vinculación comercial entre EL PRESTATARIO y los titulares, responsables o anunciantes desde la que se crea el enlace o hipervínculo, cuando este no sea el caso.</li>
          </ul>

          <p><strong>4. SOBRE EL USO DE DATOS PERSONALES</strong></p>
          <p>En cumplimiento de la Ley N° 29733 se informa, a los usuarios de esta plataforma, que los datos personales, propios o de aquellos menores de edad cuya patria potestad y/o tutela ostenta, que han sido proporcionados a EL PRESTATARIO, serán tratados en forma estrictamente confidencial y respetando las medidas de seguridad técnicas y jurídicas aplicables.</p>
          <p>Asimismo, el titular de los datos personales autoriza a EL PRESTATARIO a utilizar sus datos personales y los datos personales de los menores de edad cuya patria potestad y/o tutela ostenta, que hubieran sido proporcionados directamente a EL PRESTATARIO, para el envío de información sobre servicios de EL PRESTATARIO.</p>
          <p>El titular de los datos personales podrá revocar la presente autorización para el tratamiento de sus datos personales en cualquier momento, de conformidad con lo previsto en la Ley. Para ejercer este derecho, o cualquier otro previsto en dichas normas, el titular de los datos personales podrá solicitarlo a EL PRESTATARIO.</p>
          <p>Para más información revisar el contenido de la POLÍTICA DE PROTECCIÓN DE DATOS PERSONALES de la plataforma.</p>
          
          <p><strong>5. CONDICIONES DE USO DEL SERVICIO</strong></p>
          <p>Las condiciones de acceso y uso de la plataforma virtual MattLearn se rigen estrictamente por la legalidad vigente y por el principio de buena fe comprometiéndose EL USUARIO a realizar un buen uso de la web y de los servicios que se ofrecen.</p>
          <p>Quedan prohibidos todos los actos que vulneren la legalidad, los derechos o intereses de terceros, prohibiéndose expresamente:</p>
          <ul>
            <li>Realizar actuaciones que puedan producir en la web o a través de la misma y por cualquier medio algún tipo de daño a los sistemas de EL PRESTATARIO o a terceros.</li>
            <li>Realizar publicidad o información comercial directamente o de forma encubierta o el envío de grandes mensajes con el fin de bloquear los servidores de la red.</li>
          </ul>
          <p>EL PRESTATARIO no puede asumir ninguna responsabilidad derivada del uso incorrecto, inapropiado o ilícito de la información aparecida en las páginas de esta web.</p>
          <p>EL USUARIO debe leer los TÉRMINOS Y CONDICIONES, cada vez que ingrese a la plataforma virtual MattLearn, puesto que estas podrían tener cambios y/o actualizaciones al momento de ingresar a la misma.</p>
          <p>EL PRESTATARIO no se responsabiliza por las acciones o decisiones que EL USUARIO tome o asuma, basado en información de la plataforma, así como por los posibles errores ortográficos que puedan contener los documentos. La información está sometida a posibles cambios periódicos sin previo aviso de su contenido por ampliación, mejora, corrección o actualización.</p>
          <p>Si EL USUARIO no se encuentra de acuerdo con los TÉRMINOS Y CONDICIONES debe abstenerse del uso de la plataforma.</p>

        </div>
        <div class="modal-footer justify-content-center">
            <button type="button" class="btn btn-modal-accept" @click="showTermsModal = false">Aceptar</button>
        </div>
      </div>
    </div>
  </div>
  </Teleport>

  <!-- Privacy Policy Modal -->
  <Teleport to="body">
  <div v-if="showPrivacyModal" class="modal-backdrop fade show" @click="showPrivacyModal = false"></div>
  <div
    v-if="showPrivacyModal"
    class="modal fade show d-block"
    tabindex="-1"
    role="dialog"
    aria-labelledby="modal-privacy"
    aria-hidden="true"
    @click.self="showPrivacyModal = false"
  >
    <div class="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="modal-privacy">Política de Protección de Datos Personales</h5>
          <button
            type="button"
            class="btn-close text-dark d-flex align-items-center justify-content-center" style="width: 32px; height: 32px; padding: 0; background: none;"
            @click="showPrivacyModal = false"
            aria-label="Close"
          >
            <span aria-hidden="true" style="font-size: 1.8rem; line-height: 1;">&times;</span>
          </button>
        </div>
        <div class="modal-body text-start">

          <p><strong>I. Introducción</strong></p>
          <p><strong>1.</strong> La presente Política de Protección de Datos Personales MattLearn describe el tratamiento que nuestra institución (en adelante MattLearn) brinda a los datos personales que recopila de los usuarios en su portal web. Dicha Política se ajusta a las disposiciones contenidas en la Ley de Protección de Datos Personales (Ley N.° 29733), su Reglamento y normas complementarias. Para ello, adoptará las medidas técnicas y organizativas necesarias a fin de evitar la pérdida, mal uso, alteración, acceso no autorizado y robo de los datos personales facilitados por los titulares de datos personales.</p>

          <p><strong>II. Definiciones</strong></p>
          <p><strong>2.</strong> De acuerdo con la Ley N.° 29733 (Ley de Protección de Datos Personales) y su Reglamento aprobado por el Decreto Supremo N.° 003-2013-JUS, se define lo siguiente:</p>
          <ol type="a">
            <li><strong>Datos personales:</strong> toda información sobre una persona natural que la identifica o hace identificable a través de medios que pueden ser razonablemente utilizados.</li>
            <li><strong>Tratamiento de datos personales:</strong> cualquier operación o procedimiento técnico, automatizado o no, que permite la recopilación, registro, organización, almacenamiento, conservación, elaboración, modificación, extracción, consulta, utilización, bloqueo, supresión, comunicación por transferencia o por difusión o cualquier otra forma de procesamiento que facilite el acceso, correlación o interconexión de los datos personales.</li>
          </ol>

          <p><strong>III. Consentimiento del Usuario</strong></p>
          <p><strong>3.</strong> MattLearn se obliga a que los datos personales obtenidos a través de formularios del portal web cuenten previamente con el <strong>consentimiento expreso</strong> del titular para recopilar su información. Estos datos serán tratados única y específicamente para la finalidad solicitada.</p>

          <p><strong>IV. Tratamientos de datos personales</strong></p>
          <p><strong>4.</strong> Los datos personales facilitados por el Usuario se almacenarán en los bancos de datos que forman parte del sistema de información de MattLearn; además, serán tratados para poder llevar a cabo sus finalidades.</p>
          <p><strong>5.</strong> MattLearn no empleará los datos personales del Usuario para ninguna finalidad distinta a la que fueron suministrados, a no ser que se trate de una finalidad expresamente permitida o exigida por la normativa vigente aplicable, por orden judicial o una autoridad competente.</p>
          <p><strong>6.</strong> MattLearn no compartirá ni cederá a terceros algún dato personal del Usuario sin su consentimiento previo y expreso, salvo cuando dicha comunicación sea exigida por la legislación vigente, por orden judicial o por una autoridad competente.</p>
          <p><strong>7.</strong> El portal web de MattLearn puede ofrecer enlaces (links) para acceder a otros portales web que no son parte de aquellos. Es responsabilidad del Usuario revisar las políticas de privacidad en dichos portales web para verificar el nivel de protección de sus datos personales en ese ambiente, lo que es ajeno a la responsabilidad de MattLearn.</p>

          <p><strong>V. Medidas de seguridad</strong></p>
          <p><strong>8.</strong> MattLearn se compromete a brindar todas las medidas técnicas, legales y administrativas necesarias para garantizar la seguridad y confidencialidad de los datos personales del Usuario. Estos serán tratados considerando los principios de legalidad, consentimiento, proporcionalidad, calidad, seguridad y los demás presentes en la normativa vigente referida a protección de datos personales. Para ello, se evitará que sean filtrados, difundidos o sujetos a cualquier acción que ponga en peligro la información personal del Usuario.</p>

          <p><strong>VI. Responsabilidades</strong></p>
          <p><strong>9.</strong> MattLearn asume que los datos personales proporcionados por el Usuario deben ser verdaderos, completos, exactos, vigentes y corresponder a su verdadera identidad. Ante cualquier modificación, el Usuario será responsable de comunicarlo inmediatamente a MattLearn.</p>
          <p><strong>10.</strong> El Usuario asumirá las responsabilidades por los daños y perjuicios, directos o indirectos, que genere a MattLearn y/o terceros por incumplir total o parcialmente lo señalado en el punto anterior.</p>

          <p><strong>VII. Ejercicio de los derechos de Acceso, Rectificación, Cancelación y Oposición (derechos ARCO)</strong></p>
          <p><strong>11.</strong> MattLearn debe garantizar la atención de los derechos protegidos que pueda ejercer el Titular de los Datos Personales. Para ello, debe mantener disponibles canales, procedimientos e información a fin de atender la solicitud del Usuario en los plazos establecidos por las normas de protección de datos personales.</p>
          <p><strong>12.</strong> El Usuario podrá ejercitar sus derechos de Información, Acceso, Rectificación, Cancelación, Revocación, Oposición, etc. (derechos ARCO) al uso de sus datos personales, de conformidad con la Ley de Protección de Datos Personales (Ley N.° 29733). En ese sentido, el Usuario tiene derecho, entre otros, a acceder a su información personal, a solicitar la rectificación de datos inexactos y a revocar su consentimiento para su tratamiento. Asimismo, podrá solicitar la supresión de sus datos u oponerse a su tratamiento, incluso cuando estos ya no resulten necesarios para los fines que motivaron su recopilación.</p>
          <p><strong>13.</strong> El ejercicio de estos derechos es gratuito. Para ello, el Usuario puede dirigirse por correo electrónico a datospersonales@mattlearn.edu.pe, adjuntando una solicitud y copia de su documento de identidad (DNI/CE/Pasaporte) que acredite su titularidad sobre los datos personales respecto de los cuales ejercerá su derecho. También podrá hacerlo en cualquiera de nuestras oficinas ubicadas en el país. Si utiliza un representante legal, este deberá acreditarse como tal.</p>
          <p><strong>14.</strong> La atención de la solicitud será efectuada de acuerdo a los plazos previstos en la normatividad de protección de datos personales.</p>

          <p><strong>VIII. Cambios de Política de Privacidad</strong></p>
          <p><strong>15.</strong> MattLearn se reserva el derecho de modificar y/o actualizar la presente Política de Privacidad con fines de mejora, ya sea para adaptarla a futuros cambios que pueda requerir el marco normativo vigente, brindar una mejor calidad de servicio o comunicar nuevas alternativas relacionadas con la presente Política. Es responsabilidad del Usuario mantenerse informado sobre los cambios que se introduzcan en esta Política de Privacidad publicando en este sitio su versión actualizada o modificada.</p>

        </div>
        <div class="modal-footer justify-content-center">
            <button type="button" class="btn btn-modal-accept" @click="showPrivacyModal = false">Aceptar</button>
        </div>
      </div>
    </div>
  </div>
  </Teleport>
</template>

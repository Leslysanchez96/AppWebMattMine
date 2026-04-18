
<script setup>
import { computed, onMounted } from "vue";
import { useStore } from "vuex";
import Sidenav from "./examples/Sidenav";
import Navbar from "@/examples/Navbars/Navbar.vue";
import AppFooter from "@/examples/Footer.vue";
import { useInactivityTimer } from "@/composables/useInactivityTimer";

const store = useStore();

// Restaurar sesión desde localStorage al recargar la página
onMounted(() => {
  store.dispatch("auth/checkAuth");
});

const isNavFixed = computed(() => store.state.isNavFixed);
const darkMode = computed(() => store.state.darkMode);
const isAbsolute = computed(() => store.state.isAbsolute);
const showSidenav = computed(() => store.state.showSidenav);
const layout = computed(() => store.state.layout);
const showNavbar = computed(() => store.state.showNavbar);
const showFooter = computed(() => store.state.showFooter);


// HU04: Timer de inactividad
const { showWarning, secondsRemaining, continueSession, forceLogout } = useInactivityTimer();


const navClasses = computed(() => {
  return {
    "position-sticky bg-white left-auto top-2 z-index-sticky":
      isNavFixed.value && !darkMode.value,
    "position-sticky bg-default left-auto top-2 z-index-sticky":
      isNavFixed.value && darkMode.value,
    "position-absolute px-4 mx-0 w-100 z-index-2": isAbsolute.value,
    "px-0 mx-4": !isAbsolute.value,
  };
});
</script>
<template>
  <div
    v-show="layout === 'landing'"
    class="landing-bg h-100 bg-gradient-primary position-fixed w-100"
  ></div>

  <sidenav v-if="showSidenav" />

  <main
    class="main-content position-relative max-height-vh-100 h-100 border-radius-lg"
  >

    <navbar :class="[navClasses]" v-if="showNavbar" />

    <router-view />

    <app-footer v-show="showFooter" />

  </main>

  <!-- HU04: Modal de advertencia por inactividad -->
  <div v-if="showWarning" class="inactivity-overlay">
    <div class="inactivity-modal">
      <div class="text-center">
        <div style="font-size: 48px; margin-bottom: 16px;">⏱</div>
        <h4 style="color: #0A4174; font-weight: 700;">Sesión por expirar</h4>
        <p class="text-muted">
          Tu sesión se cerrará automáticamente en
          <strong style="color: #e74c3c;">{{ secondsRemaining }}</strong> segundos
          por inactividad.
        </p>
        <div class="d-flex justify-content-center gap-3 mt-4">
          <button class="btn btn-outline-danger" @click="forceLogout">
            Cerrar sesión
          </button>
          <button class="btn text-white" style="background: linear-gradient(135deg, #0A4174, #4E8EA2);" @click="continueSession">
            Continuar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.inactivity-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.inactivity-modal {
  background: #fff;
  border-radius: 16px;
  padding: 40px;
  max-width: 420px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}
</style>


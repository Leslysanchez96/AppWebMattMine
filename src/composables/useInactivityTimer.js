import { ref, watch, onUnmounted } from "vue";
import store from "@/store";

// HU04: Cierre de Sesión Automático por Inactividad
// 13 min de inactividad → advertencia, 2 min más → logout automático (15 min total)
export function useInactivityTimer() {
  const INACTIVITY_LIMIT = 13 * 60 * 1000; // 13 minutos
  const WARNING_DURATION = 90 * 1000; // 1 minuto y medio de advertencia
  const showWarning = ref(false);
  const secondsRemaining = ref(90);

  let inactivityTimer = null;
  let warningTimer = null;
  let countdownInterval = null;
  let listening = false;

  const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart", "click"];

  function resetTimer() {
    if (showWarning.value) return;
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(showInactivityWarning, INACTIVITY_LIMIT);
  }

  function showInactivityWarning() {
    showWarning.value = true;
    secondsRemaining.value = 90;

    countdownInterval = setInterval(() => {
      secondsRemaining.value--;
      if (secondsRemaining.value <= 0) {
        forceLogout();
      }
    }, 1000);

    warningTimer = setTimeout(forceLogout, WARNING_DURATION);
  }

  function continueSession() {
    showWarning.value = false;
    clearTimeout(warningTimer);
    clearInterval(countdownInterval);
    resetTimer();
  }

  function forceLogout() {
    stopListening();
    showWarning.value = false;
    store.dispatch("auth/logout");
  }

  function startListening() {
    if (listening) return;
    listening = true;
    events.forEach((event) => {
      document.addEventListener(event, resetTimer, { passive: true });
    });
    resetTimer();
  }

  function stopListening() {
    listening = false;
    events.forEach((event) => {
      document.removeEventListener(event, resetTimer);
    });
    clearTimeout(inactivityTimer);
    clearTimeout(warningTimer);
    clearInterval(countdownInterval);
    showWarning.value = false;
  }

  // Reaccionar al cambio de autenticación
  watch(
    () => store.getters["auth/isAuthenticated"],
    (isAuth) => {
      if (isAuth) {
        startListening();
      } else {
        stopListening();
      }
    },
    { immediate: true }
  );

  onUnmounted(() => {
    stopListening();
  });

  return {
    showWarning,
    secondsRemaining,
    continueSession,
    forceLogout,
  };
}

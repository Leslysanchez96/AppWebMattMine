import api from "./api";

export default {
  obtenerAvatar() {
    return api.get("/perfil/avatar");
  },
  subirAvatar(file) {
    const formData = new FormData();
    formData.append("avatar", file);
    return api.put("/perfil/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  obtenerPreferencias() {
    return api.get("/perfil/preferencias");
  },
  actualizarPreferencias(datos) {
    return api.put("/perfil/preferencias", datos);
  },
};

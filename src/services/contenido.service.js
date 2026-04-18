import api from "./api";

export default {
  // Cursos
  listarCursos() {
    return api.get("/cursos");
  },
  obtenerCurso(id) {
    return api.get(`/cursos/${id}`);
  },
  crearCurso(datos) {
    return api.post("/cursos", datos);
  },
  actualizarCurso(id, datos) {
    return api.put(`/cursos/${id}`, datos);
  },
  eliminarCurso(id) {
    return api.delete(`/cursos/${id}`);
  },

  // Temas
  listarTemas(idCurso) {
    const params = idCurso ? { id_curso: idCurso } : {};
    return api.get("/temas", { params });
  },
  obtenerTema(id) {
    return api.get(`/temas/${id}`);
  },
  crearTema(datos) {
    return api.post("/temas", datos);
  },
  actualizarTema(id, datos) {
    return api.put(`/temas/${id}`, datos);
  },
  eliminarTema(id) {
    return api.delete(`/temas/${id}`);
  },

  // Materiales
  listarMateriales(idTema) {
    const params = idTema ? { id_tema: idTema } : {};
    return api.get("/materiales", { params });
  },
  obtenerMaterial(id) {
    return api.get(`/materiales/${id}`);
  },
  crearMaterial(datos) {
    return api.post("/materiales", datos);
  },
  actualizarMaterial(id, datos) {
    return api.put(`/materiales/${id}`, datos);
  },
  eliminarMaterial(id) {
    return api.delete(`/materiales/${id}`);
  },
};

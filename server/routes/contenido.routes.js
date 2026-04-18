const router = require("express").Router();
const { verificarToken } = require("../middlewares/auth.middleware");
const { verificarPermiso } = require("../middlewares/permiso.middleware");
const contenidoCtrl = require("../controllers/contenido.controller");

// ── Cursos ──
router.get("/cursos", verificarToken, verificarPermiso("cursos", "ver"), contenidoCtrl.listarCursos);
router.get("/cursos/:id", verificarToken, verificarPermiso("cursos", "ver"), contenidoCtrl.obtenerCurso);
router.post("/cursos", verificarToken, verificarPermiso("cursos", "crear"), contenidoCtrl.crearCurso);
router.put("/cursos/:id", verificarToken, verificarPermiso("cursos", "editar"), contenidoCtrl.actualizarCurso);
router.delete("/cursos/:id", verificarToken, verificarPermiso("cursos", "eliminar"), contenidoCtrl.eliminarCurso);

// ── Temas ──
router.get("/temas", verificarToken, verificarPermiso("temas", "ver"), contenidoCtrl.listarTemas);
router.get("/temas/:id", verificarToken, verificarPermiso("temas", "ver"), contenidoCtrl.obtenerTema);
router.post("/temas", verificarToken, verificarPermiso("temas", "crear"), contenidoCtrl.crearTema);
router.put("/temas/:id", verificarToken, verificarPermiso("temas", "editar"), contenidoCtrl.actualizarTema);
router.delete("/temas/:id", verificarToken, verificarPermiso("temas", "eliminar"), contenidoCtrl.eliminarTema);

// ── Materiales ──
router.get("/materiales", verificarToken, verificarPermiso("materiales", "ver"), contenidoCtrl.listarMateriales);
router.get("/materiales/:id", verificarToken, verificarPermiso("materiales", "ver"), contenidoCtrl.obtenerMaterial);
router.post("/materiales", verificarToken, verificarPermiso("materiales", "crear"), contenidoCtrl.crearMaterial);
router.put("/materiales/:id", verificarToken, verificarPermiso("materiales", "editar"), contenidoCtrl.actualizarMaterial);
router.delete("/materiales/:id", verificarToken, verificarPermiso("materiales", "eliminar"), contenidoCtrl.eliminarMaterial);

module.exports = router;

const router = require("express").Router();
const { verificarToken } = require("../middlewares/auth.middleware");
const { requiereRol } = require("../middlewares/role.middleware");
const perfilCtrl = require("../controllers/perfil.controller");
const { uploadAvatar } = require("../config/upload");

// Avatar - cualquier usuario autenticado
router.get("/avatar", verificarToken, perfilCtrl.obtenerAvatar);
router.put("/avatar", verificarToken, uploadAvatar.single("avatar"), perfilCtrl.subirAvatar);

// Preferencias - solo estudiantes
router.get("/preferencias", verificarToken, requiereRol("Estudiante"), perfilCtrl.obtenerPreferencias);
router.put("/preferencias", verificarToken, requiereRol("Estudiante"), perfilCtrl.actualizarPreferencias);

module.exports = router;

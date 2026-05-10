const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuario.controller');
const { verificarToken } = require('../middlewares/auth.middleware');
const { verificarPermiso } = require('../middlewares/permiso.middleware');
const { registrarAcceso } = require('../middlewares/audit.middleware');

// Todas las rutas requieren autenticación
router.use(verificarToken);

// GET /api/mi-cuenta — Info del usuario logueado (HU10)
router.get('/mi-cuenta', usuarioController.miCuenta);

// Rutas de gestión de usuarios (HU09, HU05, HU06, HU31)
router.get('/usuarios/estadisticas', verificarPermiso('usuarios', 'ver'), usuarioController.estadisticas);
router.get('/usuarios', verificarPermiso('usuarios', 'ver'), registrarAcceso('Listar usuarios'), usuarioController.listar);
router.get('/usuarios/:id', verificarPermiso('usuarios', 'ver'), usuarioController.obtener);
router.post('/usuarios', verificarPermiso('usuarios', 'crear'), registrarAcceso('Crear usuario'), usuarioController.crear);
router.put('/usuarios/:id', verificarPermiso('usuarios', 'editar'), registrarAcceso('Actualizar usuario'), usuarioController.actualizar);
router.delete('/usuarios/:id', verificarPermiso('usuarios', 'eliminar'), registrarAcceso('Eliminar usuario'), usuarioController.eliminar);
router.put('/usuarios/:id/rol', verificarPermiso('roles', 'editar'), registrarAcceso('Asignar rol'), usuarioController.asignarRol);
router.put('/usuarios/:id/desbloquear', verificarPermiso('usuarios', 'editar'), registrarAcceso('Desbloquear usuario'), usuarioController.desbloquear);

module.exports = router;

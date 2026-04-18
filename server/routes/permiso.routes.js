const router = require('express').Router();
const { verificarToken } = require('../middlewares/auth.middleware');
const { requiereRol } = require('../middlewares/role.middleware');
const permisoController = require('../controllers/permiso.controller');

router.use(verificarToken);

// Cualquier usuario autenticado puede ver sus propios permisos
router.get('/mis-permisos', permisoController.misPermisos);

// Solo Administrador puede gestionar permisos
router.get('/modulos', requiereRol('Administrador'), permisoController.listarModulos);
router.get('/:rol', requiereRol('Administrador'), permisoController.obtenerPermisos);
router.put('/:rol', requiereRol('Administrador'), permisoController.actualizarPermisos);

module.exports = router;

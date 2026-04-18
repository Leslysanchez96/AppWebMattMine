const express = require('express');
const router = express.Router();
const auditoriaController = require('../controllers/auditoria.controller');
const { verificarToken } = require('../middlewares/auth.middleware');
const { verificarPermiso } = require('../middlewares/permiso.middleware');

router.use(verificarToken);

router.get('/estadisticas', verificarPermiso('auditoria', 'ver'), auditoriaController.estadisticas);
router.get('/exportar', verificarPermiso('auditoria', 'ver'), auditoriaController.exportar);
router.get('/', verificarPermiso('auditoria', 'ver'), auditoriaController.listar);

module.exports = router;

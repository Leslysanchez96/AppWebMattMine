const express = require('express');
const router = express.Router();
const controller = require('../controllers/politicaSeguridad.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

// Middleware para verificar que sea Administrador
function soloAdmin(req, res, next) {
    if (req.usuario.rol !== 'Administrador') {
        return res.status(403).json({ error: 'Acceso denegado. Solo administradores.' });
    }
    next();
}

// GET - obtener política actual (cualquier usuario autenticado)
router.get('/', verificarToken, controller.obtener);

// PUT - actualizar política (solo admin)
router.put('/', verificarToken, soloAdmin, controller.actualizar);

module.exports = router;

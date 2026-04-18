const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

// Rutas públicas
router.post('/login', authController.login);
router.post('/recuperar-password', authController.recuperarPassword);
router.get('/verificar-token/:token', authController.verificarTokenRecuperacion);
router.post('/reset-password', authController.resetPassword);
router.get('/preguntas-seguridad/:codigo', authController.obtenerPreguntas);
router.post('/cambiar-password-seguridad', authController.cambiarPasswordSeguridad);

// Rutas protegidas (requieren JWT)
router.post('/cambiar-password', verificarToken, authController.cambiarPassword);

module.exports = router;

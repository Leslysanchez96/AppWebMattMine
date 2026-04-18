const crypto = require('crypto');
const usuarioModel = require('../models/usuario.model');
const recuperacionModel = require('../models/recuperacion.model');
const preguntaSeguridadModel = require('../models/preguntaSeguridad.model');
const passwordService = require('../services/password.service');
const emailService = require('../services/email.service');
const { generarToken } = require('../middlewares/auth.middleware');
const { camposRequeridos } = require('../utils/validators');

// POST /api/auth/login
async function login(req, res) {
    const { codigo, password, rol } = req.body;

    const validacion = camposRequeridos(['codigo', 'password', 'rol'], req.body);
    if (!validacion.valido) {
        return res.status(400).json({ error: validacion.mensaje });
    }

    try {
        const usuario = await usuarioModel.findByCodigo(codigo);

        if (!usuario) {
            return res.status(401).json({ error: 'Código o contraseña incorrectos.' });
        }

        // Verificar estado de la cuenta
        if (usuario.estado === 'Bloqueado') {
            return res.status(403).json({
                error: 'Tu cuenta está bloqueada. Contacta al administrador.',
                bloqueado: true,
            });
        }

        if (usuario.estado === 'Inactivo') {
            return res.status(403).json({ error: 'Tu cuenta está inactiva.' });
        }

        // Validar rol según perfil seleccionado
        if (rol === 'Alumno' && usuario.rol !== 'Estudiante') {
            return res.status(403).json({ error: 'Este código no corresponde a un alumno. Verifica el perfil seleccionado.' });
        }

        if (rol === 'Docente' && usuario.rol !== 'Docente' && usuario.rol !== 'Administrador') {
            return res.status(403).json({ error: 'Este código no corresponde a un docente.' });
        }

        // Verificar password
        const storedPassword = await usuarioModel.getPasswordById(usuario.id_usuario);
        const validPassword = await passwordService.comparePassword(password, storedPassword);

        if (!validPassword) {
            // Obtener max intentos desde política de seguridad (configurable por admin)
            const politica = await passwordService.obtenerPolitica();
            const MAX_INTENTOS = politica.intentos_fallidos_max;

            // Incrementar intentos fallidos (HU03)
            const intentos = await usuarioModel.incrementarIntentos(usuario.id_usuario);

            // Bloquear cuenta si supera el máximo de intentos
            if (intentos >= MAX_INTENTOS) {
                await usuarioModel.bloquearCuenta(usuario.id_usuario);
                return res.status(403).json({
                    error: 'Tu cuenta ha sido bloqueada por múltiples intentos fallidos.',
                    bloqueado: true,
                    intentosFallidos: intentos,
                });
            }

            return res.status(401).json({
                error: 'Código o contraseña incorrectos.',
                intentosRestantes: MAX_INTENTOS - intentos,
            });
        }

        // Login exitoso: resetear intentos y actualizar último acceso
        await usuarioModel.loginExitoso(usuario.id_usuario);

        // Generar JWT
        const token = generarToken(usuario);

        res.json({
            message: 'Login exitoso',
            token,
            usuario: {
                id: usuario.id_usuario,
                codigo: usuario.codigo,
                nombres: usuario.nombres,
                apellido: usuario.apellido,
                rol: usuario.rol,
                avatar: usuario.avatar,
            },
        });
    } catch (err) {
        console.error('Error en login:', err);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
}

// POST /api/auth/recuperar-password
async function recuperarPassword(req, res) {
    const { correo } = req.body;

    if (!correo) {
        return res.status(400).json({ error: 'El correo es requerido.' });
    }

    try {
        const usuario = await usuarioModel.findByCorreo(correo, ['Docente', 'Administrador']);

        if (!usuario) {
            return res.status(404).json({ error: 'No se encontró una cuenta de docente con ese correo.' });
        }

        // Generar token único
        const token = crypto.randomBytes(32).toString('hex');

        // Invalidar tokens anteriores
        await recuperacionModel.invalidarTokensPrevios(usuario.id_usuario);

        // Crear nuevo token
        await recuperacionModel.crearToken(usuario.id_usuario, token);

        // URL de recuperación
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/reset-password?token=${token}`;

        // Enviar correo
        await emailService.enviarCorreoRecuperacion(usuario.correo, usuario.nombres, resetUrl);

        res.json({ message: 'Se ha enviado un enlace de recuperación a tu correo institucional.' });
    } catch (err) {
        console.error('Error en recuperación:', err);
        res.status(500).json({ error: 'Error al enviar el correo. Intenta de nuevo.' });
    }
}

// GET /api/auth/verificar-token/:token
async function verificarTokenRecuperacion(req, res) {
    try {
        const tokenData = await recuperacionModel.verificarToken(req.params.token);

        if (!tokenData) {
            // Verificar estado del token para mensaje específico
            const estado = await recuperacionModel.estadoToken(req.params.token);
            if (!estado) {
                return res.status(400).json({ error: 'El enlace no es válido.' });
            }
            if (estado.usado) {
                return res.status(400).json({ error: 'Este enlace ya fue utilizado.' });
            }
            return res.status(400).json({ error: 'El enlace ha expirado. Solicita uno nuevo.' });
        }

        res.json({ valid: true, nombres: tokenData.nombres });
    } catch (err) {
        console.error('Error verificar token:', err);
        res.status(500).json({ error: 'Error al verificar el token.' });
    }
}

// POST /api/auth/reset-password
async function resetPassword(req, res) {
    const { token, newPassword } = req.body;

    const validacion = camposRequeridos(['token', 'newPassword'], req.body);
    if (!validacion.valido) {
        return res.status(400).json({ error: validacion.mensaje });
    }

    // Validar política de contraseñas (HU33)
    const politica = await passwordService.validarPolitica(newPassword);
    if (!politica.valido) {
        return res.status(400).json({ error: politica.errores.join(' ') });
    }

    try {
        const tokenData = await recuperacionModel.verificarToken(token);

        if (!tokenData) {
            return res.status(400).json({ error: 'El enlace ha expirado o no es válido.' });
        }

        // Hashear y actualizar contraseña
        const hashedPassword = await passwordService.hashPassword(newPassword);
        await usuarioModel.updatePassword(tokenData.id_usuario, hashedPassword);

        // Desbloquear cuenta y resetear intentos fallidos
        await usuarioModel.updateEstado(tokenData.id_usuario, 'Activo');
        await usuarioModel.loginExitoso(tokenData.id_usuario);

        // Marcar token como usado
        await recuperacionModel.marcarTokenUsado(tokenData.id_recuperacion);

        res.json({ message: 'Contraseña actualizada correctamente.' });
    } catch (err) {
        console.error('Error al restablecer:', err);
        res.status(500).json({ error: 'Error al restablecer la contraseña.' });
    }
}

// POST /api/auth/cambiar-password (HU13) — requiere autenticación
async function cambiarPassword(req, res) {
    const { passwordActual, newPassword } = req.body;
    const idUsuario = req.usuario.id;

    const validacion = camposRequeridos(['passwordActual', 'newPassword'], req.body);
    if (!validacion.valido) {
        return res.status(400).json({ error: validacion.mensaje });
    }

    // Validar política de contraseñas (HU33)
    const politica = await passwordService.validarPolitica(newPassword);
    if (!politica.valido) {
        return res.status(400).json({ error: politica.errores.join(' ') });
    }

    try {
        // Verificar contraseña actual
        const storedPassword = await usuarioModel.getPasswordById(idUsuario);
        const validPassword = await passwordService.comparePassword(passwordActual, storedPassword);

        if (!validPassword) {
            return res.status(401).json({ error: 'La contraseña actual es incorrecta.' });
        }

        // Actualizar contraseña
        const hashedPassword = await passwordService.hashPassword(newPassword);
        await usuarioModel.updatePassword(idUsuario, hashedPassword);

        // Desbloquear cuenta y resetear intentos fallidos
        await usuarioModel.updateEstado(idUsuario, 'Activo');
        await usuarioModel.loginExitoso(idUsuario);

        res.json({ message: 'Contraseña actualizada correctamente. Inicia sesión nuevamente.' });
    } catch (err) {
        console.error('Error al cambiar contraseña:', err);
        res.status(500).json({ error: 'Error al cambiar la contraseña.' });
    }
}

// POST /api/auth/cambiar-password-seguridad (HU13 — Estudiantes con preguntas de seguridad)
async function cambiarPasswordSeguridad(req, res) {
    const { codigo, respuestas, newPassword } = req.body;

    if (!codigo || !respuestas || !newPassword) {
        return res.status(400).json({ error: 'Código, respuestas y nueva contraseña son requeridos.' });
    }

    // Validar política de contraseñas (HU33)
    const politica = await passwordService.validarPolitica(newPassword);
    if (!politica.valido) {
        return res.status(400).json({ error: politica.errores.join(' ') });
    }

    try {
        const usuario = await usuarioModel.findByCodigo(codigo);
        if (!usuario || usuario.rol !== 'Estudiante') {
            return res.status(404).json({ error: 'Estudiante no encontrado.' });
        }

        // Verificar preguntas de seguridad
        const preguntas = await preguntaSeguridadModel.obtenerPreguntasPorUsuario(usuario.id_usuario);
        if (preguntas.length === 0) {
            return res.status(400).json({ error: 'No tienes preguntas de seguridad configuradas.' });
        }

        // Validar cada respuesta
        for (const resp of respuestas) {
            const correcta = await preguntaSeguridadModel.verificarRespuesta(
                resp.idUsuarioPregunta,
                resp.respuestaHash
            );
            if (!correcta) {
                return res.status(401).json({ error: 'Las respuestas de seguridad son incorrectas.' });
            }
        }

        // Actualizar contraseña y desbloquear cuenta
        const hashedPassword = await passwordService.hashPassword(newPassword);
        await usuarioModel.updatePassword(usuario.id_usuario, hashedPassword);
        await usuarioModel.updateEstado(usuario.id_usuario, 'Activo');
        await usuarioModel.loginExitoso(usuario.id_usuario);

        res.json({ message: 'Contraseña actualizada correctamente.' });
    } catch (err) {
        console.error('Error al cambiar contraseña por seguridad:', err);
        res.status(500).json({ error: 'Error al cambiar la contraseña.' });
    }
}

// GET /api/auth/preguntas-seguridad/:codigo (obtener preguntas para el estudiante)
async function obtenerPreguntas(req, res) {
    try {
        const usuario = await usuarioModel.findByCodigo(req.params.codigo);
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        const preguntas = await preguntaSeguridadModel.obtenerPreguntasPorUsuario(usuario.id_usuario);
        res.json({ preguntas });
    } catch (err) {
        console.error('Error al obtener preguntas:', err);
        res.status(500).json({ error: 'Error al obtener las preguntas de seguridad.' });
    }
}

module.exports = {
    login,
    recuperarPassword,
    verificarTokenRecuperacion,
    resetPassword,
    cambiarPassword,
    cambiarPasswordSeguridad,
    obtenerPreguntas,
};

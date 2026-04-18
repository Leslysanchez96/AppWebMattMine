const politicaModel = require('../models/politicaSeguridad.model');

// GET /api/politica-seguridad
async function obtener(req, res) {
    try {
        const politica = await politicaModel.obtener();
        if (!politica) {
            return res.status(404).json({ error: 'No se encontró la configuración de seguridad.' });
        }
        res.json(politica);
    } catch (err) {
        console.error('Error al obtener política:', err);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
}

// PUT /api/politica-seguridad
async function actualizar(req, res) {
    const {
        longitud_minima,
        requiere_mayuscula,
        requiere_minuscula,
        requiere_numero,
        requiere_especial,
        vigencia_dias,
        dias_aviso_expiracion,
        intentos_fallidos_max,
    } = req.body;

    // Validaciones
    if (longitud_minima < 4 || longitud_minima > 30) {
        return res.status(400).json({ error: 'La longitud mínima debe estar entre 4 y 30 caracteres.' });
    }
    if (vigencia_dias < 1 || vigencia_dias > 365) {
        return res.status(400).json({ error: 'La vigencia debe estar entre 1 y 365 días.' });
    }
    if (dias_aviso_expiracion < 1 || dias_aviso_expiracion >= vigencia_dias) {
        return res.status(400).json({ error: 'Los días de aviso deben ser menores a la vigencia.' });
    }
    if (intentos_fallidos_max < 1 || intentos_fallidos_max > 10) {
        return res.status(400).json({ error: 'Los intentos fallidos deben estar entre 1 y 10.' });
    }

    try {
        const politica = await politicaModel.actualizar(
            {
                longitud_minima,
                requiere_mayuscula,
                requiere_minuscula,
                requiere_numero,
                requiere_especial,
                vigencia_dias,
                dias_aviso_expiracion,
                intentos_fallidos_max,
            },
            req.usuario.id
        );

        if (!politica) {
            return res.status(404).json({ error: 'No se pudo actualizar la configuración.' });
        }

        res.json({ message: 'Política de seguridad actualizada correctamente.', politica });
    } catch (err) {
        console.error('Error al actualizar política:', err);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
}

module.exports = { obtener, actualizar };

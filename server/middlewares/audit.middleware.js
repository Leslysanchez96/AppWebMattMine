const auditoriaModel = require('../models/auditoria.model');

// Middleware que registra automáticamente cada acceso a rutas protegidas (HU08)
function registrarAcceso(accion) {
    return async (req, res, next) => {
        try {
            if (req.usuario) {
                const ip = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || req.ip;
                await auditoriaModel.registrarAcceso(
                    req.usuario.id,
                    accion || `${req.method} ${req.originalUrl}`,
                    req.originalUrl,
                    req.method,
                    ip,
                    null
                );
            }
        } catch (err) {
            console.error('Error al registrar auditoría:', err.message);
        }
        next();
    };
}

module.exports = {
    registrarAcceso,
};

const permisoModel = require('../models/permiso.model');

// Cache en memoria: Map<"rol:modulo:accion", {result: boolean, timestamp: number}>
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

// Middleware factory: verificar si el rol del usuario tiene permiso
function verificarPermiso(modulo, accion) {
    return async (req, res, next) => {
        if (!req.usuario) {
            return res.status(401).json({ error: 'No autenticado.' });
        }

        const { rol } = req.usuario;
        const cacheKey = `${rol}:${modulo}:${accion}`;
        const cached = cache.get(cacheKey);

        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            return cached.result
                ? next()
                : res.status(403).json({ error: 'No tienes permiso para esta acción.' });
        }

        try {
            const tiene = await permisoModel.verificarPermiso(rol, modulo, accion);
            cache.set(cacheKey, { result: tiene, timestamp: Date.now() });

            if (!tiene) {
                return res.status(403).json({ error: 'No tienes permiso para esta acción.' });
            }
            next();
        } catch (err) {
            console.error('Error verificando permiso:', err);
            res.status(500).json({ error: 'Error al verificar permisos.' });
        }
    };
}

// Limpiar cache (llamar cuando se actualizan permisos)
function invalidarCache() {
    cache.clear();
}

module.exports = { verificarPermiso, invalidarCache };

const permisoModel = require('../models/permiso.model');
const { invalidarCache } = require('../middlewares/permiso.middleware');

const ROLES_VALIDOS = ['Estudiante', 'Docente', 'Administrador'];
const ACCIONES_VALIDAS = ['ver', 'crear', 'editar', 'eliminar'];

// GET /api/permisos/modulos
async function listarModulos(req, res) {
    try {
        const modulos = await permisoModel.getModulos();
        res.json({ modulos });
    } catch (err) {
        console.error('Error al listar módulos:', err);
        res.status(500).json({ error: 'Error al obtener módulos.' });
    }
}

// GET /api/permisos/mis-permisos
async function misPermisos(req, res) {
    try {
        const permisos = await permisoModel.getPermisosPorRol(req.usuario.rol);
        res.json({ permisos });
    } catch (err) {
        console.error('Error al obtener mis permisos:', err);
        res.status(500).json({ error: 'Error al obtener permisos.' });
    }
}

// GET /api/permisos/:rol
async function obtenerPermisos(req, res) {
    const { rol } = req.params;

    if (!ROLES_VALIDOS.includes(rol)) {
        return res.status(400).json({ error: `Rol inválido. Valores permitidos: ${ROLES_VALIDOS.join(', ')}` });
    }

    try {
        const permisos = await permisoModel.getPermisosPorRol(rol);
        res.json({ rol, permisos });
    } catch (err) {
        console.error('Error al obtener permisos:', err);
        res.status(500).json({ error: 'Error al obtener permisos.' });
    }
}

// PUT /api/permisos/:rol
async function actualizarPermisos(req, res) {
    const { rol } = req.params;
    const { modulo, acciones } = req.body;

    if (!ROLES_VALIDOS.includes(rol)) {
        return res.status(400).json({ error: `Rol inválido. Valores permitidos: ${ROLES_VALIDOS.join(', ')}` });
    }

    if (!modulo || !Array.isArray(acciones)) {
        return res.status(400).json({ error: 'Se requiere "modulo" (string) y "acciones" (array).' });
    }

    // Validar que todas las acciones sean válidas
    const accionesInvalidas = acciones.filter(a => !ACCIONES_VALIDAS.includes(a));
    if (accionesInvalidas.length > 0) {
        return res.status(400).json({ error: `Acciones inválidas: ${accionesInvalidas.join(', ')}` });
    }

    try {
        await permisoModel.actualizarPermisos(rol, modulo, acciones);
        invalidarCache();

        const permisosActualizados = await permisoModel.getPermisosPorRol(rol);
        res.json({
            message: `Permisos de "${modulo}" actualizados para el rol ${rol}.`,
            permisos: permisosActualizados,
        });
    } catch (err) {
        console.error('Error al actualizar permisos:', err);
        res.status(500).json({ error: err.message || 'Error al actualizar permisos.' });
    }
}

module.exports = {
    listarModulos,
    misPermisos,
    obtenerPermisos,
    actualizarPermisos,
};

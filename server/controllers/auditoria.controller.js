const auditoriaModel = require('../models/auditoria.model');

// GET /api/auditoria — Listar registros de auditoría (HU08)
async function listar(req, res) {
    try {
        const { idUsuario, accion, fechaDesde, fechaHasta, page, limit } = req.query;
        const resultado = await auditoriaModel.obtenerRegistros({
            idUsuario: idUsuario ? parseInt(idUsuario) : null,
            accion,
            fechaDesde,
            fechaHasta,
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 20,
        });
        res.json(resultado);
    } catch (err) {
        console.error('Error al listar auditoría:', err);
        res.status(500).json({ error: 'Error al obtener los registros de auditoría.' });
    }
}

// GET /api/auditoria/exportar — Exportar registros en CSV (HU08)
async function exportar(req, res) {
    try {
        const { idUsuario, accion, fechaDesde, fechaHasta, formato } = req.query;
        const registros = await auditoriaModel.obtenerParaExportar({
            idUsuario: idUsuario ? parseInt(idUsuario) : null,
            accion,
            fechaDesde,
            fechaHasta,
        });

        if (formato === 'csv') {
            // Generar CSV
            const headers = 'Código,Nombres,Apellido,Rol,Acción,Ruta,Método,IP,Detalles,Fecha\n';
            const rows = registros.map(r =>
                `"${r.codigo}","${r.nombres}","${r.apellido}","${r.rol}","${r.accion}","${r.ruta || ''}","${r.metodo || ''}","${r.ip || ''}","${r.detalles || ''}","${r.fecha}"`
            ).join('\n');

            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', 'attachment; filename=auditoria.csv');
            return res.send('\uFEFF' + headers + rows); // BOM para Excel
        }

        // Default: JSON
        res.json(registros);
    } catch (err) {
        console.error('Error al exportar auditoría:', err);
        res.status(500).json({ error: 'Error al exportar los registros.' });
    }
}

// GET /api/auditoria/estadisticas
async function estadisticas(req, res) {
    try {
        const stats = await auditoriaModel.obtenerEstadisticas();
        res.json(stats);
    } catch (err) {
        console.error('Error al obtener estadísticas de auditoría:', err);
        res.status(500).json({ error: 'Error al obtener estadísticas.' });
    }
}

// GET /api/auditoria/acciones-recientes
async function accionesRecientes(req, res) {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const datos = await auditoriaModel.obtenerAccionesRecientes({ limit });
        res.json(datos);
    } catch (err) {
        console.error('Error al obtener acciones recientes:', err);
        res.status(500).json({ error: 'Error al obtener acciones recientes.' });
    }
}

// GET /api/auditoria/ultimos-accesos
async function ultimosAccesos(req, res) {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const datos = await auditoriaModel.obtenerUltimosAccesos({ limit });
        res.json(datos);
    } catch (err) {
        console.error('Error al obtener últimos accesos:', err);
        res.status(500).json({ error: 'Error al obtener últimos accesos.' });
    }
}

// GET /api/auditoria/intentos-fallidos
async function intentosFallidos(req, res) {
    try {
        const datos = await auditoriaModel.obtenerIntentosFallidos();
        res.json(datos);
    } catch (err) {
        console.error('Error al obtener intentos fallidos:', err);
        res.status(500).json({ error: 'Error al obtener intentos fallidos.' });
    }
}

module.exports = {
    listar,
    exportar,
    estadisticas,
    accionesRecientes,
    intentosFallidos,
    ultimosAccesos,
};

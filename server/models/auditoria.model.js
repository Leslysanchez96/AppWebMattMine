const db = require('../db');

// Registrar acceso (HU08)
async function registrarAcceso(idUsuario, accion, ruta, metodo, ip, detalles) {
    await db.query(
        `INSERT INTO auditoria_acceso (id_usuario, accion, ruta, metodo, ip, detalles)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [idUsuario, accion, ruta, metodo, ip, detalles]
    );
}

// Obtener registros con filtros y paginación
async function obtenerRegistros({ idUsuario, accion, fechaDesde, fechaHasta, page = 1, limit = 20 }) {
    let query = `SELECT a.id_auditoria, a.id_usuario, u.nombres, u.apellido, u.codigo, u.rol,
                        a.accion, a.ruta, a.metodo, a.ip, a.detalles, a.fecha
                 FROM auditoria_acceso a
                 JOIN usuario u ON a.id_usuario = u.id_usuario
                 WHERE 1=1`;
    const params = [];
    let paramIndex = 1;

    if (idUsuario) {
        query += ` AND a.id_usuario = $${paramIndex++}`;
        params.push(idUsuario);
    }
    if (accion) {
        query += ` AND a.accion ILIKE $${paramIndex++}`;
        params.push(`%${accion}%`);
    }
    if (fechaDesde) {
        query += ` AND a.fecha >= $${paramIndex++}`;
        params.push(fechaDesde);
    }
    if (fechaHasta) {
        query += ` AND a.fecha <= $${paramIndex++}`;
        params.push(fechaHasta);
    }

    // Contar total
    const countQuery = query.replace(/SELECT .+ FROM/, 'SELECT COUNT(*) FROM');
    const countResult = await db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Paginación
    const offset = (page - 1) * limit;
    query += ` ORDER BY a.fecha DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    return {
        registros: result.rows,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit),
    };
}

// Obtener todos los registros para exportar (sin paginación)
async function obtenerParaExportar({ idUsuario, accion, fechaDesde, fechaHasta }) {
    let query = `SELECT u.codigo, u.nombres, u.apellido, u.rol,
                        a.accion, a.ruta, a.metodo, a.ip, a.detalles, a.fecha
                 FROM auditoria_acceso a
                 JOIN usuario u ON a.id_usuario = u.id_usuario
                 WHERE 1=1`;
    const params = [];
    let paramIndex = 1;

    if (idUsuario) {
        query += ` AND a.id_usuario = $${paramIndex++}`;
        params.push(idUsuario);
    }
    if (accion) {
        query += ` AND a.accion ILIKE $${paramIndex++}`;
        params.push(`%${accion}%`);
    }
    if (fechaDesde) {
        query += ` AND a.fecha >= $${paramIndex++}`;
        params.push(fechaDesde);
    }
    if (fechaHasta) {
        query += ` AND a.fecha <= $${paramIndex++}`;
        params.push(fechaHasta);
    }

    query += ' ORDER BY a.fecha DESC';
    const result = await db.query(query, params);
    return result.rows;
}

// Estadísticas para el dashboard de auditoría
async function obtenerEstadisticas() {
    // Accesos hoy
    const accesosHoy = await db.query(
        `SELECT COUNT(*) FROM auditoria_acceso WHERE fecha::date = CURRENT_DATE`
    );

    // Usuarios activos (con acceso en las últimas 24h)
    const usuariosActivos = await db.query(
        `SELECT COUNT(DISTINCT id_usuario) FROM auditoria_acceso WHERE fecha >= NOW() - INTERVAL '24 hours'`
    );

    // Cuentas bloqueadas
    const cuentasBloqueadas = await db.query(
        `SELECT COUNT(*) FROM usuario WHERE estado = 'Bloqueado'`
    );

    // Accesos por rol (hoy)
    const accesosPorRol = await db.query(
        `SELECT u.rol, COUNT(*) as cantidad
         FROM auditoria_acceso a
         JOIN usuario u ON a.id_usuario = u.id_usuario
         WHERE a.fecha::date = CURRENT_DATE
         GROUP BY u.rol
         ORDER BY cantidad DESC`
    );

    // Accesos por hora (hoy)
    const accesosPorHora = await db.query(
        `SELECT EXTRACT(HOUR FROM fecha) as hora, COUNT(*) as cantidad
         FROM auditoria_acceso
         WHERE fecha::date = CURRENT_DATE
         GROUP BY hora
         ORDER BY hora`
    );

    // Resumen últimos 7 días
    const resumenSemanal = await db.query(
        `SELECT fecha::date as dia, COUNT(*) as total
         FROM auditoria_acceso
         WHERE fecha >= CURRENT_DATE - INTERVAL '6 days'
         GROUP BY dia
         ORDER BY dia`
    );

    return {
        accesosHoy: parseInt(accesosHoy.rows[0].count),
        usuariosActivos: parseInt(usuariosActivos.rows[0].count),
        cuentasBloqueadas: parseInt(cuentasBloqueadas.rows[0].count),
        accesosPorRol: accesosPorRol.rows,
        accesosPorHora: accesosPorHora.rows,
        resumenSemanal: resumenSemanal.rows,
    };
}

module.exports = {
    registrarAcceso,
    obtenerRegistros,
    obtenerParaExportar,
    obtenerEstadisticas,
};

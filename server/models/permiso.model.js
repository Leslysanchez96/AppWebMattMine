const db = require('../db');

// Listar todos los módulos
async function getModulos() {
    const result = await db.query('SELECT * FROM modulo ORDER BY id_modulo');
    return result.rows;
}

// Obtener permisos agrupados por módulo para un rol
async function getPermisosPorRol(rol) {
    const result = await db.query(
        `SELECT m.nombre AS modulo, m.descripcion,
                COALESCE(array_agg(rp.accion ORDER BY rp.accion) FILTER (WHERE rp.accion IS NOT NULL), '{}') AS acciones
         FROM modulo m
         LEFT JOIN rol_permiso rp ON m.id_modulo = rp.id_modulo AND rp.rol = $1
         GROUP BY m.id_modulo, m.nombre, m.descripcion
         ORDER BY m.id_modulo`,
        [rol]
    );
    return result.rows;
}

// Obtener acciones permitidas para un rol en un módulo específico
async function getPermisosPorModulo(rol, modulo) {
    const result = await db.query(
        `SELECT rp.accion FROM rol_permiso rp
         JOIN modulo m ON rp.id_modulo = m.id_modulo
         WHERE rp.rol = $1 AND m.nombre = $2
         ORDER BY rp.accion`,
        [rol, modulo]
    );
    return result.rows.map(r => r.accion);
}

// Actualizar permisos de un rol para un módulo (reemplaza todos)
async function actualizarPermisos(rol, modulo, acciones) {
    const client = await db.getClient();
    try {
        await client.query('BEGIN');

        // Obtener id_modulo
        const modRes = await client.query('SELECT id_modulo FROM modulo WHERE nombre = $1', [modulo]);
        if (modRes.rows.length === 0) throw new Error(`Módulo "${modulo}" no encontrado.`);
        const idModulo = modRes.rows[0].id_modulo;

        // Eliminar permisos existentes para este rol+módulo
        await client.query(
            'DELETE FROM rol_permiso WHERE rol = $1 AND id_modulo = $2',
            [rol, idModulo]
        );

        // Insertar nuevos permisos
        for (const accion of acciones) {
            await client.query(
                'INSERT INTO rol_permiso (rol, id_modulo, accion) VALUES ($1, $2, $3)',
                [rol, idModulo, accion]
            );
        }

        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

// Verificar si un rol tiene permiso específico (para middleware)
async function verificarPermiso(rol, modulo, accion) {
    const result = await db.query(
        `SELECT 1 FROM rol_permiso rp
         JOIN modulo m ON rp.id_modulo = m.id_modulo
         WHERE rp.rol = $1 AND m.nombre = $2 AND rp.accion = $3
         LIMIT 1`,
        [rol, modulo, accion]
    );
    return result.rows.length > 0;
}

module.exports = {
    getModulos,
    getPermisosPorRol,
    getPermisosPorModulo,
    actualizarPermisos,
    verificarPermiso,
};

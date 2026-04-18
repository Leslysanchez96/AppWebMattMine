const db = require('../db');

// Obtener la política de seguridad actual (singleton)
async function obtener() {
    const result = await db.query('SELECT * FROM politica_seguridad ORDER BY id LIMIT 1');
    return result.rows[0] || null;
}

// Actualizar la política de seguridad
async function actualizar(datos, idUsuario) {
    const result = await db.query(
        `UPDATE politica_seguridad SET
            longitud_minima = $1,
            requiere_mayuscula = $2,
            requiere_minuscula = $3,
            requiere_numero = $4,
            requiere_especial = $5,
            vigencia_dias = $6,
            dias_aviso_expiracion = $7,
            intentos_fallidos_max = $8,
            actualizado_por = $9,
            fecha_actualizacion = CURRENT_TIMESTAMP
         WHERE id = (SELECT id FROM politica_seguridad ORDER BY id LIMIT 1)
         RETURNING *`,
        [
            datos.longitud_minima,
            datos.requiere_mayuscula,
            datos.requiere_minuscula,
            datos.requiere_numero,
            datos.requiere_especial,
            datos.vigencia_dias,
            datos.dias_aviso_expiracion,
            datos.intentos_fallidos_max,
            idUsuario,
        ]
    );
    return result.rows[0] || null;
}

module.exports = { obtener, actualizar };

const db = require('../db');

// Invalidar tokens anteriores del usuario
async function invalidarTokensPrevios(idUsuario) {
    await db.query(
        'UPDATE recuperar_password SET usado = TRUE WHERE id_usuario = $1 AND usado = FALSE',
        [idUsuario]
    );
}

// Crear token de recuperación (expira en 5 minutos)
async function crearToken(idUsuario, token) {
    await db.query(
        "INSERT INTO recuperar_password (id_usuario, token, fecha_expiracion) VALUES ($1, $2, NOW() + INTERVAL '5 minutes')",
        [idUsuario, token]
    );
}

// Verificar token (válido, no usado, no expirado)
async function verificarToken(token) {
    const result = await db.query(
        `SELECT rp.id_recuperacion, rp.id_usuario, u.nombres
         FROM recuperar_password rp
         JOIN usuario u ON rp.id_usuario = u.id_usuario
         WHERE rp.token = $1 AND rp.usado = FALSE AND rp.fecha_expiracion > NOW()`,
        [token]
    );
    return result.rows[0] || null;
}

// Verificar estado del token (para mensajes de error específicos)
async function estadoToken(token) {
    const result = await db.query(
        'SELECT usado, fecha_expiracion FROM recuperar_password WHERE token = $1',
        [token]
    );
    return result.rows[0] || null;
}

// Marcar token como usado
async function marcarTokenUsado(idRecuperacion) {
    await db.query(
        'UPDATE recuperar_password SET usado = TRUE WHERE id_recuperacion = $1',
        [idRecuperacion]
    );
}

module.exports = {
    invalidarTokensPrevios,
    crearToken,
    verificarToken,
    estadoToken,
    marcarTokenUsado,
};

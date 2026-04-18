const db = require('../db');

// Obtener preguntas de seguridad asignadas a un usuario
async function obtenerPreguntasPorUsuario(idUsuario) {
    const result = await db.query(
        `SELECT up.id_usuario_pregunta, ps.id_pregunta, ps.pregunta
         FROM usuario_pregunta up
         JOIN pregunta_seguridad ps ON up.id_pregunta = ps.id_pregunta
         WHERE up.id_usuario = $1`,
        [idUsuario]
    );
    return result.rows;
}

// Verificar respuesta de seguridad
async function verificarRespuesta(idUsuarioPregunta, respuestaHash) {
    const result = await db.query(
        'SELECT respuesta_hash FROM usuario_pregunta WHERE id_usuario_pregunta = $1',
        [idUsuarioPregunta]
    );
    if (result.rows.length === 0) return false;
    return result.rows[0].respuesta_hash === respuestaHash;
}

module.exports = {
    obtenerPreguntasPorUsuario,
    verificarRespuesta,
};

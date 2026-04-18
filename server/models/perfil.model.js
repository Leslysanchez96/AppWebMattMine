const db = require("../db");

// ── Avatar ──
const getAvatar = async (idUsuario) => {
  const result = await db.query(
    "SELECT avatar FROM usuario WHERE id_usuario = $1",
    [idUsuario]
  );
  return result.rows[0];
};

const updateAvatar = async (idUsuario, avatarPath) => {
  const result = await db.query(
    "UPDATE usuario SET avatar = $1 WHERE id_usuario = $2 RETURNING id_usuario, avatar",
    [avatarPath, idUsuario]
  );
  return result.rows[0];
};

// ── Preferencias del Estudiante ──
const getEstudianteByUsuario = async (idUsuario) => {
  const result = await db.query(
    "SELECT id_estudiante FROM estudiante WHERE id_usuario = $1",
    [idUsuario]
  );
  return result.rows[0];
};

const getPreferencias = async (idEstudiante) => {
  const result = await db.query(
    "SELECT * FROM preferencia_estudiante WHERE id_estudiante = $1",
    [idEstudiante]
  );
  return result.rows[0];
};

const upsertPreferencias = async (idEstudiante, datos) => {
  const { deporte, hobby, color, mascota, comida_favorita, artista, interes_adicional } = datos;
  const result = await db.query(
    `INSERT INTO preferencia_estudiante
      (id_estudiante, deporte, hobby, color, mascota, comida_favorita, artista, interes_adicional)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (id_estudiante) DO UPDATE SET
      deporte = EXCLUDED.deporte,
      hobby = EXCLUDED.hobby,
      color = EXCLUDED.color,
      mascota = EXCLUDED.mascota,
      comida_favorita = EXCLUDED.comida_favorita,
      artista = EXCLUDED.artista,
      interes_adicional = EXCLUDED.interes_adicional
     RETURNING *`,
    [idEstudiante, deporte, hobby, color, mascota, comida_favorita, artista, interes_adicional]
  );
  return result.rows[0];
};

module.exports = {
  getAvatar,
  updateAvatar,
  getEstudianteByUsuario,
  getPreferencias,
  upsertPreferencias,
};

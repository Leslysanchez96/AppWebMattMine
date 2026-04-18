const db = require("../db");

// ══════════════ CURSOS ══════════════

const getCursos = async () => {
  const result = await db.query("SELECT * FROM cursos ORDER BY orden, id_curso");
  return result.rows;
};

const getCursoById = async (id) => {
  const result = await db.query("SELECT * FROM cursos WHERE id_curso = $1", [id]);
  return result.rows[0];
};

const createCurso = async ({ nombre, descripcion, orden }) => {
  const result = await db.query(
    "INSERT INTO cursos (nombre, descripcion, orden) VALUES ($1, $2, $3) RETURNING *",
    [nombre, descripcion, orden || 0]
  );
  return result.rows[0];
};

const updateCurso = async (id, { nombre, descripcion, orden }) => {
  const result = await db.query(
    "UPDATE cursos SET nombre = $1, descripcion = $2, orden = $3 WHERE id_curso = $4 RETURNING *",
    [nombre, descripcion, orden, id]
  );
  return result.rows[0];
};

const deleteCurso = async (id) => {
  const result = await db.query(
    "DELETE FROM cursos WHERE id_curso = $1 RETURNING *",
    [id]
  );
  return result.rows[0];
};

// ══════════════ TEMAS ══════════════

const getTemas = async (idCurso) => {
  let query = "SELECT t.*, c.nombre AS curso_nombre FROM temas t JOIN cursos c ON c.id_curso = t.id_curso";
  const params = [];
  if (idCurso) {
    query += " WHERE t.id_curso = $1";
    params.push(idCurso);
  }
  query += " ORDER BY t.orden, t.id_tema";
  const result = await db.query(query, params);
  return result.rows;
};

const getTemaById = async (id) => {
  const result = await db.query(
    "SELECT t.*, c.nombre AS curso_nombre FROM temas t JOIN cursos c ON c.id_curso = t.id_curso WHERE t.id_tema = $1",
    [id]
  );
  return result.rows[0];
};

const createTema = async ({ id_curso, nombre_tema, descripcion, orden }) => {
  const result = await db.query(
    "INSERT INTO temas (id_curso, nombre_tema, descripcion, orden) VALUES ($1, $2, $3, $4) RETURNING *",
    [id_curso, nombre_tema, descripcion, orden || 0]
  );
  return result.rows[0];
};

const updateTema = async (id, { id_curso, nombre_tema, descripcion, orden }) => {
  const result = await db.query(
    "UPDATE temas SET id_curso = $1, nombre_tema = $2, descripcion = $3, orden = $4 WHERE id_tema = $5 RETURNING *",
    [id_curso, nombre_tema, descripcion, orden, id]
  );
  return result.rows[0];
};

const deleteTema = async (id) => {
  const result = await db.query(
    "DELETE FROM temas WHERE id_tema = $1 RETURNING *",
    [id]
  );
  return result.rows[0];
};

// ══════════════ MATERIALES ══════════════

const getMateriales = async (idTema) => {
  let query = `SELECT m.*, t.nombre_tema, c.nombre AS curso_nombre
    FROM material m
    JOIN temas t ON t.id_tema = m.id_tema
    JOIN cursos c ON c.id_curso = t.id_curso`;
  const params = [];
  if (idTema) {
    query += " WHERE m.id_tema = $1";
    params.push(idTema);
  }
  query += " ORDER BY m.id_material DESC";
  const result = await db.query(query, params);
  return result.rows;
};

const getMaterialById = async (id) => {
  const result = await db.query(
    `SELECT m.*, t.nombre_tema, c.nombre AS curso_nombre
     FROM material m
     JOIN temas t ON t.id_tema = m.id_tema
     JOIN cursos c ON c.id_curso = t.id_curso
     WHERE m.id_material = $1`,
    [id]
  );
  return result.rows[0];
};

const getDocenteByUsuario = async (idUsuario) => {
  const result = await db.query(
    "SELECT id_docente FROM docente WHERE id_usuario = $1",
    [idUsuario]
  );
  return result.rows[0];
};

const createMaterial = async ({ id_tema, id_docente, titulo, tipo, url, descripcion }) => {
  const result = await db.query(
    `INSERT INTO material (id_tema, id_docente, titulo, tipo, url, descripcion)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [id_tema, id_docente, titulo, tipo, url, descripcion]
  );
  return result.rows[0];
};

const updateMaterial = async (id, { id_tema, titulo, tipo, url, descripcion, activo }) => {
  const result = await db.query(
    `UPDATE material SET id_tema = $1, titulo = $2, tipo = $3, url = $4, descripcion = $5, activo = $6
     WHERE id_material = $7 RETURNING *`,
    [id_tema, titulo, tipo, url, descripcion, activo, id]
  );
  return result.rows[0];
};

const deleteMaterial = async (id) => {
  const result = await db.query(
    "DELETE FROM material WHERE id_material = $1 RETURNING *",
    [id]
  );
  return result.rows[0];
};

module.exports = {
  getCursos, getCursoById, createCurso, updateCurso, deleteCurso,
  getTemas, getTemaById, createTema, updateTema, deleteTema,
  getMateriales, getMaterialById, getDocenteByUsuario, createMaterial, updateMaterial, deleteMaterial,
};

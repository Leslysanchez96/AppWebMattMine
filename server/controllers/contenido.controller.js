const contenidoModel = require("../models/contenido.model");

// ══════════════ CURSOS ══════════════

const listarCursos = async (req, res) => {
  try {
    const cursos = await contenidoModel.getCursos();
    res.json(cursos);
  } catch (error) {
    console.error("Error al listar cursos:", error);
    res.status(500).json({ error: "Error al listar cursos" });
  }
};

const obtenerCurso = async (req, res) => {
  try {
    const curso = await contenidoModel.getCursoById(req.params.id);
    if (!curso) return res.status(404).json({ error: "Curso no encontrado" });
    res.json(curso);
  } catch (error) {
    console.error("Error al obtener curso:", error);
    res.status(500).json({ error: "Error al obtener curso" });
  }
};

const crearCurso = async (req, res) => {
  try {
    const { nombre } = req.body;
    if (!nombre) return res.status(400).json({ error: "El nombre es requerido" });
    const curso = await contenidoModel.createCurso(req.body);
    res.status(201).json({ mensaje: "Curso creado", curso });
  } catch (error) {
    console.error("Error al crear curso:", error);
    res.status(500).json({ error: "Error al crear curso" });
  }
};

const actualizarCurso = async (req, res) => {
  try {
    const { nombre } = req.body;
    if (!nombre) return res.status(400).json({ error: "El nombre es requerido" });
    const curso = await contenidoModel.updateCurso(req.params.id, req.body);
    if (!curso) return res.status(404).json({ error: "Curso no encontrado" });
    res.json({ mensaje: "Curso actualizado", curso });
  } catch (error) {
    console.error("Error al actualizar curso:", error);
    res.status(500).json({ error: "Error al actualizar curso" });
  }
};

const eliminarCurso = async (req, res) => {
  try {
    const curso = await contenidoModel.deleteCurso(req.params.id);
    if (!curso) return res.status(404).json({ error: "Curso no encontrado" });
    res.json({ mensaje: "Curso eliminado" });
  } catch (error) {
    console.error("Error al eliminar curso:", error);
    if (error.code === "23503") {
      return res.status(409).json({ error: "No se puede eliminar, tiene temas asociados" });
    }
    res.status(500).json({ error: "Error al eliminar curso" });
  }
};

// ══════════════ TEMAS ══════════════

const listarTemas = async (req, res) => {
  try {
    const temas = await contenidoModel.getTemas(req.query.id_curso);
    res.json(temas);
  } catch (error) {
    console.error("Error al listar temas:", error);
    res.status(500).json({ error: "Error al listar temas" });
  }
};

const obtenerTema = async (req, res) => {
  try {
    const tema = await contenidoModel.getTemaById(req.params.id);
    if (!tema) return res.status(404).json({ error: "Tema no encontrado" });
    res.json(tema);
  } catch (error) {
    console.error("Error al obtener tema:", error);
    res.status(500).json({ error: "Error al obtener tema" });
  }
};

const crearTema = async (req, res) => {
  try {
    const { id_curso, nombre_tema } = req.body;
    if (!id_curso || !nombre_tema) {
      return res.status(400).json({ error: "id_curso y nombre_tema son requeridos" });
    }
    const tema = await contenidoModel.createTema(req.body);
    res.status(201).json({ mensaje: "Tema creado", tema });
  } catch (error) {
    console.error("Error al crear tema:", error);
    res.status(500).json({ error: "Error al crear tema" });
  }
};

const actualizarTema = async (req, res) => {
  try {
    const { id_curso, nombre_tema } = req.body;
    if (!id_curso || !nombre_tema) {
      return res.status(400).json({ error: "id_curso y nombre_tema son requeridos" });
    }
    const tema = await contenidoModel.updateTema(req.params.id, req.body);
    if (!tema) return res.status(404).json({ error: "Tema no encontrado" });
    res.json({ mensaje: "Tema actualizado", tema });
  } catch (error) {
    console.error("Error al actualizar tema:", error);
    res.status(500).json({ error: "Error al actualizar tema" });
  }
};

const eliminarTema = async (req, res) => {
  try {
    const tema = await contenidoModel.deleteTema(req.params.id);
    if (!tema) return res.status(404).json({ error: "Tema no encontrado" });
    res.json({ mensaje: "Tema eliminado" });
  } catch (error) {
    console.error("Error al eliminar tema:", error);
    if (error.code === "23503") {
      return res.status(409).json({ error: "No se puede eliminar, tiene materiales asociados" });
    }
    res.status(500).json({ error: "Error al eliminar tema" });
  }
};

// ══════════════ MATERIALES ══════════════

const listarMateriales = async (req, res) => {
  try {
    const materiales = await contenidoModel.getMateriales(req.query.id_tema);
    res.json(materiales);
  } catch (error) {
    console.error("Error al listar materiales:", error);
    res.status(500).json({ error: "Error al listar materiales" });
  }
};

const obtenerMaterial = async (req, res) => {
  try {
    const material = await contenidoModel.getMaterialById(req.params.id);
    if (!material) return res.status(404).json({ error: "Material no encontrado" });
    res.json(material);
  } catch (error) {
    console.error("Error al obtener material:", error);
    res.status(500).json({ error: "Error al obtener material" });
  }
};

const crearMaterial = async (req, res) => {
  try {
    const { id_tema, titulo } = req.body;
    if (!id_tema || !titulo) {
      return res.status(400).json({ error: "id_tema y titulo son requeridos" });
    }
    const docente = await contenidoModel.getDocenteByUsuario(req.usuario.id);
    if (!docente) {
      return res.status(403).json({ error: "No se encontró el registro de docente" });
    }
    const material = await contenidoModel.createMaterial({
      ...req.body,
      id_docente: docente.id_docente,
    });
    res.status(201).json({ mensaje: "Material creado", material });
  } catch (error) {
    console.error("Error al crear material:", error);
    res.status(500).json({ error: "Error al crear material" });
  }
};

const actualizarMaterial = async (req, res) => {
  try {
    const { id_tema, titulo } = req.body;
    if (!id_tema || !titulo) {
      return res.status(400).json({ error: "id_tema y titulo son requeridos" });
    }
    const material = await contenidoModel.updateMaterial(req.params.id, req.body);
    if (!material) return res.status(404).json({ error: "Material no encontrado" });
    res.json({ mensaje: "Material actualizado", material });
  } catch (error) {
    console.error("Error al actualizar material:", error);
    res.status(500).json({ error: "Error al actualizar material" });
  }
};

const eliminarMaterial = async (req, res) => {
  try {
    const material = await contenidoModel.deleteMaterial(req.params.id);
    if (!material) return res.status(404).json({ error: "Material no encontrado" });
    res.json({ mensaje: "Material eliminado" });
  } catch (error) {
    console.error("Error al eliminar material:", error);
    res.status(500).json({ error: "Error al eliminar material" });
  }
};

module.exports = {
  listarCursos, obtenerCurso, crearCurso, actualizarCurso, eliminarCurso,
  listarTemas, obtenerTema, crearTema, actualizarTema, eliminarTema,
  listarMateriales, obtenerMaterial, crearMaterial, actualizarMaterial, eliminarMaterial,
};

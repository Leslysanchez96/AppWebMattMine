const perfilModel = require("../models/perfil.model");
const nsfwService = require("../services/nsfw.service");
const path = require("path");
const fs = require("fs");

// GET /api/perfil/avatar
const obtenerAvatar = async (req, res) => {
  try {
    const row = await perfilModel.getAvatar(req.usuario.id);
    res.json({ avatar: row?.avatar || null });
  } catch (error) {
    console.error("Error al obtener avatar:", error);
    res.status(500).json({ error: "Error al obtener avatar" });
  }
};

// PUT /api/perfil/avatar
const subirAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se envió ninguna imagen" });
    }

    const archivoSubido = req.file.path;

    // Validar contenido con NSFW
    let validacion;
    try {
      validacion = await nsfwService.validar(archivoSubido);
    } catch (err) {
      console.error("Error en validación NSFW:", err);
      // Si la validación falla técnicamente, eliminar archivo y rechazar
      if (fs.existsSync(archivoSubido)) fs.unlinkSync(archivoSubido);
      return res.status(500).json({ error: "No se pudo validar la imagen. Intenta de nuevo." });
    }

    if (!validacion.ok) {
      // Eliminar archivo rechazado
      if (fs.existsSync(archivoSubido)) fs.unlinkSync(archivoSubido);
      return res.status(422).json({ error: validacion.motivo });
    }

    const avatarPath = `/uploads/avatars/${req.file.filename}`;

    // Eliminar avatar anterior si existe
    const actual = await perfilModel.getAvatar(req.usuario.id);
    if (actual?.avatar) {
      const oldPath = path.join(__dirname, "..", "public", actual.avatar);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const result = await perfilModel.updateAvatar(req.usuario.id, avatarPath);
    res.json({ mensaje: "Avatar actualizado", avatar: result.avatar });
  } catch (error) {
    console.error("Error al subir avatar:", error);
    res.status(500).json({ error: "Error al subir avatar" });
  }
};

// GET /api/perfil/preferencias
const obtenerPreferencias = async (req, res) => {
  try {
    const estudiante = await perfilModel.getEstudianteByUsuario(req.usuario.id);
    if (!estudiante) {
      return res.status(404).json({ error: "No se encontró el registro de estudiante" });
    }
    const preferencias = await perfilModel.getPreferencias(estudiante.id_estudiante);
    res.json(preferencias || {});
  } catch (error) {
    console.error("Error al obtener preferencias:", error);
    res.status(500).json({ error: "Error al obtener preferencias" });
  }
};

// PUT /api/perfil/preferencias
const actualizarPreferencias = async (req, res) => {
  try {
    const estudiante = await perfilModel.getEstudianteByUsuario(req.usuario.id);
    if (!estudiante) {
      return res.status(404).json({ error: "No se encontró el registro de estudiante" });
    }
    const result = await perfilModel.upsertPreferencias(estudiante.id_estudiante, req.body);
    res.json({ mensaje: "Preferencias actualizadas", preferencias: result });
  } catch (error) {
    console.error("Error al actualizar preferencias:", error);
    res.status(500).json({ error: "Error al actualizar preferencias" });
  }
};

module.exports = { obtenerAvatar, subirAvatar, obtenerPreferencias, actualizarPreferencias };

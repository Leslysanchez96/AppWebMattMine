const usuarioModel = require('../models/usuario.model');
const passwordService = require('../services/password.service');

// GET /api/usuarios — Listar usuarios con filtros (HU09)
async function listar(req, res) {
    try {
        const { rol, estado, busqueda, page, limit } = req.query;
        const resultado = await usuarioModel.getAll({
            rol, estado, busqueda,
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10,
        });
        res.json(resultado);
    } catch (err) {
        console.error('Error al listar usuarios:', err);
        res.status(500).json({ error: 'Error al obtener los usuarios.' });
    }
}

// GET /api/usuarios/:id — Obtener usuario por ID (HU09)
async function obtener(req, res) {
    try {
        const usuario = await usuarioModel.getById(req.params.id);
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }
        res.json(usuario);
    } catch (err) {
        console.error('Error al obtener usuario:', err);
        res.status(500).json({ error: 'Error al obtener el usuario.' });
    }
}

// Generar código automático: PREFIJO + AÑO(2) + DNI(últimos 4), con sufijo si hay colisión
async function generarCodigo(rol, dni) {
    const prefijos = { Administrador: 'ADM', Docente: 'DOC', Estudiante: 'EST' };
    const prefijo = prefijos[rol] || 'USR';
    const anio = new Date().getFullYear().toString().slice(-2);
    const dniSufijo = dni.slice(-4);
    let codigo = `${prefijo}${anio}${dniSufijo}`;

    // Verificar si ya existe, agregar sufijo incremental
    let intento = 1;
    let codigoFinal = codigo;
    while (await usuarioModel.existeCodigo(codigoFinal)) {
        intento++;
        codigoFinal = `${codigo}-${intento}`;
    }
    return codigoFinal;
}

// POST /api/usuarios — Crear usuario (HU09)
async function crear(req, res) {
    const { dni, password, correo, nombres, apellido, rol } = req.body;

    if (!dni || !password || !nombres || !apellido || !rol) {
        return res.status(400).json({ error: 'Todos los campos obligatorios son requeridos.' });
    }

    // Validar rol
    const rolesValidos = ['Estudiante', 'Docente', 'Administrador'];
    if (!rolesValidos.includes(rol)) {
        return res.status(400).json({ error: 'Rol no válido.' });
    }

    // Validar política de contraseñas
    const politica = await passwordService.validarPolitica(password);
    if (!politica.valido) {
        return res.status(400).json({ error: politica.errores.join(' ') });
    }

    try {
        // Verificar DNI duplicado
        const existe = await usuarioModel.existeDni(dni);
        if (existe) {
            return res.status(409).json({ error: 'Ya existe un usuario con ese DNI.' });
        }

        // Generar código automáticamente
        const codigo = await generarCodigo(rol, dni);

        const hashedPassword = await passwordService.hashPassword(password);
        const nuevoUsuario = await usuarioModel.create({
            dni, codigo, password: hashedPassword, correo, nombres, apellido, rol,
        });

        res.status(201).json({
            message: `Usuario creado correctamente. Código asignado: ${codigo}`,
            usuario: nuevoUsuario,
        });
    } catch (err) {
        console.error('Error al crear usuario:', err);
        res.status(500).json({ error: 'Error al crear el usuario.' });
    }
}

// PUT /api/usuarios/:id — Actualizar usuario (HU09)
async function actualizar(req, res) {
    try {
        const usuario = await usuarioModel.getById(req.params.id);
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        const actualizado = await usuarioModel.update(req.params.id, req.body);
        if (!actualizado) {
            return res.status(400).json({ error: 'No se proporcionaron campos para actualizar.' });
        }

        res.json({
            message: 'Usuario actualizado correctamente.',
            usuario: actualizado,
        });
    } catch (err) {
        console.error('Error al actualizar usuario:', err);
        res.status(500).json({ error: 'Error al actualizar el usuario.' });
    }
}

// DELETE /api/usuarios/:id — Soft delete (HU09)
async function eliminar(req, res) {
    try {
        const usuario = await usuarioModel.getById(req.params.id);
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        await usuarioModel.softDelete(req.params.id);
        res.json({ message: 'Usuario desactivado correctamente.' });
    } catch (err) {
        console.error('Error al eliminar usuario:', err);
        res.status(500).json({ error: 'Error al desactivar el usuario.' });
    }
}

// PUT /api/usuarios/:id/rol — Asignar rol (HU05)
async function asignarRol(req, res) {
    const { rol } = req.body;

    if (!rol) {
        return res.status(400).json({ error: 'El rol es requerido.' });
    }

    try {
        const resultado = await usuarioModel.asignarRol(req.params.id, rol);
        if (!resultado) {
            return res.status(400).json({ error: 'Rol no válido o usuario no encontrado.' });
        }

        res.json({
            message: 'Rol asignado correctamente.',
            usuario: resultado,
        });
    } catch (err) {
        console.error('Error al asignar rol:', err);
        res.status(500).json({ error: 'Error al asignar el rol.' });
    }
}

// GET /api/mi-cuenta — Info del usuario logueado (HU10)
async function miCuenta(req, res) {
    try {
        const usuario = await usuarioModel.getInfoCuenta(req.usuario.id);
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }
        res.json(usuario);
    } catch (err) {
        console.error('Error al obtener cuenta:', err);
        res.status(500).json({ error: 'Error al obtener la información de la cuenta.' });
    }
}

// GET /api/usuarios/estadisticas — Conteo por rol (dashboard admin)
async function estadisticas(req, res) {
    try {
        const conteo = await usuarioModel.contarPorRol();
        res.json(conteo);
    } catch (err) {
        console.error('Error al obtener estadísticas:', err);
        res.status(500).json({ error: 'Error al obtener estadísticas.' });
    }
}

module.exports = {
    listar,
    obtener,
    crear,
    actualizar,
    eliminar,
    asignarRol,
    miCuenta,
    estadisticas,
};

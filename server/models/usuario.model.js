const db = require('../db');

// Buscar usuario por código
async function findByCodigo(codigo) {
    const result = await db.query(
        'SELECT id_usuario, codigo, dni, nombres, apellido, correo, rol, estado, intentos_fallidos, avatar, ultimo_acceso, fecha_creacion FROM usuario WHERE codigo = $1',
        [codigo]
    );
    return result.rows[0] || null;
}

// Buscar usuario por correo filtrando por roles
async function findByCorreo(correo, roles) {
    const result = await db.query(
        "SELECT id_usuario, nombres, correo, rol FROM usuario WHERE correo = $1 AND rol = ANY($2) AND estado IN ('Activo', 'Bloqueado')",
        [correo, roles]
    );
    return result.rows[0] || null;
}

// Obtener password por ID
async function getPasswordById(idUsuario) {
    const result = await db.query(
        'SELECT password FROM usuario WHERE id_usuario = $1',
        [idUsuario]
    );
    return result.rows[0]?.password || null;
}

// Incrementar intentos fallidos
async function incrementarIntentos(idUsuario) {
    const result = await db.query(
        'UPDATE usuario SET intentos_fallidos = intentos_fallidos + 1 WHERE id_usuario = $1 RETURNING intentos_fallidos',
        [idUsuario]
    );
    return result.rows[0]?.intentos_fallidos || 0;
}

// Resetear intentos fallidos y actualizar último acceso
async function loginExitoso(idUsuario) {
    await db.query(
        'UPDATE usuario SET intentos_fallidos = 0, ultimo_acceso = CURRENT_TIMESTAMP WHERE id_usuario = $1',
        [idUsuario]
    );
}

// Bloquear cuenta
async function bloquearCuenta(idUsuario) {
    await db.query(
        "UPDATE usuario SET estado = 'Bloqueado' WHERE id_usuario = $1",
        [idUsuario]
    );
}

// Desbloquear cuenta: estado Activo + reset de intentos
async function desbloquearCuenta(idUsuario) {
    const result = await db.query(
        `UPDATE usuario
         SET estado = 'Activo', intentos_fallidos = 0
         WHERE id_usuario = $1
         RETURNING id_usuario, codigo, estado, intentos_fallidos`,
        [idUsuario]
    );
    return result.rows[0] || null;
}

// Actualizar password
async function updatePassword(idUsuario, hashedPassword) {
    await db.query(
        'UPDATE usuario SET password = $1 WHERE id_usuario = $2',
        [hashedPassword, idUsuario]
    );
}

// Actualizar estado
async function updateEstado(idUsuario, estado) {
    await db.query(
        'UPDATE usuario SET estado = $1 WHERE id_usuario = $2',
        [estado, idUsuario]
    );
}

// Obtener info de cuenta del usuario logueado (incluye aula si es Estudiante)
async function getInfoCuenta(idUsuario) {
    const result = await db.query(
        `SELECT u.id_usuario, u.codigo, u.dni, u.nombres, u.apellido, u.correo,
                u.rol, u.estado, u.avatar, u.ultimo_acceso, u.fecha_creacion,
                CASE
                    WHEN u.rol = 'Estudiante' AND a.id_aula IS NOT NULL
                    THEN CONCAT(a.grado, a.seccion, ' — ', a.anio)
                    ELSE NULL
                END AS aula
         FROM usuario u
         LEFT JOIN estudiante e ON u.id_usuario = e.id_usuario
         LEFT JOIN aula a ON e.id_aula = a.id_aula
         WHERE u.id_usuario = $1`,
        [idUsuario]
    );
    return result.rows[0] || null;
}

// ==================== Sprint 2: CRUD Usuarios ====================

// Listar usuarios con filtros y paginación (HU09)
async function getAll({ rol, estado, busqueda, page = 1, limit = 10 }) {
    let query = 'SELECT id_usuario, codigo, dni, nombres, apellido, correo, rol, estado, avatar, ultimo_acceso, fecha_creacion FROM usuario WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (rol) {
        query += ` AND rol = $${paramIndex++}`;
        params.push(rol);
    }
    if (estado) {
        query += ` AND estado = $${paramIndex++}`;
        params.push(estado);
    }
    if (busqueda) {
        query += ` AND (nombres ILIKE $${paramIndex} OR apellido ILIKE $${paramIndex} OR codigo ILIKE $${paramIndex} OR correo ILIKE $${paramIndex})`;
        params.push(`%${busqueda}%`);
        paramIndex++;
    }

    // Contar total
    const countResult = await db.query(
        query.replace('SELECT id_usuario, codigo, dni, nombres, apellido, correo, rol, estado, avatar, ultimo_acceso, fecha_creacion', 'SELECT COUNT(*)'),
        params
    );
    const total = parseInt(countResult.rows[0].count);

    // Paginación
    const offset = (page - 1) * limit;
    query += ` ORDER BY nombres ASC, apellido ASC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    return {
        usuarios: result.rows,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit),
    };
}

// Obtener usuario por ID (HU09)
async function getById(idUsuario) {
    const result = await db.query(
        'SELECT id_usuario, codigo, dni, nombres, apellido, correo, rol, estado, avatar, ultimo_acceso, fecha_creacion FROM usuario WHERE id_usuario = $1',
        [idUsuario]
    );
    return result.rows[0] || null;
}

// Crear usuario (HU09)
async function create({ dni, codigo, password, correo, nombres, apellido, rol }) {
    const result = await db.query(
        `INSERT INTO usuario (dni, codigo, password, correo, nombres, apellido, rol)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id_usuario, codigo, dni, nombres, apellido, correo, rol, estado, fecha_creacion`,
        [dni, codigo, password, correo, nombres, apellido, rol]
    );
    return result.rows[0];
}

// Verificar si código o DNI ya existen
async function existeCodigoODni(codigo, dni, excludeId = null) {
    let query = 'SELECT id_usuario FROM usuario WHERE (codigo = $1 OR dni = $2)';
    const params = [codigo, dni];
    if (excludeId) {
        query += ' AND id_usuario != $3';
        params.push(excludeId);
    }
    const result = await db.query(query, params);
    return result.rows.length > 0;
}

// Verificar si un código ya existe
async function existeCodigo(codigo) {
    const result = await db.query('SELECT 1 FROM usuario WHERE codigo = $1', [codigo]);
    return result.rows.length > 0;
}

// Verificar si un DNI ya existe
async function existeDni(dni, excludeId = null) {
    let query = 'SELECT 1 FROM usuario WHERE dni = $1';
    const params = [dni];
    if (excludeId) {
        query += ' AND id_usuario != $2';
        params.push(excludeId);
    }
    const result = await db.query(query, params);
    return result.rows.length > 0;
}

// Actualizar usuario (HU09)
async function update(idUsuario, { dni, nombres, apellido, correo, rol, estado }) {
    const fields = [];
    const params = [];
    let paramIndex = 1;

    if (dni !== undefined) { fields.push(`dni = $${paramIndex++}`); params.push(dni); }
    if (nombres !== undefined) { fields.push(`nombres = $${paramIndex++}`); params.push(nombres); }
    if (apellido !== undefined) { fields.push(`apellido = $${paramIndex++}`); params.push(apellido); }
    if (correo !== undefined) { fields.push(`correo = $${paramIndex++}`); params.push(correo); }
    if (rol !== undefined) { fields.push(`rol = $${paramIndex++}`); params.push(rol); }
    if (estado !== undefined) { fields.push(`estado = $${paramIndex++}`); params.push(estado); }

    if (fields.length === 0) return null;

    params.push(idUsuario);
    const result = await db.query(
        `UPDATE usuario SET ${fields.join(', ')} WHERE id_usuario = $${paramIndex}
         RETURNING id_usuario, codigo, dni, nombres, apellido, correo, rol, estado`,
        params
    );
    return result.rows[0] || null;
}

// Soft delete - cambiar estado a Inactivo (HU09)
async function softDelete(idUsuario) {
    const result = await db.query(
        "UPDATE usuario SET estado = 'Inactivo' WHERE id_usuario = $1 RETURNING id_usuario, estado",
        [idUsuario]
    );
    return result.rows[0] || null;
}

// Asignar rol (HU05)
async function asignarRol(idUsuario, nuevoRol) {
    const rolesValidos = ['Estudiante', 'Docente', 'Administrador'];
    if (!rolesValidos.includes(nuevoRol)) return null;

    const result = await db.query(
        'UPDATE usuario SET rol = $1 WHERE id_usuario = $2 RETURNING id_usuario, codigo, nombres, apellido, rol',
        [nuevoRol, idUsuario]
    );
    return result.rows[0] || null;
}

// Contar usuarios por rol y estado (para dashboard)
async function contarPorRol() {
    const porRol = await db.query(
        "SELECT rol, COUNT(*) as cantidad FROM usuario WHERE estado = 'Activo' GROUP BY rol"
    );
    const porEstado = await db.query(
        "SELECT estado, COUNT(*) as cantidad FROM usuario GROUP BY estado"
    );
    const totalRes = await db.query("SELECT COUNT(*) as cantidad FROM usuario");
    return {
        porRol: porRol.rows,
        porEstado: porEstado.rows,
        total: parseInt(totalRes.rows[0].cantidad),
    };
}

module.exports = {
    findByCodigo,
    findByCorreo,
    getPasswordById,
    incrementarIntentos,
    loginExitoso,
    bloquearCuenta,
    desbloquearCuenta,
    updatePassword,
    updateEstado,
    getInfoCuenta,
    getAll,
    getById,
    create,
    existeCodigoODni,
    existeCodigo,
    existeDni,
    update,
    softDelete,
    asignarRol,
    contarPorRol,
};

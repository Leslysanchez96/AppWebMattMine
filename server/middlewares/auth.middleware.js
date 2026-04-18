const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'mattmine_secret_key_2025';
const JWT_EXPIRES_IN = '8h';

// Generar token JWT
function generarToken(usuario) {
    return jwt.sign(
        {
            id: usuario.id_usuario,
            codigo: usuario.codigo,
            rol: usuario.rol,
            nombres: usuario.nombres,
            apellido: usuario.apellido,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
}

// Middleware para verificar token JWT
function verificarToken(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json({ error: 'Token de acceso requerido.' });
    }

    const token = authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : authHeader;

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.usuario = decoded;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'La sesión ha expirado. Inicia sesión nuevamente.' });
        }
        return res.status(401).json({ error: 'Token inválido.' });
    }
}

module.exports = {
    generarToken,
    verificarToken,
    JWT_SECRET,
};

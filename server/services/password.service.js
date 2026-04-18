const bcrypt = require('bcrypt');
const politicaModel = require('../models/politicaSeguridad.model');

const SALT_ROUNDS = 12;

// Valores por defecto (fallback si no hay registro en BD)
const DEFAULTS = {
    longitud_minima: 8,
    requiere_mayuscula: true,
    requiere_minuscula: true,
    requiere_numero: true,
    requiere_especial: true,
    vigencia_dias: 90,
    dias_aviso_expiracion: 5,
    intentos_fallidos_max: 3,
};

// Obtener política vigente desde BD (con fallback)
async function obtenerPolitica() {
    try {
        const politica = await politicaModel.obtener();
        return politica || DEFAULTS;
    } catch {
        return DEFAULTS;
    }
}

// Política de contraseñas (HU33): validación dinámica desde BD
async function validarPolitica(password) {
    const politica = await obtenerPolitica();
    const errores = [];

    if (!password || password.length < politica.longitud_minima) {
        errores.push(`La contraseña debe tener al menos ${politica.longitud_minima} caracteres.`);
    }
    if (politica.requiere_mayuscula && !/[A-Z]/.test(password)) {
        errores.push('Debe contener al menos una letra mayúscula.');
    }
    if (politica.requiere_minuscula && !/[a-z]/.test(password)) {
        errores.push('Debe contener al menos una letra minúscula.');
    }
    if (politica.requiere_numero && !/[0-9]/.test(password)) {
        errores.push('Debe contener al menos un número.');
    }
    if (politica.requiere_especial && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) {
        errores.push('Debe contener al menos un carácter especial.');
    }

    return {
        valido: errores.length === 0,
        errores,
    };
}

async function hashPassword(password) {
    return bcrypt.hash(password, SALT_ROUNDS);
}

async function comparePassword(plain, hash) {
    return bcrypt.compare(plain, hash);
}

// Verificar si la contraseña expiró (días desde BD)
async function verificarExpiracion(ultimoCambio) {
    if (!ultimoCambio) return true;
    const politica = await obtenerPolitica();
    const diasTranscurridos = (Date.now() - new Date(ultimoCambio).getTime()) / (1000 * 60 * 60 * 24);
    return diasTranscurridos >= politica.vigencia_dias;
}

// Verificar si está próxima a expirar
async function proximaAExpirar(ultimoCambio) {
    if (!ultimoCambio) return false;
    const politica = await obtenerPolitica();
    const diasTranscurridos = (Date.now() - new Date(ultimoCambio).getTime()) / (1000 * 60 * 60 * 24);
    const umbral = politica.vigencia_dias - politica.dias_aviso_expiracion;
    return diasTranscurridos >= umbral && diasTranscurridos < politica.vigencia_dias;
}

module.exports = {
    validarPolitica,
    hashPassword,
    comparePassword,
    verificarExpiracion,
    proximaAExpirar,
    obtenerPolitica,
};

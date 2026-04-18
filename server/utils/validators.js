function camposRequeridos(campos, body) {
    const faltantes = campos.filter(campo => !body[campo]);
    if (faltantes.length > 0) {
        return {
            valido: false,
            mensaje: `Campos requeridos: ${faltantes.join(', ')}`,
        };
    }
    return { valido: true };
}

module.exports = {
    camposRequeridos,
};

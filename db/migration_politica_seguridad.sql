-- Migración: Tabla de configuración de políticas de seguridad de contraseñas
-- Solo debe existir UNA fila (singleton config)

CREATE TABLE IF NOT EXISTS politica_seguridad (
    id SERIAL PRIMARY KEY,
    longitud_minima INTEGER NOT NULL DEFAULT 8,
    requiere_mayuscula BOOLEAN NOT NULL DEFAULT TRUE,
    requiere_minuscula BOOLEAN NOT NULL DEFAULT TRUE,
    requiere_numero BOOLEAN NOT NULL DEFAULT TRUE,
    requiere_especial BOOLEAN NOT NULL DEFAULT TRUE,
    vigencia_dias INTEGER NOT NULL DEFAULT 90,
    dias_aviso_expiracion INTEGER NOT NULL DEFAULT 5,
    intentos_fallidos_max INTEGER NOT NULL DEFAULT 3,
    actualizado_por INTEGER REFERENCES usuario(id_usuario),
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar configuración por defecto
INSERT INTO politica_seguridad (longitud_minima, requiere_mayuscula, requiere_minuscula, requiere_numero, requiere_especial, vigencia_dias, dias_aviso_expiracion, intentos_fallidos_max)
VALUES (8, TRUE, TRUE, TRUE, TRUE, 90, 5, 3)
ON CONFLICT DO NOTHING;

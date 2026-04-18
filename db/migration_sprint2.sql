-- Sprint 2: Migración - Tabla de Auditoría de Accesos (HU08)
CREATE TABLE IF NOT EXISTS auditoria_acceso (
    id_auditoria    SERIAL PRIMARY KEY,
    id_usuario      INT REFERENCES usuario(id_usuario),
    accion          VARCHAR(100) NOT NULL,
    ruta            VARCHAR(255),
    metodo          VARCHAR(10),
    ip              VARCHAR(45),
    detalles        TEXT,
    fecha           TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_auditoria_usuario ON auditoria_acceso(id_usuario);
CREATE INDEX idx_auditoria_fecha ON auditoria_acceso(fecha);
CREATE INDEX idx_auditoria_accion ON auditoria_acceso(accion);

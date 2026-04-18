-- ============================================================
-- Migración: Sistema de Permisos Granulares
-- Tablas: modulo, rol_permiso
-- ============================================================

BEGIN;

-- Tabla de módulos del sistema
CREATE TABLE IF NOT EXISTS modulo (
    id_modulo SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion VARCHAR(200)
);

-- Tabla de permisos por rol
CREATE TABLE IF NOT EXISTS rol_permiso (
    id_rol_permiso SERIAL PRIMARY KEY,
    rol VARCHAR(20) NOT NULL,
    id_modulo INTEGER NOT NULL REFERENCES modulo(id_modulo) ON DELETE CASCADE,
    accion VARCHAR(10) NOT NULL CHECK (accion IN ('ver', 'crear', 'editar', 'eliminar')),
    UNIQUE(rol, id_modulo, accion)
);

CREATE INDEX IF NOT EXISTS idx_rol_permiso_rol ON rol_permiso(rol);
CREATE INDEX IF NOT EXISTS idx_rol_permiso_modulo ON rol_permiso(id_modulo);

-- ============================================================
-- Seed: Módulos del sistema
-- ============================================================
INSERT INTO modulo (nombre, descripcion) VALUES
    ('usuarios', 'Gestión de usuarios del sistema'),
    ('roles', 'Asignación de roles y permisos'),
    ('auditoria', 'Registro de actividad del sistema'),
    ('cursos', 'Gestión de cursos'),
    ('temas', 'Gestión de temas por curso'),
    ('materiales', 'Gestión de materiales educativos'),
    ('evaluaciones', 'Gestión de evaluaciones con IA'),
    ('reportes', 'Reportes y seguimiento de rendimiento')
ON CONFLICT (nombre) DO NOTHING;

-- ============================================================
-- Seed: Permisos por defecto
-- ============================================================

-- Helper: obtener id_modulo por nombre
-- Administrador: CRUD completo en todos los módulos
INSERT INTO rol_permiso (rol, id_modulo, accion)
SELECT 'Administrador', m.id_modulo, a.accion
FROM modulo m
CROSS JOIN (VALUES ('ver'), ('crear'), ('editar'), ('eliminar')) AS a(accion)
ON CONFLICT (rol, id_modulo, accion) DO NOTHING;

-- Docente
INSERT INTO rol_permiso (rol, id_modulo, accion) VALUES
    ('Docente', (SELECT id_modulo FROM modulo WHERE nombre = 'usuarios'), 'ver'),
    ('Docente', (SELECT id_modulo FROM modulo WHERE nombre = 'cursos'), 'ver'),
    ('Docente', (SELECT id_modulo FROM modulo WHERE nombre = 'temas'), 'ver'),
    ('Docente', (SELECT id_modulo FROM modulo WHERE nombre = 'temas'), 'crear'),
    ('Docente', (SELECT id_modulo FROM modulo WHERE nombre = 'temas'), 'editar'),
    ('Docente', (SELECT id_modulo FROM modulo WHERE nombre = 'materiales'), 'ver'),
    ('Docente', (SELECT id_modulo FROM modulo WHERE nombre = 'materiales'), 'crear'),
    ('Docente', (SELECT id_modulo FROM modulo WHERE nombre = 'materiales'), 'editar'),
    ('Docente', (SELECT id_modulo FROM modulo WHERE nombre = 'materiales'), 'eliminar'),
    ('Docente', (SELECT id_modulo FROM modulo WHERE nombre = 'evaluaciones'), 'ver'),
    ('Docente', (SELECT id_modulo FROM modulo WHERE nombre = 'evaluaciones'), 'crear'),
    ('Docente', (SELECT id_modulo FROM modulo WHERE nombre = 'evaluaciones'), 'editar'),
    ('Docente', (SELECT id_modulo FROM modulo WHERE nombre = 'reportes'), 'ver'),
    ('Docente', (SELECT id_modulo FROM modulo WHERE nombre = 'reportes'), 'crear')
ON CONFLICT (rol, id_modulo, accion) DO NOTHING;

-- Estudiante
INSERT INTO rol_permiso (rol, id_modulo, accion) VALUES
    ('Estudiante', (SELECT id_modulo FROM modulo WHERE nombre = 'cursos'), 'ver'),
    ('Estudiante', (SELECT id_modulo FROM modulo WHERE nombre = 'temas'), 'ver'),
    ('Estudiante', (SELECT id_modulo FROM modulo WHERE nombre = 'materiales'), 'ver'),
    ('Estudiante', (SELECT id_modulo FROM modulo WHERE nombre = 'evaluaciones'), 'ver'),
    ('Estudiante', (SELECT id_modulo FROM modulo WHERE nombre = 'reportes'), 'ver')
ON CONFLICT (rol, id_modulo, accion) DO NOTHING;

COMMIT;

-- ============================================================
-- MÓDULO: SEGURIDAD Y AUTENTICACIÓN
-- ============================================================

-- Tabla: Usuario
CREATE TABLE usuario (
    id_usuario          SERIAL          PRIMARY KEY,
    dni                 VARCHAR(15)     NOT NULL UNIQUE,
    codigo              VARCHAR(20)     NOT NULL UNIQUE,
    password            VARCHAR(250)    NOT NULL,
    correo              VARCHAR(100)    NOT NULL UNIQUE,
    nombres             VARCHAR(100)    NOT NULL,
    apellido            VARCHAR(100)    NOT NULL,
    telefono            VARCHAR(20),
    direccion           VARCHAR(200),
    fecha_nacimiento    DATE,
    rol                 VARCHAR(20)     NOT NULL CHECK (rol IN ('Estudiante', 'Docente', 'Administrador')),
    estado              VARCHAR(20)     NOT NULL DEFAULT 'Activo' CHECK (estado IN ('Activo', 'Inactivo', 'Bloqueado')),
    intentos_fallidos   INTEGER         NOT NULL DEFAULT 0,
    ultimo_acceso       TIMESTAMP,
    avatar              VARCHAR(250),
    fecha_creacion      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE usuario IS 'Tabla principal de usuarios del sistema MathLearn (estudiantes, docentes y administradores)';

-- Tabla: PreguntaSeguridad
CREATE TABLE pregunta_seguridad (
    id_pregunta_seguridad   SERIAL          PRIMARY KEY,
    pregunta                VARCHAR(255)    NOT NULL
);

COMMENT ON TABLE pregunta_seguridad IS 'Catálogo de preguntas de seguridad para recuperación de cuenta';

-- Tabla: UsuarioPregunta
CREATE TABLE usuario_pregunta (
    id_usuario_pregunta     SERIAL          PRIMARY KEY,
    id_usuario              INTEGER         NOT NULL,
    id_pregunta_seguridad   INTEGER         NOT NULL,
    respuesta_hash          VARCHAR(255)    NOT NULL,

    CONSTRAINT fk_usuario_pregunta_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
        ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT fk_usuario_pregunta_pregunta
        FOREIGN KEY (id_pregunta_seguridad) REFERENCES pregunta_seguridad(id_pregunta_seguridad)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT uq_usuario_pregunta
        UNIQUE (id_usuario, id_pregunta_seguridad)
);

COMMENT ON TABLE usuario_pregunta IS 'Relación entre usuarios y sus preguntas de seguridad seleccionadas';

-- Tabla: RecuperarPassword
CREATE TABLE recuperar_password (
    id_recuperacion     SERIAL          PRIMARY KEY,
    id_usuario          INTEGER         NOT NULL,
    token               VARCHAR(250)    NOT NULL UNIQUE,
    fecha_expiracion    TIMESTAMP       NOT NULL,
    usado               BOOLEAN         NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_recuperar_password_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
        ON UPDATE CASCADE ON DELETE CASCADE
);

COMMENT ON TABLE recuperar_password IS 'Tokens de recuperación de contraseña con expiración y control de uso';

-- ============================================================
-- MÓDULO: ESTRUCTURA ACADÉMICA
-- ============================================================

-- Tabla: Aula
CREATE TABLE aula (
    id_aula     SERIAL          PRIMARY KEY,
    grado       VARCHAR(50)     NOT NULL,
    seccion     VARCHAR(100)    NOT NULL,
    anio        INTEGER         NOT NULL,

    CONSTRAINT uq_aula_grado_seccion_anio
        UNIQUE (grado, seccion, anio)
);

COMMENT ON TABLE aula IS 'Aulas del colegio identificadas por grado, sección y año académico';

-- Tabla: Estudiante
CREATE TABLE estudiante (
    id_estudiante   SERIAL      PRIMARY KEY,
    id_aula         INTEGER     NOT NULL,
    id_usuario      INTEGER     NOT NULL UNIQUE,

    CONSTRAINT fk_estudiante_aula
        FOREIGN KEY (id_aula) REFERENCES aula(id_aula)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT fk_estudiante_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
        ON UPDATE CASCADE ON DELETE CASCADE
);

COMMENT ON TABLE estudiante IS 'Estudiantes del sistema, vinculados a un usuario y un aula';

-- Tabla: PreferenciaEstudiante (★ Personalización con IA)
CREATE TABLE preferencia_estudiante (
    id_preferencia      SERIAL          PRIMARY KEY,
    id_estudiante       INTEGER         NOT NULL UNIQUE,
    deporte             VARCHAR(100),
    hobby               VARCHAR(100),
    color               VARCHAR(50),
    mascota             VARCHAR(100),
    comida_favorita     VARCHAR(100),
    artista             VARCHAR(100),
    interes_adicional   VARCHAR(255),

    CONSTRAINT fk_preferencia_estudiante
        FOREIGN KEY (id_estudiante) REFERENCES estudiante(id_estudiante)
        ON UPDATE CASCADE ON DELETE CASCADE
);

COMMENT ON TABLE preferencia_estudiante IS 'Preferencias e intereses del estudiante utilizados por la IA para personalizar las evaluaciones mediante NLP';

-- Tabla: Docente
CREATE TABLE docente (
    id_docente      SERIAL          PRIMARY KEY,
    id_usuario      INTEGER         NOT NULL UNIQUE,
    especialidad    VARCHAR(100),

    CONSTRAINT fk_docente_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
        ON UPDATE CASCADE ON DELETE CASCADE
);

COMMENT ON TABLE docente IS 'Docentes del sistema, vinculados a un usuario';

-- Tabla: AsignacionAula
CREATE TABLE asignacion_aula (
    id_asignacion       SERIAL          PRIMARY KEY,
    id_aula             INTEGER         NOT NULL,
    id_docente          INTEGER         NOT NULL,
    anio                INTEGER         NOT NULL,
    periodo             VARCHAR(50),
    activo              BOOLEAN         NOT NULL DEFAULT TRUE,
    fecha_asignado      DATE            NOT NULL DEFAULT CURRENT_DATE,

    CONSTRAINT fk_asignacion_aula_aula
        FOREIGN KEY (id_aula) REFERENCES aula(id_aula)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT fk_asignacion_aula_docente
        FOREIGN KEY (id_docente) REFERENCES docente(id_docente)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

COMMENT ON TABLE asignacion_aula IS 'Asignación de docentes a aulas por año y periodo académico';

-- ============================================================
-- MÓDULO: CURSOS Y CONTENIDOS
-- ============================================================

-- Tabla: Cursos
CREATE TABLE cursos (
    id_curso        SERIAL          PRIMARY KEY,
    nombre          VARCHAR(100)    NOT NULL,
    descripcion     VARCHAR(200),
    orden           INTEGER         DEFAULT 0
);

COMMENT ON TABLE cursos IS 'Catálogo de cursos disponibles en el sistema (ej: Matemática)';

-- Tabla: AulaCurso
CREATE TABLE aula_curso (
    id_aula_curso   SERIAL      PRIMARY KEY,
    id_aula         INTEGER     NOT NULL,
    id_curso        INTEGER     NOT NULL,

    CONSTRAINT fk_aula_curso_aula
        FOREIGN KEY (id_aula) REFERENCES aula(id_aula)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT fk_aula_curso_curso
        FOREIGN KEY (id_curso) REFERENCES cursos(id_curso)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT uq_aula_curso
        UNIQUE (id_aula, id_curso)
);

COMMENT ON TABLE aula_curso IS 'Relación entre aulas y cursos asignados';

-- Tabla: Temas
CREATE TABLE temas (
    id_tema         SERIAL          PRIMARY KEY,
    id_curso        INTEGER         NOT NULL,
    nombre_tema     VARCHAR(160)    NOT NULL,
    descripcion     VARCHAR(255),
    orden           INTEGER         DEFAULT 0,

    CONSTRAINT fk_temas_curso
        FOREIGN KEY (id_curso) REFERENCES cursos(id_curso)
        ON UPDATE CASCADE ON DELETE CASCADE
);

COMMENT ON TABLE temas IS 'Temas que componen cada curso, organizados por orden secuencial';

-- Tabla: Material (★)
CREATE TABLE material (
    id_material     SERIAL          PRIMARY KEY,
    id_tema         INTEGER         NOT NULL,
    id_docente      INTEGER         NOT NULL,
    titulo          VARCHAR(200)    NOT NULL,
    tipo            VARCHAR(50),
    url             TEXT,
    descripcion     VARCHAR(500),
    activo          BOOLEAN         NOT NULL DEFAULT TRUE,

    CONSTRAINT fk_material_tema
        FOREIGN KEY (id_tema) REFERENCES temas(id_tema)
        ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT fk_material_docente
        FOREIGN KEY (id_docente) REFERENCES docente(id_docente)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

COMMENT ON TABLE material IS 'Material educativo subido por los docentes, asociado a temas específicos';

-- ============================================================
-- MÓDULO: EVALUACIONES Y PREGUNTAS CON IA
-- ============================================================

-- Tabla: Evaluacion
CREATE TABLE evaluacion (
    id_evaluacion       SERIAL          PRIMARY KEY,
    id_aula_curso       INTEGER         NOT NULL,
    titulo              VARCHAR(200)    NOT NULL,
    fecha               DATE,
    duracion            TIME,
    max_pts             NUMERIC(5,2),
    cant_preguntas      INTEGER         NOT NULL DEFAULT 0,
    tiempo_limite       INTEGER,
    fecha_publicacion   VARCHAR(20),
    estado              VARCHAR(20)     NOT NULL DEFAULT 'Borrador' CHECK (estado IN ('Borrador', 'Publicada', 'Finalizada', 'Cancelada')),

    CONSTRAINT fk_evaluacion_aula_curso
        FOREIGN KEY (id_aula_curso) REFERENCES aula_curso(id_aula_curso)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

COMMENT ON TABLE evaluacion IS 'Evaluaciones programadas por el docente para un aula-curso específico';

-- Tabla: PreguntaGeneradaIA (★ Generación con NLP)
CREATE TABLE pregunta_generada_ia (
    id_pregunta_generada    SERIAL          PRIMARY KEY,
    id_evaluacion           INTEGER         NOT NULL,
    id_tema                 INTEGER         NOT NULL,
    id_estudiante           INTEGER         NOT NULL,
    pregunta                TEXT            NOT NULL,
    opcion_a                TEXT            NOT NULL,
    opcion_b                TEXT            NOT NULL,
    opcion_c                TEXT            NOT NULL,
    opcion_d                TEXT            NOT NULL,
    respuesta_correcta      CHAR(1)         NOT NULL CHECK (respuesta_correcta IN ('A', 'B', 'C', 'D')),
    explicacion             TEXT,
    nivel_dificultad        VARCHAR(50)     DEFAULT 'Medio' CHECK (nivel_dificultad IN ('Fácil', 'Medio', 'Difícil')),
    fecha_generacion        DATE            NOT NULL DEFAULT CURRENT_DATE,

    CONSTRAINT fk_pregunta_ia_evaluacion
        FOREIGN KEY (id_evaluacion) REFERENCES evaluacion(id_evaluacion)
        ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT fk_pregunta_ia_tema
        FOREIGN KEY (id_tema) REFERENCES temas(id_tema)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT fk_pregunta_ia_estudiante
        FOREIGN KEY (id_estudiante) REFERENCES estudiante(id_estudiante)
        ON UPDATE CASCADE ON DELETE CASCADE
);

COMMENT ON TABLE pregunta_generada_ia IS 'Preguntas generadas por IA (NLP) personalizadas según las preferencias de cada estudiante';

-- ============================================================
-- MÓDULO: RESPUESTAS Y RESULTADOS
-- ============================================================

-- Tabla: RespuestaEstudiante
CREATE TABLE respuesta_estudiante (
    id_respuesta            SERIAL          PRIMARY KEY,
    id_pregunta_generada    INTEGER         NOT NULL,
    id_estudiante           INTEGER         NOT NULL,
    respuesta               CHAR(1)         CHECK (respuesta IN ('A', 'B', 'C', 'D')),
    es_correcta             BOOLEAN,
    puntaje                 NUMERIC(5,2)    DEFAULT 0,
    fecha                   DATE            NOT NULL DEFAULT CURRENT_DATE,

    CONSTRAINT fk_respuesta_pregunta
        FOREIGN KEY (id_pregunta_generada) REFERENCES pregunta_generada_ia(id_pregunta_generada)
        ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT fk_respuesta_estudiante
        FOREIGN KEY (id_estudiante) REFERENCES estudiante(id_estudiante)
        ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT uq_respuesta_pregunta_estudiante
        UNIQUE (id_pregunta_generada, id_estudiante)
);

COMMENT ON TABLE respuesta_estudiante IS 'Respuestas individuales de cada estudiante a las preguntas generadas por IA';

-- Tabla: ResultadoEvaluacion
CREATE TABLE resultado_evaluacion (
    id_resultado        SERIAL          PRIMARY KEY,
    id_estudiante       INTEGER         NOT NULL,
    id_evaluacion       INTEGER         NOT NULL,
    puntaje             NUMERIC(5,2)    DEFAULT 0,
    nivel_obtenido      VARCHAR(20),
    fecha_realizado     DATE            NOT NULL DEFAULT CURRENT_DATE,
    tiempo_utilizado    INTEGER,

    CONSTRAINT fk_resultado_estudiante
        FOREIGN KEY (id_estudiante) REFERENCES estudiante(id_estudiante)
        ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT fk_resultado_evaluacion
        FOREIGN KEY (id_evaluacion) REFERENCES evaluacion(id_evaluacion)
        ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT uq_resultado_estudiante_evaluacion
        UNIQUE (id_estudiante, id_evaluacion)
);

COMMENT ON TABLE resultado_evaluacion IS 'Resultado consolidado de cada estudiante por evaluación, con puntaje y nivel obtenido';

-- ============================================================
-- MÓDULO: SEGUIMIENTO DEL RENDIMIENTO ACADÉMICO
-- ============================================================

-- Tabla: RendimientoPorTema
CREATE TABLE rendimiento_por_tema (
    id_rendimiento          SERIAL          PRIMARY KEY,
    id_estudiante           INTEGER         NOT NULL,
    id_tema                 INTEGER         NOT NULL,
    promedio_tema           NUMERIC(5,2)    DEFAULT 0,
    ultima_actualizacion    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_rendimiento_estudiante
        FOREIGN KEY (id_estudiante) REFERENCES estudiante(id_estudiante)
        ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT fk_rendimiento_tema
        FOREIGN KEY (id_tema) REFERENCES temas(id_tema)
        ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT uq_rendimiento_estudiante_tema
        UNIQUE (id_estudiante, id_tema)
);

COMMENT ON TABLE rendimiento_por_tema IS 'Promedio de rendimiento de cada estudiante por tema, actualizado tras cada evaluación';

-- ============================================================
-- MÓDULO: REPORTES Y ALERTAS
-- ============================================================

-- Tabla: ReporteEstudiante (★)
CREATE TABLE reporte_estudiante (
    id_reporte      SERIAL          PRIMARY KEY,
    id_estudiante   INTEGER         NOT NULL,
    id_docente      INTEGER         NOT NULL,
    tipo            VARCHAR(50),
    fecha_generado  DATE            NOT NULL DEFAULT CURRENT_DATE,
    observaciones   TEXT,
    url_archivo     VARCHAR(255),

    CONSTRAINT fk_reporte_estudiante
        FOREIGN KEY (id_estudiante) REFERENCES estudiante(id_estudiante)
        ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT fk_reporte_docente
        FOREIGN KEY (id_docente) REFERENCES docente(id_docente)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

COMMENT ON TABLE reporte_estudiante IS 'Reportes detallados generados por el docente sobre el rendimiento de cada estudiante';

-- Tabla: AlertaRiesgo (★)
CREATE TABLE alerta_riesgo (
    id_alerta       SERIAL          PRIMARY KEY,
    id_estudiante   INTEGER         NOT NULL,
    id_docente      INTEGER         NOT NULL,
    tipo_riesgo     VARCHAR(50),
    descripcion     TEXT,
    estado          VARCHAR(50)     NOT NULL DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'Atendida', 'Resuelta', 'Descartada')),
    fecha_creacion  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_atencion  TIMESTAMP,

    CONSTRAINT fk_alerta_estudiante
        FOREIGN KEY (id_estudiante) REFERENCES estudiante(id_estudiante)
        ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT fk_alerta_docente
        FOREIGN KEY (id_docente) REFERENCES docente(id_docente)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

COMMENT ON TABLE alerta_riesgo IS 'Alertas generadas cuando el sistema detecta estudiantes en riesgo académico (calificaciones por debajo del umbral)';

-- ============================================================
-- ÍNDICES PARA OPTIMIZACIÓN DE CONSULTAS
-- ============================================================

-- Búsquedas frecuentes por rol y estado de usuario
CREATE INDEX idx_usuario_rol ON usuario(rol);
CREATE INDEX idx_usuario_estado ON usuario(estado);

-- Búsquedas de estudiantes por aula
CREATE INDEX idx_estudiante_aula ON estudiante(id_aula);

-- Búsquedas de evaluaciones por aula-curso y estado
CREATE INDEX idx_evaluacion_aula_curso ON evaluacion(id_aula_curso);
CREATE INDEX idx_evaluacion_estado ON evaluacion(estado);

-- Búsquedas de preguntas por evaluación y estudiante
CREATE INDEX idx_pregunta_ia_evaluacion ON pregunta_generada_ia(id_evaluacion);
CREATE INDEX idx_pregunta_ia_estudiante ON pregunta_generada_ia(id_estudiante);

-- Búsquedas de respuestas por estudiante
CREATE INDEX idx_respuesta_estudiante ON respuesta_estudiante(id_estudiante);

-- Búsquedas de resultados por estudiante y evaluación
CREATE INDEX idx_resultado_estudiante ON resultado_evaluacion(id_estudiante);
CREATE INDEX idx_resultado_evaluacion ON resultado_evaluacion(id_evaluacion);

-- Búsquedas de rendimiento por estudiante
CREATE INDEX idx_rendimiento_estudiante ON rendimiento_por_tema(id_estudiante);

-- Alertas pendientes por docente
CREATE INDEX idx_alerta_estado ON alerta_riesgo(estado);
CREATE INDEX idx_alerta_docente ON alerta_riesgo(id_docente);

-- ============================================================
-- DATOS INICIALES
-- ============================================================

-- Preguntas de seguridad predeterminadas
INSERT INTO pregunta_seguridad (pregunta) VALUES
    ('¿Cuál es el nombre de tu primera mascota?'),
    ('¿Cuál es tu comida favorita?'),
    ('¿Cuál es tu color favorito?');

-- Curso: Matemática (curso principal del sistema)
INSERT INTO cursos (nombre, descripcion, orden) VALUES
    ('Matemática', 'Curso de Matemática para 1.° de secundaria', 1);

-- Aulas: 1.° A (Grupo Experimental) y 1.° B (Grupo de Control)
INSERT INTO aula (grado, seccion, anio) VALUES
    ('1.° Secundaria', 'A', 2026),
    ('1.° Secundaria', 'B', 2026);

-- Asociar Matemática con ambas aulas
INSERT INTO aula_curso (id_aula, id_curso) VALUES
    (1, 1),
    (2, 1);

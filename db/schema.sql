-- ============================================
-- TABLA USUARIO
-- ============================================

CREATE TABLE Usuario (
    idUsuario        INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    codigo           VARCHAR(9),
    password         VARCHAR(255) NOT NULL,
    correo           VARCHAR(150) UNIQUE NOT NULL,
    rol              VARCHAR(20) NOT NULL,
    estado           VARCHAR(20) DEFAULT 'Activo',
    intentosFallidos INTEGER DEFAULT 0,
    ultimoAcceso     TIMESTAMP,
    avatar           VARCHAR(255)
);

-- ============================================
-- TABLA ESTUDIANTE
-- ============================================

CREATE TABLE Estudiante (
    idEstudiante INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    idAula       INTEGER,
    idUsuario    INTEGER UNIQUE,
    nombre       VARCHAR(255),
    apellido     VARCHAR(255),
    direccion    VARCHAR(255),
    CONSTRAINT fk_estudiante_usuario
        FOREIGN KEY (idUsuario) REFERENCES Usuario(idUsuario)
        ON DELETE CASCADE
);

-- ============================================
-- TABLA DOCENTE
-- ============================================

CREATE TABLE Docente (
    idDocente INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    idUsuario INTEGER UNIQUE,
    nombre    VARCHAR(255),
    apellido  VARCHAR(255),
    direccion VARCHAR(255),
    telefono  VARCHAR(15),
    especialidad VARCHAR(255),
    CONSTRAINT fk_docente_usuario
        FOREIGN KEY (idUsuario) REFERENCES Usuario(idUsuario)
        ON DELETE CASCADE
);

-- ============================================
-- SEGURIDAD
-- ============================================

CREATE TABLE PreguntasSeguridad (
    idPreguntaSeguridad INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    pregunta VARCHAR(255) NOT NULL
);

CREATE TABLE UsuarioPregunta (
    idUsuarioPregunta    INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    idUsuario            INTEGER,
    idPreguntaSeguridad  INTEGER,
    respuestaHash        VARCHAR(255),
    CONSTRAINT fk_up_usuario
        FOREIGN KEY (idUsuario) REFERENCES Usuario(idUsuario)
        ON DELETE CASCADE,
    CONSTRAINT fk_up_pregunta
        FOREIGN KEY (idPreguntaSeguridad)
        REFERENCES PreguntasSeguridad(idPreguntaSeguridad)
        ON DELETE CASCADE
);

CREATE TABLE RecuperarPassword (
    idRecuperacion INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    idUsuario      INTEGER,
    token          VARCHAR(255) NOT NULL,
    fechaExpiracion TIMESTAMP NOT NULL,
    usado          BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_recuperar_usuario
        FOREIGN KEY (idUsuario) REFERENCES Usuario(idUsuario)
        ON DELETE CASCADE
);

-- ============================================
-- ACADEMICO
-- ============================================

CREATE TABLE Aula (
    idAula INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    grado  VARCHAR(50),
    seccion VARCHAR(20)
);

CREATE TABLE Cursos (
    idCurso INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre  VARCHAR(255),
    descripcion VARCHAR(255)
);

CREATE TABLE AulaCurso (
    idAulaCurso INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    idAula  INTEGER,
    idCurso INTEGER,
    CONSTRAINT fk_aulacurso_aula
        FOREIGN KEY (idAula) REFERENCES Aula(idAula)
        ON DELETE CASCADE,
    CONSTRAINT fk_aulacurso_curso
        FOREIGN KEY (idCurso) REFERENCES Cursos(idCurso)
        ON DELETE CASCADE
);

CREATE TABLE Temas (
    idTema  INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    idCurso INTEGER,
    nombreTema VARCHAR(255),
    CONSTRAINT fk_tema_curso
        FOREIGN KEY (idCurso) REFERENCES Cursos(idCurso)
        ON DELETE CASCADE
);

CREATE TABLE AsignacionAula (
    idAsignacion INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    idAula   INTEGER,
    idDocente INTEGER,
    anio     VARCHAR(50),
    CONSTRAINT fk_asignacion_aula
        FOREIGN KEY (idAula) REFERENCES Aula(idAula),
    CONSTRAINT fk_asignacion_docente
        FOREIGN KEY (idDocente) REFERENCES Docente(idDocente)
);

-- ============================================
-- EVALUACION
-- ============================================

CREATE TABLE Evaluacion (
    idEvaluacion INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    idAulaCurso  INTEGER,
    fecha        DATE,
    horaInicio   TIME,
    horaFin      TIME,
    cantPreguntas INTEGER,
    tipoEvaluacion VARCHAR(20) CHECK (tipoEvaluacion IN ('Diagnostico','Bimestral')),
    CONSTRAINT fk_evaluacion_aulacurso
        FOREIGN KEY (idAulaCurso) REFERENCES AulaCurso(idAulaCurso)
        ON DELETE CASCADE
);

CREATE TABLE PreguntaGenerada (
    idPreguntaGenerada INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    idEvaluacion INTEGER,
    idEstudiante INTEGER,
    idTema INTEGER,
    pregunta TEXT,
    nivelDificultad VARCHAR(20) CHECK (nivelDificultad IN ('Bajo','Medio','Alto')),
    respuesta TEXT,
    fechaGeneracion DATE,
    CONSTRAINT fk_pg_evaluacion
        FOREIGN KEY (idEvaluacion) REFERENCES Evaluacion(idEvaluacion)
        ON DELETE CASCADE,
    CONSTRAINT fk_pg_estudiante
        FOREIGN KEY (idEstudiante) REFERENCES Estudiante(idEstudiante)
        ON DELETE CASCADE,
    CONSTRAINT fk_pg_tema
        FOREIGN KEY (idTema) REFERENCES Temas(idTema)
        ON DELETE CASCADE
);

CREATE TABLE RespuestaEstudiante (
    idRespuesta INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    idPreguntaGenerada INTEGER,
    respuesta TEXT,
    esCorrecta BOOLEAN,
    puntaje NUMERIC(5,2),
    fecha DATE,
    CONSTRAINT fk_respuesta_pregunta
        FOREIGN KEY (idPreguntaGenerada)
        REFERENCES PreguntaGenerada(idPreguntaGenerada)
        ON DELETE CASCADE
);

CREATE TABLE ResultadoEvaluacion (
    idResultado INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    idEstudiante INTEGER,
    idEvaluacion INTEGER,
    puntaje NUMERIC(5,2),
    nivelDetectado VARCHAR(20) CHECK (nivelDetectado IN ('Bajo','Medio','Alto')),
    UNIQUE(idEstudiante, idEvaluacion),
    CONSTRAINT fk_resultado_estudiante
        FOREIGN KEY (idEstudiante) REFERENCES Estudiante(idEstudiante)
        ON DELETE CASCADE,
    CONSTRAINT fk_resultado_evaluacion
        FOREIGN KEY (idEvaluacion) REFERENCES Evaluacion(idEvaluacion)
        ON DELETE CASCADE
);

CREATE TABLE RendimientoPorTema (
    idRendimiento INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    idEstudiante INTEGER,
    idTema INTEGER,
    nivelActual VARCHAR(20) CHECK (nivelActual IN ('Bajo','Medio','Alto')),
    promedioTema NUMERIC(5,2),
    ultimaActualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(idEstudiante, idTema),
    CONSTRAINT fk_rendimiento_estudiante
        FOREIGN KEY (idEstudiante) REFERENCES Estudiante(idEstudiante)
        ON DELETE CASCADE,
    CONSTRAINT fk_rendimiento_tema
        FOREIGN KEY (idTema) REFERENCES Temas(idTema)
        ON DELETE CASCADE
);

CREATE TABLE PreferenciaEstudiante (
    idPreferencias INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    idEstudiante INTEGER,
    tipoPreferencias VARCHAR(50),
    valorPreferencias VARCHAR(255),
    CONSTRAINT fk_preferencia_estudiante
        FOREIGN KEY (idEstudiante) REFERENCES Estudiante(idEstudiante)
        ON DELETE CASCADE
);

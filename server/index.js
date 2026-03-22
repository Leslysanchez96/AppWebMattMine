const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const db = require('./db');
require('dotenv').config();

// Configurar transporter de correo
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the AppWebIA API' });
});

// Example route to test database connection
app.get('/api/test-db', async (req, res) => {
    try {
        const result = await db.query('SELECT NOW()');
        res.json({
            message: 'Database connection successful',
            timestamp: result.rows[0].now
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: 'Database connection failed',
            details: err.message
        });
    }
});

// Check tables (temporal)
app.get('/api/check-tables', async (req, res) => {
    try {
        const tables = await db.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        const tableNames = tables.rows.map(r => r.table_name);

        let columns = [];
        if (tableNames.includes('usuario')) {
            const cols = await db.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'usuario'");
            columns = cols.rows.map(r => r.column_name);

            const count = await db.query("SELECT COUNT(*) FROM usuario");
            const sample = await db.query("SELECT codigo, rol, correo FROM usuario WHERE rol IN ('Docente', 'Administrador') LIMIT 10");
            return res.json({ tables: tableNames, usuario_columns: columns, usuario_count: count.rows[0].count, sample: sample.rows });
        }

        res.json({ tables: tableNames, usuario_columns: columns });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Reset admin password (temporal - eliminar en producción)
app.post('/api/reset-admin', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash('Admin@ML2025', 12);
        await db.query("UPDATE usuario SET password = $1 WHERE codigo = 'ADM257528'", [hashedPassword]);
        res.json({ message: 'Password reseteado correctamente' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
    const { codigo, password, rol } = req.body;

    if (!codigo || !password || !rol) {
        return res.status(400).json({ error: 'Código, contraseña y rol son requeridos' });
    }

    try {
        const result = await db.query(
            'SELECT id_usuario, codigo, nombres, apellido, rol, estado FROM usuario WHERE codigo = $1',
            [codigo]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Código o contraseña incorrectos' });
        }

        const usuario = result.rows[0];

        // Verificar si el usuario está bloqueado
        if (usuario.estado === 'Bloqueado') {
            return res.status(403).json({ error: 'Tu cuenta está bloqueada. Contacta al administrador.' });
        }

        if (usuario.estado === 'Inactivo') {
            return res.status(403).json({ error: 'Tu cuenta está inactiva.' });
        }

        // Validar rol según la opción seleccionada
        // Alumno: solo permite rol 'Estudiante'
        // Docente: permite rol 'Docente' y 'Administrador'
        if (rol === 'Alumno' && usuario.rol !== 'Estudiante') {
            return res.status(403).json({ error: 'Este código no corresponde a un alumno. Verifica el perfil seleccionado.' });
        }

        if (rol === 'Docente' && usuario.rol !== 'Docente' && usuario.rol !== 'Administrador') {
            return res.status(403).json({ error: 'Este código no corresponde a un docente.' });
        }

        // Verificar password con bcrypt
        const passResult = await db.query(
            'SELECT password FROM usuario WHERE id_usuario = $1',
            [usuario.id_usuario]
        );

        const validPassword = await bcrypt.compare(password, passResult.rows[0].password);
        if (!validPassword) {
            // Incrementar intentos fallidos
            await db.query(
                'UPDATE usuario SET intentos_fallidos = intentos_fallidos + 1 WHERE id_usuario = $1',
                [usuario.id_usuario]
            );
            return res.status(401).json({ error: 'Código o contraseña incorrectos' });
        }

        // Login exitoso: resetear intentos y actualizar último acceso
        await db.query(
            'UPDATE usuario SET intentos_fallidos = 0, ultimo_acceso = CURRENT_TIMESTAMP WHERE id_usuario = $1',
            [usuario.id_usuario]
        );

        res.json({
            message: 'Login exitoso',
            usuario: {
                id: usuario.id_usuario,
                codigo: usuario.codigo,
                nombres: usuario.nombres,
                apellido: usuario.apellido,
                rol: usuario.rol
            }
        });

    } catch (err) {
        console.error('Error en login:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Recuperar contraseña (Docente/Admin) - envío de correo
app.post('/api/recuperar-password', async (req, res) => {
    const { correo } = req.body;

    if (!correo) {
        return res.status(400).json({ error: 'El correo es requerido' });
    }

    try {
        // Buscar usuario por correo (solo Docente o Administrador)
        const result = await db.query(
            "SELECT id_usuario, nombres, correo, rol FROM usuario WHERE correo = $1 AND rol IN ('Docente', 'Administrador') AND estado = 'Activo'",
            [correo]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No se encontró una cuenta de docente con ese correo.' });
        }

        const usuario = result.rows[0];

        // Generar token único
        const token = crypto.randomBytes(32).toString('hex');

        // Invalidar tokens anteriores del usuario
        await db.query(
            "UPDATE recuperar_password SET usado = TRUE WHERE id_usuario = $1 AND usado = FALSE",
            [usuario.id_usuario]
        );

        // Guardar token en BD (expira en 5 minutos usando hora del servidor PostgreSQL)
        await db.query(
            "INSERT INTO recuperar_password (id_usuario, token, fecha_expiracion) VALUES ($1, $2, NOW() + INTERVAL '5 minutes')",
            [usuario.id_usuario, token]
        );

        // URL de recuperación
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/reset-password?token=${token}`;

        // Enviar correo
        const mailOptions = {
            from: `"MattLearn" <${process.env.EMAIL_USER}>`,
            to: usuario.correo,
            subject: 'Recuperación de Contraseña - MattLearn',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #0A4174, #4E8EA2); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
                        <h1 style="color: #fff; margin: 0; font-size: 28px;">MattLearn</h1>
                        <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0;">Plataforma Educativa</p>
                    </div>
                    <div style="background: #fff; padding: 30px; border: 1px solid #BDD8E9; border-top: none; border-radius: 0 0 16px 16px;">
                        <h2 style="color: #001D39; margin-top: 0;">Hola, ${usuario.nombres}</h2>
                        <p style="color: #49769F; line-height: 1.6;">
                            Recibimos una solicitud para restablecer tu contraseña.
                            Haz clic en el siguiente botón para crear una nueva contraseña:
                        </p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetUrl}" style="background: linear-gradient(135deg, #0A4174, #4E8EA2); color: #fff; text-decoration: none; padding: 14px 40px; border-radius: 10px; font-weight: 700; font-size: 16px; display: inline-block;">
                                Restablecer Contraseña
                            </a>
                        </div>
                        <div style="background: #EBF5FB; border-left: 4px solid #0A4174; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <p style="color: #0A4174; margin: 0; font-size: 14px;">
                                ⏱ Este enlace es válido por <strong>5 minutos</strong>. Si no solicitaste este cambio, ignora este correo.
                            </p>
                        </div>
                        <hr style="border: none; border-top: 1px solid #BDD8E9; margin: 20px 0;">
                        <p style="color: #6EA2B3; font-size: 12px; text-align: center;">
                            Este es un correo automático de MattLearn. No respondas a este mensaje.
                        </p>
                    </div>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);

        res.json({ message: 'Se ha enviado un enlace de recuperación a tu correo institucional.' });

    } catch (err) {
        console.error('Error en recuperación:', err);
        res.status(500).json({ error: 'Error al enviar el correo. Intenta de nuevo.' });
    }
});

// Verificar token de recuperación
app.get('/api/verificar-token/:token', async (req, res) => {
    try {
        const result = await db.query(
            "SELECT rp.id_recuperacion, rp.id_usuario, u.nombres FROM recuperar_password rp JOIN usuario u ON rp.id_usuario = u.id_usuario WHERE rp.token = $1 AND rp.usado = FALSE AND rp.fecha_expiracion > NOW()",
            [req.params.token]
        );

        if (result.rows.length === 0) {
            // Verificar si existe pero expirado o usado
            const check = await db.query("SELECT usado, fecha_expiracion FROM recuperar_password WHERE token = $1", [req.params.token]);
            if (check.rows.length === 0) {
                return res.status(400).json({ error: 'El enlace no es válido.' });
            }
            if (check.rows[0].usado) {
                return res.status(400).json({ error: 'Este enlace ya fue utilizado.' });
            }
            return res.status(400).json({ error: 'El enlace ha expirado. Solicita uno nuevo.' });
        }

        res.json({ valid: true, nombres: result.rows[0].nombres });
    } catch (err) {
        console.error('Error verificar token:', err);
        res.status(500).json({ error: 'Error al verificar el token.' });
    }
});

// Restablecer contraseña con token
app.post('/api/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ error: 'Token y nueva contraseña son requeridos.' });
    }

    if (newPassword.length < 8) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres.' });
    }

    try {
        const result = await db.query(
            "SELECT id_recuperacion, id_usuario FROM recuperar_password WHERE token = $1 AND usado = FALSE AND fecha_expiracion > NOW()",
            [token]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'El enlace ha expirado o no es válido.' });
        }

        const { id_recuperacion, id_usuario } = result.rows[0];

        // Hashear nueva contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        // Actualizar contraseña
        await db.query("UPDATE usuario SET password = $1 WHERE id_usuario = $2", [hashedPassword, id_usuario]);

        // Marcar token como usado
        await db.query("UPDATE recuperar_password SET usado = TRUE WHERE id_recuperacion = $1", [id_recuperacion]);

        res.json({ message: 'Contraseña actualizada correctamente.' });
    } catch (err) {
        console.error('Error al restablecer:', err);
        res.status(500).json({ error: 'Error al restablecer la contraseña.' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

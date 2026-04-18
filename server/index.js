const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Importar rutas
const authRoutes = require('./routes/auth.routes');
const usuarioRoutes = require('./routes/usuario.routes');
const auditoriaRoutes = require('./routes/auditoria.routes');
const perfilRoutes = require('./routes/perfil.routes');
const contenidoRoutes = require('./routes/contenido.routes');
const permisoRoutes = require('./routes/permiso.routes');
const politicaSeguridadRoutes = require('./routes/politicaSeguridad.routes');

const app = express();
const port = process.env.PORT || 3000;

// Middleware global
app.use(cors());
app.use(express.json());

// Servir archivos estáticos (uploads)
app.use(express.static(path.join(__dirname, 'public')));

// Ruta raíz
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the MattLearn API' });
});

// Montar rutas
app.use('/api/auth', authRoutes);
app.use('/api', usuarioRoutes);
app.use('/api/auditoria', auditoriaRoutes);
app.use('/api/perfil', perfilRoutes);
app.use('/api', contenidoRoutes);
app.use('/api/permisos', permisoRoutes);
app.use('/api/politica-seguridad', politicaSeguridadRoutes);

// Ruta de prueba de conexión a BD (temporal)
app.get('/api/test-db', async (req, res) => {
    try {
        const db = require('./db');
        const result = await db.query('SELECT NOW()');
        res.json({
            message: 'Database connection successful',
            timestamp: result.rows[0].now,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: 'Database connection failed',
            details: err.message,
        });
    }
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`MattLearn API running on port ${port}`);
});

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

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

// Capturar IP real cuando se corre detrás de proxies (Nginx, Cloudflare, Genezio, etc.)
app.set('trust proxy', true);

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

// Iniciar servidor
app.listen(port, () => {
    console.log(`MattLearn API running on port ${port}`);
    // Pre-cargar modelo NSFW (background, no bloquea)
    require('./services/nsfw.service').cargarModelo()
        .catch((err) => console.error('No se pudo precargar modelo NSFW:', err.message));
});

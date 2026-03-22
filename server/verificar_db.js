const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function verificarTablas() {
    try {
        const res = await pool.query(`
            SELECT tablename 
            FROM pg_tables 
            WHERE schemaname = 'public' 
            ORDER BY tablename;
        `);

        let output = '\n✅ Conexión exitosa a la base de datos: ' + process.env.DB_NAME + '\n\n';
        output += '📊 Tablas encontradas (' + res.rows.length + '):\n';
        output += '═══════════════════════════════════════\n';
        res.rows.forEach((row, index) => {
            output += `${(index + 1).toString().padStart(2, ' ')}. ${row.tablename}\n`;
        });
        output += '═══════════════════════════════════════\n';

        console.log(output);
        fs.writeFileSync('tablas.txt', output, 'utf8');

        pool.end();
    } catch (err) {
        console.error('❌ Error al conectar con la base de datos:', err.message);
        pool.end();
        process.exit(1);
    }
}

verificarTablas();

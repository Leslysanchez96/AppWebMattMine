const bcrypt = require('bcrypt');
const db = require('./db');
require('dotenv').config();

async function fixPasswords() {
    try {
        // Admin: Admin@ML2025
        const adminHash = await bcrypt.hash('Admin@ML2025', 12);
        await db.query("UPDATE usuario SET password = $1 WHERE codigo = 'ADM257528'", [adminHash]);
        console.log('Admin actualizado');

        // Docente: Docente@ML2025
        const docenteHash = await bcrypt.hash('Docente@ML2025', 12);
        await db.query("UPDATE usuario SET password = $1 WHERE codigo = 'C257512'", [docenteHash]);
        console.log('Docente actualizado');

        // Estudiantes: [codigo]@ML
        const students = await db.query("SELECT id_usuario, codigo FROM usuario WHERE rol = 'Estudiante'");
        for (const student of students.rows) {
            const pass = student.codigo + '@ML';
            const hash = await bcrypt.hash(pass, 12);
            await db.query("UPDATE usuario SET password = $1 WHERE id_usuario = $2", [hash, student.id_usuario]);
        }
        console.log(`${students.rows.length} estudiantes actualizados`);

        console.log('\nCredenciales:');
        console.log('Admin:    ADM257528  /  Admin@ML2025');
        console.log('Docente:  C257512    /  Docente@ML2025');
        console.log('Alumno:   A25719664  /  A25719664@ML');

        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

fixPasswords();

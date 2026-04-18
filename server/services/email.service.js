const transporter = require('../config/email');

async function enviarCorreoRecuperacion(destinatario, nombre, resetUrl) {
    const mailOptions = {
        from: `"MattLearn" <${process.env.EMAIL_USER}>`,
        to: destinatario,
        subject: 'Recuperación de Contraseña - MattLearn',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #0A4174, #4E8EA2); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
                    <h1 style="color: #fff; margin: 0; font-size: 28px;">MattLearn</h1>
                    <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0;">Plataforma Educativa</p>
                </div>
                <div style="background: #fff; padding: 30px; border: 1px solid #BDD8E9; border-top: none; border-radius: 0 0 16px 16px;">
                    <h2 style="color: #001D39; margin-top: 0;">Hola, ${nombre}</h2>
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

    return transporter.sendMail(mailOptions);
}

module.exports = {
    enviarCorreoRecuperacion,
};

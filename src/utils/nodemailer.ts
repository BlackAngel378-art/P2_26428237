import * as dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'Gmail', // Ejemplo con Gmail (requiere configuración especial)
    auth: {
        user:process.env.EMAIL_USER, // Tu correo (ej: tu@gmail.com)
        pass:process.env.EMAIL_PASSWORD, // Contraseña o "App Password" si usas 2FA
    },
});
export const sendEmail = async (
    recipients: string[], // Lista de correos: ['a@test.com', 'b@test.com']
    subject: string,
    htmlContent: string,
) => {
    try {
        const info = await transporter.sendMail({
            from:process.env.EMAIL_USER, // Remitente
            to: recipients.join(', '), // Convierte el array a string separado por comas
            subject,
            html: htmlContent,
        });

        console.log('Correo enviado: %s', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error enviando correo:', error);
        return { success: false, error };
    }
};
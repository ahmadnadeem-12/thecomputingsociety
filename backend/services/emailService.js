/**
 * ============================================
 * Email Service — Nodemailer
 * ============================================
 * Sends styled HTML emails for password reset.
 * Uses Gmail SMTP with App Password.
 * ============================================
 */

const nodemailer = require("nodemailer");

/**
 * Create reusable transporter
 */
function createTransporter() {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
}

/**
 * Send password reset email
 * @param {string} toEmail - Recipient email
 * @param {string} resetUrl - Full reset URL with token
 * @param {string} userName - User's name for personalization
 */
async function sendResetEmail(toEmail, resetUrl, userName) {
    const transporter = createTransporter();

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0f0f1a; color: #fff; }
            .container { max-width: 520px; margin: 0 auto; background: linear-gradient(135deg, #0f0f1a 0%, #1a0a2e 100%); border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); }
            .header { background: linear-gradient(135deg, #dc2743, #c234a5); padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 22px; color: #fff; letter-spacing: 2px; }
            .header p { margin: 5px 0 0; color: rgba(255,255,255,0.8); font-size: 12px; }
            .body { padding: 30px; }
            .greeting { font-size: 16px; margin-bottom: 15px; }
            .message { font-size: 14px; color: #9a8fa6; line-height: 1.6; margin-bottom: 25px; }
            .btn { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #dc2743, #c234a5); color: #fff !important; text-decoration: none; border-radius: 50px; font-weight: 700; font-size: 14px; letter-spacing: 1px; }
            .link-text { font-size: 11px; color: #6b5f78; word-break: break-all; margin-top: 20px; line-height: 1.5; }
            .footer { padding: 20px 30px; border-top: 1px solid rgba(255,255,255,0.06); text-align: center; font-size: 11px; color: #6b5f78; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>THE COMPUTING SOCIETY</h1>
                <p>Department of Computer Science, UAF</p>
            </div>
            <div class="body">
                <div class="greeting">Hi <strong>${userName || "there"}</strong>,</div>
                <div class="message">
                    We received a request to reset your password. Click the button below to set a new password. This link will expire in <strong>15 minutes</strong>.
                </div>
                <div style="text-align: center; margin: 25px 0;">
                    <a href="${resetUrl}" class="btn">Reset Password</a>
                </div>
                <div class="message">
                    If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
                </div>
                <div class="link-text">
                    If the button doesn't work, copy and paste this link:<br/>
                    ${resetUrl}
                </div>
            </div>
            <div class="footer">
                © The Computing Society — UAF<br/>
                This is an automated email. Please do not reply.
            </div>
        </div>
    </body>
    </html>
    `;

    const mailOptions = {
        from: `"The Computing Society" <${process.env.SMTP_USER || process.env.FROM_EMAIL || "noreply@tcs.uaf"}>`,
        to: toEmail,
        subject: "🔐 Reset Your Password — TCS",
        html,
    };

    await transporter.sendMail(mailOptions);
}

module.exports = { sendResetEmail };

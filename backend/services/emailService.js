/**
 * ============================================
 * Email Service — Nodemailer
 * ============================================
 * Sends styled HTML emails for password reset.
 * 
 * MODES:
 *  1. Gmail SMTP — Set SMTP_USER & SMTP_PASS in .env
 *  2. Ethereal (Test) — Auto-creates test account if
 *     SMTP_USER/SMTP_PASS are empty. Preview emails
 *     at the URL logged in the console.
 * ============================================
 */

const nodemailer = require("nodemailer");
const dns = require("dns");

if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder("ipv4first");
}

// Cache the transporter so we only create it once
let cachedTransporter = null;

/**
 * Create reusable transporter
 * Falls back to Ethereal test account when no SMTP creds
 */
async function getTransporter() {
    // Return cached if available
    if (cachedTransporter) return cachedTransporter;

    // If real SMTP credentials are set, use them (Gmail etc.)
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: parseInt(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            tls: {
                rejectUnauthorized: false
            },
            family: 4 // Force IPv4 to bypass Render's IPv6 ENETUNREACH issue
        });

        try {
            await transporter.verify();
            console.log("📧 Email: Using Gmail SMTP (Credentials Verified)");
            cachedTransporter = transporter;
            return cachedTransporter;
        } catch (verifyErr) {
            console.error("❌ SMTP Verification Failed. Gmail App Password might be invalid or revoked:", verifyErr.message);
            console.log("⚠️ Falling back to Ethereal Test Account...");
        }
    }

    // No credentials — create Ethereal test account automatically (never cache Ethereal fallback)
    console.log("📧 Email: No SMTP credentials found — creating Ethereal test account...");

    const testAccount = await nodemailer.createTestAccount();

    const etherealTransporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass,
        },
    });

    console.log("✅ Ethereal test account created:");
    console.log(`   📧 User: ${testAccount.user}`);
    console.log(`   🔑 Pass: ${testAccount.pass}`);
    console.log("   🌐 Preview emails at: https://ethereal.email/login");
    console.log("");

    return etherealTransporter;
}

const https = require("https");

async function sendEmailViaBrevo(toEmail, subject, html) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            sender: { 
                name: "The Computing Society", 
                email: process.env.SMTP_USER || "thecomputingsocietyuaf@gmail.com" 
            },
            to: [{ email: toEmail }],
            subject: subject,
            htmlContent: html
        });

        const options = {
            hostname: "api.brevo.com",
            port: 443,
            path: "/v3/smtp/email",
            method: "POST",
            headers: {
                "api-key": process.env.BREVO_API_KEY,
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(data)
            }
        };

        const req = https.request(options, (res) => {
            let responseData = "";
            res.on("data", (chunk) => {
                responseData += chunk;
            });
            res.on("end", () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve(JSON.parse(responseData));
                    } catch (e) {
                        resolve({ success: true, message: responseData });
                    }
                } else {
                    reject(new Error(`Brevo API Error: ${res.statusCode} - ${responseData}`));
                }
            });
        });

        req.on("error", (err) => {
            reject(err);
        });

        req.write(data);
        req.end();
    });
}

/**
 * Send password reset email
 * @param {string} toEmail - Recipient email
 * @param {string} resetUrl - Full reset URL with token
 * @param {string} userName - User's name for personalization
 */
async function sendResetEmail(toEmail, resetUrl, userName) {

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
                &copy; The Computing Society — UAF<br/>
                This is an automated email. Please do not reply.
            </div>
        </div>
    </body>
    </html>
    `;

    if (process.env.BREVO_API_KEY) {
        console.log(`📧 Sending Reset Email via Brevo HTTP API to: ${toEmail}`);
        return await sendEmailViaBrevo(toEmail, "🔐 Reset Your Password — TCS", html);
    }

    const transporter = await getTransporter();

    const mailOptions = {
        from: `"The Computing Society" <${process.env.SMTP_USER || "noreply@tcs.uaf"}>`,
        to: toEmail,
        subject: "🔐 Reset Your Password — TCS",
        html,
    };

    const info = await transporter.sendMail(mailOptions);

    // If using Ethereal, log the preview URL
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
        console.log("");
        console.log("============================================");
        console.log("  📬 EMAIL SENT (Ethereal Test Mode)");
        console.log("============================================");
        console.log(`  👤 To:      ${toEmail}`);
        console.log(`  🔗 Preview: ${previewUrl}`);
        console.log("============================================");
        console.log("");
    } else {
        console.log(`📧 Reset email sent to: ${toEmail}`);
    }

    return info;
}

/**
 * Generic send email function
 * @param {Object} options - { email, subject, message, html }
 */
async function sendEmail(options) {

    // Wrap custom HTML or use message
    const innerContent = options.html || `<div class="message">${options.message}</div>`;

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0f0f1a; color: #fff; }
            .container { max-width: 520px; margin: 0 auto; background: linear-gradient(135deg, #0f0f1a 0%, #1a0a2e 100%); border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 10px 40px rgba(0,0,0,0.4); }
            .header { background: linear-gradient(135deg, #dc2743, #c234a5); padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 22px; color: #fff; letter-spacing: 2px; }
            .body { padding: 35px; }
            .greeting { font-size: 18px; margin-bottom: 15px; color: #fff; }
            .message { font-size: 15px; color: #9a8fa6; line-height: 1.7; margin-bottom: 25px; }
            .footer { padding: 20px 30px; border-top: 1px solid rgba(255,255,255,0.06); text-align: center; font-size: 11px; color: #6b5f78; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>THE COMPUTING SOCIETY</h1>
            </div>
            <div class="body">
                <div class="greeting">Greetings,</div>
                ${innerContent}
            </div>
            <div class="footer">
                &copy; The Computing Society — UAF<br/>
                This is an automated security email.
            </div>
        </div>
    </body>
    </html>
    `;

    if (process.env.BREVO_API_KEY) {
        console.log(`📧 Sending Email via Brevo HTTP API to: ${options.email}`);
        return await sendEmailViaBrevo(options.email, options.subject || "Verification — TCS", html);
    }

    const transporter = await getTransporter();

    const mailOptions = {
        from: `"The Computing Society" <${process.env.SMTP_USER || "noreply@tcs.uaf"}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html,
    };

    const info = await transporter.sendMail(mailOptions);
    
    // Log preview link if on Ethereal
    if (nodemailer.getTestMessageUrl(info)) {
        console.log(`📬 Verification Email Preview: ${nodemailer.getTestMessageUrl(info)}`);
    }

    return info;
}

module.exports = { sendResetEmail, sendEmail };

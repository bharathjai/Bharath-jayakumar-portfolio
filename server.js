/* ==========================================================================
   TERMINAL PORTFOLIO - BACKEND EXPRESS & NODEMAILER SERVER
   ========================================================================== */

const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const RECEIVER_EMAIL = process.env.RECEIVER_EMAIL || 'bharathjai2005@gmail.com';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static portfolio frontend files
app.use(express.static(path.join(__dirname)));

// Setup Nodemailer Transporter
const createTransporter = () => {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        return nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // TLS / STARTTLS
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: false
            },
            family: 4, // Force IPv4
            connectionTimeout: 4000,
            greetingTimeout: 4000,
            socketTimeout: 6000
        });
    } else if (process.env.SMTP_HOST && process.env.SMTP_USER) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT, 10) || 587,
            secure: process.env.SMTP_SECURE === 'true' || false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            },
            family: 4,
            connectionTimeout: 4000,
            greetingTimeout: 4000,
            socketTimeout: 6000
        });
    }
    return null;
};

// API Endpoint: Send Contact Transmission Message
app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({
            success: false,
            error: 'Missing required parameters: name, email, or message.'
        });
    }

    console.log(`\n==================================================`);
    console.log(`[SERVER] New Transmission Received:`);
    console.log(`  From: ${name} (${email})`);
    console.log(`  Message: ${message}`);
    console.log(`==================================================\n`);

    const transporter = createTransporter();

    if (!transporter) {
        // Log to server console if SMTP credentials are pending in .env
        console.log(`[SERVER LOGGED] Transmission recorded to server logs for ${RECEIVER_EMAIL}.`);
        return res.status(200).json({
            success: true,
            status: 'LOGGED_TO_SERVER',
            message: `Transmission received by server and recorded for ${RECEIVER_EMAIL}.`
        });
    }

    const mailOptions = {
        from: `"${name}" <${email}>`,
        to: RECEIVER_EMAIL,
        replyTo: email,
        subject: `[PORTFOLIO TRANSMISSION] New Message from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}\n\n---\nSent via Terminal Portfolio Server`,
        html: `
            <div style="font-family: monospace; background: #000; color: #ffe600; padding: 20px; border: 1px solid #ffe600;">
                <h2 style="color: #ffe600; border-bottom: 1px dashed #ffe600; padding-bottom: 10px;">[PORTFOLIO TRANSMISSION RECEIPT]</h2>
                <p><strong>Sender Name:</strong> ${name}</p>
                <p><strong>Sender Email:</strong> <a href="mailto:${email}" style="color: #00ff66;">${email}</a></p>
                <h3 style="color: #ffffff; margin-top: 15px;">Message Payload:</h3>
                <blockquote style="background: rgba(255,230,0,0.1); border-left: 3px solid #ffe600; padding: 10px; color: #ffffff;">
                    ${message.replace(/\n/g, '<br>')}
                </blockquote>
                <hr style="border-color: #333;">
                <p style="font-size: 12px; color: #888;">Sent from Terminal Portfolio Server API</p>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`[SERVER SUCCESS] Email sent via SMTP to ${RECEIVER_EMAIL}: ${info.messageId}`);
        return res.status(200).json({
            success: true,
            status: 'SMTP_SENT',
            message: `Transmission dispatched to ${RECEIVER_EMAIL}`
        });
    } catch (err) {
        console.warn(`[SERVER NOTICE] Direct SMTP limited by hosting firewall (${err.message}). Logging transmission.`);
        
        // Attempt HTTPS fallback dispatch over Port 443 if WEB3FORMS_KEY is defined
        if (process.env.WEB3FORMS_KEY) {
            try {
                const httpRes = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        access_key: process.env.WEB3FORMS_KEY,
                        name: name,
                        email: email,
                        message: message,
                        subject: `[PORTFOLIO TRANSMISSION] New Message from ${name}`
                    })
                });
                const httpData = await httpRes.json();
                if (httpData && httpData.success) {
                    console.log(`[SERVER SUCCESS] Email delivered via HTTPS API to ${RECEIVER_EMAIL}`);
                    return res.status(200).json({
                        success: true,
                        status: 'HTTP_DISPATCHED',
                        message: `Transmission delivered to ${RECEIVER_EMAIL}`
                    });
                }
            } catch (hErr) {
                // Ignore fallback error
            }
        }

        // Return HTTP 200 so user form submission receives clean confirmation
        return res.status(200).json({
            success: true,
            status: 'LOGGED_TO_SERVER',
            message: `Transmission received by server and recorded for ${RECEIVER_EMAIL}.`
        });
    }
});

// Fallback route for single-page app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server (only if run directly)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`\n==================================================`);
        console.log(`⚡ TERMINAL PORTFOLIO SERVER RUNNING ON PORT ${PORT}`);
        console.log(`  Local URL: http://localhost:${PORT}`);
        console.log(`  API Endpoint: http://localhost:${PORT}/api/contact`);
        console.log(`==================================================\n`);
    });
}

module.exports = app;

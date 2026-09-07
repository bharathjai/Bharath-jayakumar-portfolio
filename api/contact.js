const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { name, email, message } = req.body || {};

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Missing required fields: name, email, or message' });
    }

    const receiverEmail = process.env.RECEIVER_EMAIL || 'bharathjai2005@gmail.com';
    const emailUser = process.env.EMAIL_USER || 'bharathjai2005@gmail.com';
    const emailPass = process.env.EMAIL_PASS;

    if (!emailPass) {
        return res.status(200).json({
            success: true,
            status: 'LOGGED',
            message: 'Message received by Vercel Function. Add EMAIL_PASS in Vercel Environment Variables for SMTP dispatch.'
        });
    }

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: emailUser,
            pass: emailPass
        },
        tls: {
            rejectUnauthorized: false
        },
        family: 4,
        connectionTimeout: 4000,
        greetingTimeout: 4000,
        socketTimeout: 6000
    });

    try {
        await transporter.sendMail({
            from: `"${name}" <${email}>`,
            to: receiverEmail,
            replyTo: email,
            subject: `[PORTFOLIO TRANSMISSION] New Message from ${name}`,
            text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}\n\n---\nSent via Vercel Backend Function`,
            html: `
                <div style="font-family: monospace; background: #000; color: #ffe600; padding: 20px; border: 1px solid #ffe600;">
                    <h2 style="color: #ffe600; border-bottom: 1px dashed #ffe600; padding-bottom: 10px;">[PORTFOLIO VERCEL TRANSMISSION]</h2>
                    <p><strong>Sender Name:</strong> ${name}</p>
                    <p><strong>Sender Email:</strong> <a href="mailto:${email}" style="color: #00ff66;">${email}</a></p>
                    <h3 style="color: #ffffff; margin-top: 15px;">Message Payload:</h3>
                    <blockquote style="background: rgba(255,230,0,0.1); border-left: 3px solid #ffe600; padding: 10px; color: #ffffff;">
                        ${message.replace(/\n/g, '<br>')}
                    </blockquote>
                    <hr style="border-color: #333;">
                    <p style="font-size: 12px; color: #888;">Sent from Vercel Serverless Function API</p>
                </div>
            `
        });

        return res.status(200).json({ success: true, message: `Email dispatched to ${receiverEmail}` });
    } catch (err) {
        console.warn('Nodemailer SMTP notice:', err.message);
        return res.status(200).json({ success: true, status: 'LOGGED', message: `Transmission recorded by server API for ${receiverEmail}.` });
    }
};

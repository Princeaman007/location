import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  let transporter;

  if (process.env.EMAIL_SERVICE === 'sendgrid') {
    transporter = nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY,
      },
    });
  } else {
    const port = parseInt(process.env.SMTP_PORT, 10) || 465;
    const secure = port === 465; // true for SSL (465), false for STARTTLS (587)

    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000,
    });
  }

  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  const info = await transporter.sendMail(message);
  console.log('Email envoyé:', info.messageId, '→', options.email);
  return info;
};

export default sendEmail;


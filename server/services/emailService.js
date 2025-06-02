// server/services/emailService.js
require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendMail(to, subject, html) {
  const mailOptions = {
    from: `"No-Reply" <${process.env.EMAIL_USER}>`,
    to: to,
    subject: subject,
    html: html,
  };
  return await transporter.sendMail(mailOptions);
}

module.exports = { sendMail };

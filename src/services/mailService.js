const nodemailer = require('nodemailer');
const env = require('../config/env');

let transporter;

function getTransporter() {
  if (transporter) return transporter;
  if (!env.mail.host || !env.mail.user || !env.mail.pass) {
    transporter = nodemailer.createTransport({ jsonTransport: true });
    return transporter;
  }
  transporter = nodemailer.createTransport({
    host: env.mail.host,
    port: env.mail.port,
    secure: env.mail.secure,
    auth: { user: env.mail.user, pass: env.mail.pass }
  });
  return transporter;
}

async function sendDonationReceipt({ to, donorName, amount, projectTitle, receiptRef }) {
  if (!to) return;
  await getTransporter().sendMail({
    from: env.mail.from,
    to,
    subject: `Reçu de don ${receiptRef}`,
    text: `Bonjour ${donorName},\n\nMerci pour votre don de ${amount} USD pour le projet "${projectTitle}".\nRéférence: ${receiptRef}\n\nONGConnect`
  });
}

module.exports = { sendDonationReceipt };

import 'dotenv/config';
import nodemailer from 'nodemailer';

export const sendEmail = async ({ to, subject, text, html }) => {
  const user = process.env.EMAIL_ADMIN;
  const password = process.env.EMAIL_ADMIN_PASSWORD;
  const hasText = typeof text === 'string' && text.trim().length > 0;
  const hasHtml = typeof html === 'string' && html.trim().length > 0;

  if (!user || !password) {
    throw new Error('Faltan las variables EMAIL_ADMIN y EMAIL_ADMIN_PASSWORD.');
  }

  if (
    typeof to !== 'string' ||
    !to.trim() ||
    typeof subject !== 'string' ||
    !subject.trim() ||
    (!hasText && !hasHtml)
  ) {
    throw new TypeError('Se requieren to, subject y al menos uno entre text o html.');
  }

  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: { user, pass: password },
  });

  return transporter.sendMail({
    from: user,
    to,
    subject,
    text,
    html,
  });
};
import nodemailer from 'nodemailer';
import { env } from './env';

export const mailer = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

// Verify connection at startup
export async function verifyMailer(): Promise<void> {
  if (env.NODE_ENV === 'test') return;
  try {
    await mailer.verify();
    console.info('✅ Mailer connection established');
  } catch (error) {
    console.warn('⚠️  Mailer connection failed — emails will not be sent:', error);
  }
}

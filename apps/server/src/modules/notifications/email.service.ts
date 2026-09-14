import { mailer } from '../../config/mailer';
import { env } from '../../config/env';
import { logger } from '../../core/logger';

export class EmailService {
  private readonly fromAddress = `"${env.EMAIL_FROM_NAME}" <${env.EMAIL_FROM_ADDRESS}>`;

  async sendVerificationEmail(
    to: string,
    firstName: string,
    token: string,
  ): Promise<void> {
    const verifyUrl = `${env.APP_URL}/auth/verify-email?token=${token}`;
    await this.send({
      to,
      subject: 'Verify your RDIS account',
      html: this.verificationTemplate(firstName, verifyUrl),
    });
  }

  async sendPasswordResetEmail(
    to: string,
    name: string,
    token: string,
  ): Promise<void> {
    const resetUrl = `${env.APP_URL}/auth/reset-password?token=${token}`;
    await this.send({
      to,
      subject: 'Reset your RDIS password',
      html: this.resetPasswordTemplate(name, resetUrl),
    });
  }

  async sendWelcomeEmail(to: string, firstName: string): Promise<void> {
    await this.send({
      to,
      subject: 'Welcome to RDIS — Rukmani Devi International School',
      html: this.welcomeTemplate(firstName),
    });
  }

  async sendBadgeEarnedEmail(
    to: string,
    firstName: string,
    badgeName: string,
    badgeDescription: string,
  ): Promise<void> {
    await this.send({
      to,
      subject: `🏅 You earned the "${badgeName}" badge!`,
      html: this.badgeEarnedTemplate(firstName, badgeName, badgeDescription),
    });
  }

  // -------------------------------------------------------------------------
  // Private
  // -------------------------------------------------------------------------

  private async send(options: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    try {
      await mailer.sendMail({
        from: this.fromAddress,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });
      logger.info('Email sent', { to: options.to, subject: options.subject });
    } catch (err) {
      logger.error('Failed to send email', { err, to: options.to });
      throw err;
    }
  }

  // -------------------------------------------------------------------------
  // HTML templates — minimal, professional design
  // -------------------------------------------------------------------------

  private baseTemplate(content: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>RDIS</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
           background: #F8FAFC; color: #111827; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #fff;
               border-radius: 12px; overflow: hidden;
               box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .header { background: #2563EB; padding: 32px 40px; }
    .header h1 { color: #fff; font-size: 22px; font-weight: 700; letter-spacing: -0.3px; }
    .header p { color: rgba(255,255,255,0.75); font-size: 14px; margin-top: 4px; }
    .body { padding: 40px; }
    .body p { color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 16px; }
    .btn { display: inline-block; background: #2563EB; color: #fff !important;
           text-decoration: none; padding: 14px 28px; border-radius: 8px;
           font-size: 15px; font-weight: 600; margin: 8px 0 24px; }
    .note { font-size: 13px !important; color: #6B7280 !important; }
    .footer { padding: 24px 40px; border-top: 1px solid #E5E7EB;
              color: #9CA3AF; font-size: 13px; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>RDIS — Rukmani Devi International School</h1>
      <p>Learning Management System</p>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Rukmani Devi International School. All rights reserved.</p>
      <p>If you did not request this email, you can safely ignore it.</p>
    </div>
  </div>
</body>
</html>`;
  }

  private verificationTemplate(firstName: string, url: string): string {
    return this.baseTemplate(`
      <p>Hi ${firstName},</p>
      <p>Welcome to RDIS! Please verify your email address to activate your account and start learning.</p>
      <a href="${url}" class="btn">Verify Email Address</a>
      <p class="note">This link expires in 24 hours. If you did not create an account, no action is required.</p>
    `);
  }

  private resetPasswordTemplate(name: string, url: string): string {
    return this.baseTemplate(`
      <p>Hi ${name},</p>
      <p>We received a request to reset the password for your RDIS account. Click the button below to set a new password.</p>
      <a href="${url}" class="btn">Reset Password</a>
      <p class="note">This link expires in 30 minutes. If you did not request a password reset, please ignore this email — your password will not change.</p>
    `);
  }

  private welcomeTemplate(firstName: string): string {
    return this.baseTemplate(`
      <p>Hi ${firstName},</p>
      <p>Your account is verified and ready to go! You can now log in to RDIS and start your learning journey.</p>
      <a href="${env.APP_URL}/login" class="btn">Go to Dashboard</a>
      <p>Earn XP, unlock badges, and climb the leaderboard. Good luck!</p>
    `);
  }

  private badgeEarnedTemplate(
    firstName: string,
    badgeName: string,
    description: string,
  ): string {
    return this.baseTemplate(`
      <p>Hi ${firstName},</p>
      <p>Congratulations! You just earned a new badge:</p>
      <p><strong>🏅 ${badgeName}</strong></p>
      <p>${description}</p>
      <a href="${env.APP_URL}/student/achievements" class="btn">View My Achievements</a>
    `);
  }
}

import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpHost || !smtpUser || !smtpPass) {
      this.logger.warn('SMTP configuration incomplete. Email sending will be disabled.');
      this.logger.warn('Required: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    this.logger.log('Email transporter initialized with Brevo/SMTP');
  }

  /**
   * Generate OTP email HTML template
   */
  generateOtpEmailHtml(otp: string, purpose: 'login' | 'signup'): string {
    const title = purpose === 'signup' ? 'Welcome to Bhoomisetu' : 'Login to Bhoomisetu';
    const greeting = purpose === 'signup' ? 'Welcome!' : 'Hello!';
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%); border-radius: 8px 8px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Bhoomisetu</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px; font-weight: 600;">${greeting}</h2>
                            <p style="margin: 0 0 30px; color: #666666; font-size: 16px; line-height: 1.6;">
                                ${purpose === 'signup' 
                                  ? 'Thank you for signing up! Please use the verification code below to complete your registration.' 
                                  : 'Use the verification code below to sign in to your account.'}
                            </p>
                            
                            <!-- OTP Code Box -->
                            <table role="presentation" style="width: 100%; margin: 30px 0;">
                                <tr>
                                    <td align="center">
                                        <div style="background-color: #f8f9fa; border: 2px dashed #2196F3; border-radius: 8px; padding: 30px; margin: 20px 0;">
                                            <div style="color: #666666; font-size: 14px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px;">Verification Code</div>
                                            <div style="color: #2196F3; font-size: 36px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</div>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 20px 0 0; color: #999999; font-size: 14px; line-height: 1.6;">
                                This code will expire in <strong>10 minutes</strong>. If you didn't request this code, please ignore this email.
                            </p>
                            
                            <!-- Security Tip -->
                            <div style="margin-top: 40px; padding: 20px; background-color: #f8f9fa; border-radius: 6px; border-left: 4px solid #2196F3;">
                                <p style="margin: 0; color: #666666; font-size: 14px; line-height: 1.6;">
                                    <strong style="color: #333333;">Security Tip:</strong> Never share this code with anyone. Bhoomisetu will never ask for your verification code.
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; text-align: center; background-color: #f8f9fa; border-radius: 0 0 8px 8px;">
                            <p style="margin: 0 0 10px; color: #999999; font-size: 14px;">
                                This is an automated message. Please do not reply to this email.
                            </p>
                            <p style="margin: 0; color: #999999; font-size: 12px;">
                                © ${new Date().getFullYear()} Bhoomisetu. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
  }

  /**
   * Generate password reset email HTML template
   */
  generatePasswordResetEmailHtml(resetLink: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%); border-radius: 8px 8px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Bhoomisetu</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px; font-weight: 600;">Reset Your Password</h2>
                            <p style="margin: 0 0 30px; color: #666666; font-size: 16px; line-height: 1.6;">
                                We received a request to reset your password. Click the button below to create a new password.
                            </p>
                            
                            <!-- Reset Button -->
                            <table role="presentation" style="width: 100%; margin: 30px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="${resetLink}" style="display: inline-block; background-color: #2196F3; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 6px; font-size: 16px; font-weight: 600; margin: 20px 0;">
                                            Reset Password
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 20px 0 0; color: #999999; font-size: 14px; line-height: 1.6;">
                                This link will expire in <strong>1 hour</strong>. If you didn't request a password reset, please ignore this email.
                            </p>
                            
                            <!-- Alternative Link -->
                            <p style="margin: 30px 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                                If the button doesn't work, copy and paste this link into your browser:
                            </p>
                            <p style="margin: 10px 0; color: #2196F3; font-size: 12px; word-break: break-all;">
                                ${resetLink}
                            </p>
                            
                            <!-- Security Tip -->
                            <div style="margin-top: 40px; padding: 20px; background-color: #f8f9fa; border-radius: 6px; border-left: 4px solid #FF9800;">
                                <p style="margin: 0; color: #666666; font-size: 14px; line-height: 1.6;">
                                    <strong style="color: #333333;">Security Tip:</strong> If you didn't request this password reset, please secure your account immediately.
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; text-align: center; background-color: #f8f9fa; border-radius: 0 0 8px 8px;">
                            <p style="margin: 0 0 10px; color: #999999; font-size: 14px;">
                                This is an automated message. Please do not reply to this email.
                            </p>
                            <p style="margin: 0; color: #999999; font-size: 12px;">
                                © ${new Date().getFullYear()} Bhoomisetu. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
  }

  /**
   * Generate plain text version of OTP email
   */
  generateOtpEmailText(otp: string, purpose: 'login' | 'signup'): string {
    const greeting = purpose === 'signup' ? 'Welcome!' : 'Hello!';
    return `
${greeting}

${purpose === 'signup' 
  ? 'Thank you for signing up! Please use the verification code below to complete your registration.' 
  : 'Use the verification code below to sign in to your account.'}

Verification Code: ${otp}

This code will expire in 10 minutes. If you didn't request this code, please ignore this email.

Security Tip: Never share this code with anyone. Bhoomisetu will never ask for your verification code.

© ${new Date().getFullYear()} Bhoomisetu. All rights reserved.
    `.trim();
  }

  /**
   * Generate plain text version of password reset email
   */
  generatePasswordResetEmailText(resetLink: string): string {
    return `
Reset Your Password

We received a request to reset your password. Click the link below to create a new password:

${resetLink}

This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.

Security Tip: If you didn't request this password reset, please secure your account immediately.

© ${new Date().getFullYear()} Bhoomisetu. All rights reserved.
    `.trim();
  }

  /**
   * Send email using Brevo SMTP
   */
  async sendEmail(to: string, subject: string, html: string, text: string): Promise<void> {
    const fromEmail = process.env.MAIL_FROM || process.env.SMTP_USER || 'noreply@bhoomisetu.com';

    if (!this.transporter) {
      this.logger.error('Email transporter not initialized. Check SMTP configuration.');
      throw new Error('Email service not configured. Please check SMTP settings.');
    }

    try {
      const info = await this.transporter.sendMail({
        from: `Bhoomisetu <${fromEmail}>`,
        to,
        subject,
        text,
        html,
      });

      this.logger.log(`Email sent successfully to ${to}. Message ID: ${info.messageId}`);
    } catch (error: any) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * Send OTP email
   */
  async sendOtpEmail(email: string, otp: string, purpose: 'login' | 'signup'): Promise<void> {
    const subject = purpose === 'signup' 
      ? 'Welcome to Bhoomisetu - Verify Your Email'
      : 'Bhoomisetu - Your Login Verification Code';
    
    const html = this.generateOtpEmailHtml(otp, purpose);
    const text = this.generateOtpEmailText(otp, purpose);

    await this.sendEmail(email, subject, html, text);
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, resetLink: string): Promise<void> {
    const subject = 'Reset Your Bhoomisetu Password';
    const html = this.generatePasswordResetEmailHtml(resetLink);
    const text = this.generatePasswordResetEmailText(resetLink);

    await this.sendEmail(email, subject, html, text);
  }
}

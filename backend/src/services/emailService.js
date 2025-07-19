const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    // Create transporter for development (using ethereal email)
    if (process.env.NODE_ENV === 'development') {
      this.transporter = nodemailer.createTransporter({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER || 'test@ethereal.email',
          pass: process.env.SMTP_PASS || 'test123',
        },
      });
    } else {
      // Production email configuration
      this.transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }
  }

  async sendEmail(options) {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@xcompany.com',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      logger.info(`Email sent successfully to ${options.to}`);
      
      if (process.env.NODE_ENV === 'development') {
        logger.info('Preview URL: ' + nodemailer.getTestMessageUrl(info));
      }
      
      return info;
    } catch (error) {
      logger.error('Email sending failed:', error);
      throw error;
    }
  }

  async sendPasswordResetEmail(user, resetToken) {
    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>Hello ${user.name},</p>
        <p>You requested a password reset for your X Company attendance account.</p>
        <p>Click the button below to reset your password:</p>
        <a href="${resetURL}" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0;">
          Reset Password
        </a>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${resetURL}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this password reset, please ignore this email.</p>
        <p>Best regards,<br>X Company IT Team</p>
      </div>
    `;

    const text = `
      Password Reset Request
      
      Hello ${user.name},
      
      You requested a password reset for your X Company attendance account.
      
      Click the link below to reset your password:
      ${resetURL}
      
      This link will expire in 1 hour.
      
      If you didn't request this password reset, please ignore this email.
      
      Best regards,
      X Company IT Team
    `;

    return this.sendEmail({
      to: user.email,
      subject: 'Password Reset Request - X Company',
      html,
      text,
    });
  }

  async sendWelcomeEmail(user) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to X Company!</h2>
        <p>Hello ${user.name},</p>
        <p>Welcome to the X Company attendance management system!</p>
        <p>Your account has been successfully created with the following details:</p>
        <ul>
          <li><strong>Employee ID:</strong> ${user.employeeId}</li>
          <li><strong>Email:</strong> ${user.email}</li>
          <li><strong>Department:</strong> ${user.department}</li>
          <li><strong>Role:</strong> ${user.role}</li>
        </ul>
        <p>You can now log in to the system and start using the attendance features.</p>
        <p>If you have any questions, please contact your administrator.</p>
        <p>Best regards,<br>X Company IT Team</p>
      </div>
    `;

    const text = `
      Welcome to X Company!
      
      Hello ${user.name},
      
      Welcome to the X Company attendance management system!
      
      Your account has been successfully created with the following details:
      - Employee ID: ${user.employeeId}
      - Email: ${user.email}
      - Department: ${user.department}
      - Role: ${user.role}
      
      You can now log in to the system and start using the attendance features.
      
      If you have any questions, please contact your administrator.
      
      Best regards,
      X Company IT Team
    `;

    return this.sendEmail({
      to: user.email,
      subject: 'Welcome to X Company Attendance System',
      html,
      text,
    });
  }

  async sendAccountDeactivationEmail(user) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc3545;">Account Deactivated</h2>
        <p>Hello ${user.name},</p>
        <p>Your X Company attendance account has been deactivated by an administrator.</p>
        <p>If you believe this is an error, please contact your administrator immediately.</p>
        <p>Best regards,<br>X Company IT Team</p>
      </div>
    `;

    const text = `
      Account Deactivated
      
      Hello ${user.name},
      
      Your X Company attendance account has been deactivated by an administrator.
      
      If you believe this is an error, please contact your administrator immediately.
      
      Best regards,
      X Company IT Team
    `;

    return this.sendEmail({
      to: user.email,
      subject: 'Account Deactivated - X Company',
      html,
      text,
    });
  }

  async sendAccountActivationEmail(user) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #28a745;">Account Activated</h2>
        <p>Hello ${user.name},</p>
        <p>Your X Company attendance account has been activated by an administrator.</p>
        <p>You can now log in to the system and access your account.</p>
        <p>Best regards,<br>X Company IT Team</p>
      </div>
    `;

    const text = `
      Account Activated
      
      Hello ${user.name},
      
      Your X Company attendance account has been activated by an administrator.
      
      You can now log in to the system and access your account.
      
      Best regards,
      X Company IT Team
    `;

    return this.sendEmail({
      to: user.email,
      subject: 'Account Activated - X Company',
      html,
      text,
    });
  }

  async sendSecurityAlert(user, action, details) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ffc107;">Security Alert</h2>
        <p>Hello ${user.name},</p>
        <p>A security alert has been triggered for your account:</p>
        <ul>
          <li><strong>Action:</strong> ${action}</li>
          <li><strong>Details:</strong> ${details}</li>
          <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
        </ul>
        <p>If this was not you, please contact your administrator immediately.</p>
        <p>Best regards,<br>X Company IT Team</p>
      </div>
    `;

    const text = `
      Security Alert
      
      Hello ${user.name},
      
      A security alert has been triggered for your account:
      - Action: ${action}
      - Details: ${details}
      - Time: ${new Date().toLocaleString()}
      
      If this was not you, please contact your administrator immediately.
      
      Best regards,
      X Company IT Team
    `;

    return this.sendEmail({
      to: user.email,
      subject: 'Security Alert - X Company',
      html,
      text,
    });
  }
}

module.exports = new EmailService(); 
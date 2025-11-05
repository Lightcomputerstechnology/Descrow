// services/email.service.js
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Send verification email to new users
 */
exports.sendVerificationEmail = async (email, name, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  
  try {
    const emailData = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Verify Your Email - Dealcross',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6; 
              color: #333; 
              margin: 0;
              padding: 0;
              background-color: #f4f4f7;
            }
            .container { 
              max-width: 600px; 
              margin: 40px auto; 
              background: white;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 40px 20px;
              text-align: center;
            }
            .header h1 {
              color: white;
              margin: 0;
              font-size: 28px;
              font-weight: 700;
            }
            .logo {
              font-size: 48px;
              margin-bottom: 10px;
            }
            .content {
              padding: 40px 30px;
            }
            .content h2 {
              color: #333;
              margin-top: 0;
              font-size: 24px;
            }
            .content p {
              font-size: 16px;
              color: #555;
              margin: 15px 0;
            }
            .button { 
              display: inline-block; 
              padding: 16px 32px; 
              background-color: #667eea; 
              color: white !important; 
              text-decoration: none; 
              border-radius: 8px; 
              margin: 24px 0;
              font-weight: 600;
              text-align: center;
            }
            .button:hover {
              background-color: #5568d3;
            }
            .button-container {
              text-align: center;
              margin: 30px 0;
            }
            .footer { 
              margin-top: 30px; 
              padding-top: 30px;
              border-top: 1px solid #e0e0e0;
              font-size: 12px; 
              color: #666;
              text-align: center;
            }
            .link-box {
              background: #f8f9fa;
              padding: 15px;
              border-radius: 6px;
              margin: 20px 0;
              word-break: break-all;
              font-size: 13px;
              color: #666;
              border: 1px solid #e0e0e0;
            }
            .info-text {
              font-size: 14px;
              color: #777;
              margin-top: 20px;
            }
            .warning-text {
              font-size: 14px;
              color: #999;
              margin-top: 30px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🛡️</div>
              <h1>Dealcross</h1>
            </div>
            <div class="content">
              <h2>Hello ${name}!</h2>
              <p>
                Thank you for registering with <strong>Dealcross</strong>. We're excited to have you on board!
              </p>
              <p>
                Please verify your email address to activate your account and start using our secure escrow platform.
              </p>
              
              <div class="button-container">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </div>
              
              <p class="info-text">
                Or copy and paste this link into your browser:
              </p>
              <div class="link-box">
                ${verificationUrl}
              </div>
              
              <p class="warning-text">
                ⏱️ This verification link will expire in 24 hours for security reasons.
              </p>
              
              <div class="footer">
                <p><strong>Important:</strong> If you didn't create an account with Dealcross, please ignore this email.</p>
                <p>&copy; ${new Date().getFullYear()} Dealcross. All rights reserved.</p>
                <p style="margin-top: 10px;">
                  <a href="https://dealcross.net" style="color: #667eea; text-decoration: none;">Visit our website</a>
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const data = await resend.emails.send(emailData);
    
    console.log('✅ Verification email sent successfully:', {
      to: email,
      messageId: data.id,
      from: process.env.EMAIL_FROM
    });

    // In development, log the link for testing
    if (isDevelopment) {
      console.log('\n' + '='.repeat(80));
      console.log('🔗 VERIFICATION LINK (for testing):');
      console.log(verificationUrl);
      console.log('User:', email);
      console.log('='.repeat(80) + '\n');
    }

    return data;

  } catch (error) {
    console.error('❌ Failed to send verification email:', error);
    console.error('Error details:', error.message);
    
    // In development, always show the link
    if (isDevelopment) {
      console.log('\n' + '='.repeat(80));
      console.log('⚠️  EMAIL SEND FAILED - But here\'s your verification link:');
      console.log(verificationUrl);
      console.log('User:', email);
      console.log('Error:', error.message);
      console.log('='.repeat(80) + '\n');
    }
    
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
};

/**
 * Send password reset email
 */
exports.sendPasswordResetEmail = async (email, name, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  
  try {
    const emailData = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Reset Your Password - Dealcross',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6; 
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f4f4f7;
            }
            .container { 
              max-width: 600px; 
              margin: 40px auto;
              background: white;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
              padding: 40px 20px;
              text-align: center;
            }
            .header h1 {
              color: white;
              margin: 0;
              font-size: 28px;
              font-weight: 700;
            }
            .logo {
              font-size: 48px;
              margin-bottom: 10px;
            }
            .content {
              padding: 40px 30px;
            }
            .content h2 {
              color: #333;
              margin-top: 0;
              font-size: 24px;
            }
            .content p {
              font-size: 16px;
              color: #555;
              margin: 15px 0;
            }
            .button { 
              display: inline-block; 
              padding: 16px 32px; 
              background-color: #ff6b6b; 
              color: white !important; 
              text-decoration: none; 
              border-radius: 8px; 
              margin: 24px 0;
              font-weight: 600;
            }
            .button:hover {
              background-color: #ee5a6f;
            }
            .button-container {
              text-align: center;
              margin: 30px 0;
            }
            .warning { 
              background-color: #fff3cd; 
              border-left: 4px solid #ffc107;
              padding: 15px; 
              margin: 20px 0;
              border-radius: 4px;
            }
            .warning p {
              margin: 0;
              color: #856404;
            }
            .link-box {
              background: #f8f9fa;
              padding: 15px;
              border-radius: 6px;
              margin: 20px 0;
              word-break: break-all;
              font-size: 13px;
              color: #666;
              border: 1px solid #e0e0e0;
            }
            .info-text {
              font-size: 14px;
              color: #777;
              margin-top: 20px;
            }
            .footer {
              font-size: 12px;
              color: #999;
              margin-top: 30px;
              text-align: center;
              padding-top: 20px;
              border-top: 1px solid #e0e0e0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🔐</div>
              <h1>Password Reset</h1>
            </div>
            <div class="content">
              <h2>Hello ${name},</h2>
              <p>
                We received a request to reset your password for your Dealcross account.
              </p>
              
              <div class="button-container">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              
              <p class="info-text">
                Or copy and paste this link into your browser:
              </p>
              <div class="link-box">
                ${resetUrl}
              </div>
              
              <div class="warning">
                <p><strong>⚠️ Security Notice:</strong></p>
                <p style="margin-top: 10px;">
                  If you didn't request a password reset, please ignore this email. Your password will remain unchanged. 
                  For your security, we recommend changing your password if you suspect unauthorized access to your account.
                </p>
              </div>
              
              <p class="info-text">
                ⏱️ This link will expire in 1 hour.
              </p>
              
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Dealcross. All rights reserved.</p>
                <p style="margin-top: 10px;">
                  <a href="https://dealcross.net" style="color: #ff6b6b; text-decoration: none;">Visit our website</a>
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const data = await resend.emails.send(emailData);
    
    console.log('✅ Password reset email sent successfully:', {
      to: email,
      messageId: data.id,
      from: process.env.EMAIL_FROM
    });

    if (isDevelopment) {
      console.log('\n' + '='.repeat(80));
      console.log('🔗 PASSWORD RESET LINK (for testing):');
      console.log(resetUrl);
      console.log('User:', email);
      console.log('='.repeat(80) + '\n');
    }

    return data;

  } catch (error) {
    console.error('❌ Failed to send password reset email:', error);
    console.error('Error details:', error.message);
    
    if (isDevelopment) {
      console.log('\n' + '='.repeat(80));
      console.log('⚠️  EMAIL SEND FAILED - Password Reset Link:');
      console.log(resetUrl);
      console.log('User:', email);
      console.log('Error:', error.message);
      console.log('='.repeat(80) + '\n');
    }
    
    throw new Error(`Failed to send password reset email: ${error.message}`);
  }
};

/**
 * Send welcome email after successful verification
 */
exports.sendWelcomeEmail = async (email, name) => {
  try {
    const emailData = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Welcome to Dealcross! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6; 
              color: #333; 
              margin: 0;
              padding: 0;
              background-color: #f4f4f7;
            }
            .container { 
              max-width: 600px; 
              margin: 40px auto;
              background: white;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .header { 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
              color: white; 
              padding: 40px 20px; 
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 32px;
              font-weight: 700;
            }
            .logo {
              font-size: 64px;
              margin-bottom: 15px;
            }
            .content { 
              padding: 40px 30px;
            }
            .content h2 {
              color: #333;
              font-size: 24px;
              margin-top: 0;
            }
            .content p {
              font-size: 16px;
              color: #555;
              margin: 15px 0;
            }
            .features {
              background: #f8f9fa;
              padding: 20px;
              border-radius: 8px;
              margin: 25px 0;
            }
            .features ul {
              list-style: none;
              padding: 0;
              margin: 0;
            }
            .features li {
              padding: 10px 0;
              color: #555;
              font-size: 15px;
            }
            .features li:before {
              content: "✅ ";
              margin-right: 10px;
            }
            .button { 
              display: inline-block; 
              padding: 16px 32px; 
              background-color: #667eea; 
              color: white !important; 
              text-decoration: none; 
              border-radius: 8px; 
              margin: 20px 0;
              font-weight: 600;
            }
            .button:hover {
              background-color: #5568d3;
            }
            .button-container {
              text-align: center;
              margin: 30px 0;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e0e0e0;
              text-align: center;
              font-size: 13px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🎉</div>
              <h1>Welcome to Dealcross!</h1>
            </div>
            <div class="content">
              <h2>Hello ${name}!</h2>
              <p>
                Your email has been verified successfully. You're now part of the <strong>Dealcross</strong> community!
              </p>
              <p>
                We're thrilled to have you on board. Dealcross provides secure escrow services to protect both buyers and sellers in every transaction.
              </p>
              
              <div class="features">
                <p style="margin-top: 0; font-weight: 600; color: #333;">Here's what you can do next:</p>
                <ul>
                  <li>Complete your profile and verify your identity</li>
                  <li>Start your first secure transaction</li>
                  <li>Explore our escrow services and features</li>
                  <li>Chat with buyers and sellers in real-time</li>
                  <li>Track your deliveries with GPS</li>
                </ul>
              </div>
              
              <div class="button-container">
                <a href="${process.env.FRONTEND_URL}/dashboard" class="button">Go to Dashboard</a>
              </div>
              
              <p>
                If you have any questions or need assistance, feel free to reach out to our support team. We're here to help!
              </p>
              
              <p style="margin-top: 30px;">
                <strong>Happy trading!</strong><br>
                The Dealcross Team
              </p>
              
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Dealcross. All rights reserved.</p>
                <p style="margin-top: 10px;">
                  <a href="https://dealcross.net" style="color: #667eea; text-decoration: none;">Visit our website</a> | 
                  <a href="mailto:support@dealcross.net" style="color: #667eea; text-decoration: none;">Contact Support</a>
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const data = await resend.emails.send(emailData);
    console.log('✅ Welcome email sent successfully:', { 
      to: email,
      messageId: data.id 
    });
    return data;

  } catch (error) {
    console.error('❌ Failed to send welcome email:', error);
    // Don't throw - welcome email failure shouldn't block the process
  }
};

/**
 * Send password changed confirmation email
 */
exports.sendPasswordChangedEmail = async (email, name) => {
  try {
    const emailData = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Password Changed Successfully - Dealcross',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6; 
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f4f4f7;
            }
            .container { 
              max-width: 600px; 
              margin: 40px auto;
              background: white;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
              padding: 40px 20px;
              text-align: center;
            }
            .header h1 {
              color: white;
              margin: 0;
              font-size: 28px;
              font-weight: 700;
            }
            .logo {
              font-size: 48px;
              margin-bottom: 10px;
            }
            .content {
              padding: 40px 30px;
            }
            .content h2 {
              color: #333;
              margin-top: 0;
              font-size: 24px;
            }
            .content p {
              font-size: 16px;
              color: #555;
              margin: 15px 0;
            }
            .alert { 
              background-color: #d4edda; 
              border-left: 4px solid #28a745; 
              padding: 15px; 
              margin: 20px 0;
              border-radius: 4px;
            }
            .alert p {
              margin: 0;
              color: #155724;
              font-weight: 600;
            }
            .warning-box {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .warning-box p {
              margin: 5px 0;
              color: #856404;
            }
            .warning-box ul {
              margin: 10px 0;
              padding-left: 20px;
            }
            .warning-box li {
              color: #856404;
              margin: 5px 0;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e0e0e0;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🔒</div>
              <h1>Password Changed</h1>
            </div>
            <div class="content">
              <h2>Hello ${name},</h2>
              
              <div class="alert">
                <p>✅ Your password has been changed successfully</p>
              </div>
              
              <p>
                This email confirms that your Dealcross account password was recently changed.
              </p>
              
              <p>
                For security reasons, you may need to log in again on all your devices using your new password.
              </p>
              
              <div class="warning-box">
                <p><strong>⚠️ If you didn't make this change:</strong></p>
                <ul>
                  <li>Contact our support team immediately at <a href="mailto:support@dealcross.net" style="color: #856404;">support@dealcross.net</a></li>
                  <li>Reset your password again as soon as possible</li>
                  <li>Review your recent account activity</li>
                  <li>Enable two-factor authentication for added security</li>
                </ul>
              </div>
              
              <p style="margin-top: 25px;">
                If you have any questions or concerns about your account security, please don't hesitate to reach out to our support team.
              </p>
              
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Dealcross. All rights reserved.</p>
                <p style="margin-top: 10px;">
                  <a href="https://dealcross.net" style="color: #28a745; text-decoration: none;">Visit our website</a> | 
                  <a href="mailto:support@dealcross.net" style="color: #28a745; text-decoration: none;">Contact Support</a>
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const data = await resend.emails.send(emailData);
    console.log('✅ Password changed email sent successfully:', { 
      to: email,
      messageId: data.id 
    });
    return data;

  } catch (error) {
    console.error('❌ Failed to send password changed email:', error);
    // Don't throw - notification email failure shouldn't block the process
  }
};
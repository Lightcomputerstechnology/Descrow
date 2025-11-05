const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

const isDevelopment = process.env.NODE_ENV === 'development';

exports.sendVerificationEmail = async (email, name, token) => {
  // ✅ Use query parameter format to match frontend route
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  
  try {
    const emailData = {
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
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
            }
            .content {
              padding: 40px 30px;
            }
            .button { 
              display: inline-block; 
              padding: 16px 32px; 
              background-color: #667eea; 
              color: white; 
              text-decoration: none; 
              border-radius: 8px; 
              margin: 24px 0;
              font-weight: 600;
              text-align: center;
            }
            .button:hover {
              background-color: #5568d3;
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
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🛡️ Dealcross</h1>
            </div>
            <div class="content">
              <h2 style="color: #333; margin-top: 0;">Hello ${name}!</h2>
              <p style="font-size: 16px; color: #555;">
                Thank you for registering with <strong>Dealcross</strong>. We're excited to have you on board!
              </p>
              <p style="font-size: 16px; color: #555;">
                Please verify your email address to activate your account and start using our secure escrow platform.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </div>
              
              <p style="font-size: 14px; color: #777;">
                Or copy and paste this link into your browser:
              </p>
              <div class="link-box">
                ${verificationUrl}
              </div>
              
              <p style="font-size: 14px; color: #999; margin-top: 30px;">
                This verification link will expire in 24 hours for security reasons.
              </p>
              
              <div class="footer">
                <p><strong>Important:</strong> If you didn't create an account with Dealcross, please ignore this email.</p>
                <p>&copy; ${new Date().getFullYear()} Dealcross. All rights reserved.</p>
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
      messageId: data.id
    });

    // In development, log the link for testing
    if (isDevelopment) {
      console.log('\n' + '='.repeat(80));
      console.log('🔗 VERIFICATION LINK (copy this):');
      console.log(verificationUrl);
      console.log('User:', email);
      console.log('='.repeat(80) + '\n');
    }

    return data;

  } catch (error) {
    console.error('❌ Resend email error:', error);
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

exports.sendPasswordResetEmail = async (email, name, token) => {
  // ✅ Use query parameter format
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  
  try {
    const emailData = {
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
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
            }
            .content {
              padding: 40px 30px;
            }
            .button { 
              display: inline-block; 
              padding: 16px 32px; 
              background-color: #ff6b6b; 
              color: white; 
              text-decoration: none; 
              border-radius: 8px; 
              margin: 24px 0;
              font-weight: 600;
            }
            .button:hover {
              background-color: #ee5a6f;
            }
            .warning { 
              background-color: #fff3cd; 
              border-left: 4px solid #ffc107;
              padding: 15px; 
              margin: 20px 0;
              border-radius: 4px;
            }
            .link-box {
              background: #f8f9fa;
              padding: 15px;
              border-radius: 6px;
              margin: 20px 0;
              word-break: break-all;
              font-size: 13px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset</h1>
            </div>
            <div class="content">
              <h2 style="color: #333; margin-top: 0;">Hello ${name},</h2>
              <p style="font-size: 16px; color: #555;">
                We received a request to reset your password for your Dealcross account.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              
              <p style="font-size: 14px; color: #777;">
                Or copy and paste this link into your browser:
              </p>
              <div class="link-box">
                ${resetUrl}
              </div>
              
              <div class="warning">
                <strong>⚠️ Security Notice:</strong>
                <p style="margin: 10px 0 0 0;">
                  If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
                </p>
              </div>
              
              <p style="font-size: 14px; color: #999; margin-top: 20px;">
                This link will expire in 1 hour.
              </p>
              
              <p style="font-size: 12px; color: #999; margin-top: 30px; text-align: center;">
                &copy; ${new Date().getFullYear()} Dealcross. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const data = await resend.emails.send(emailData);
    
    console.log('✅ Password reset email sent:', {
      to: email,
      messageId: data.id
    });

    if (isDevelopment) {
      console.log('\n' + '='.repeat(80));
      console.log('🔗 PASSWORD RESET LINK:');
      console.log(resetUrl);
      console.log('User:', email);
      console.log('='.repeat(80) + '\n');
    }

    return data;

  } catch (error) {
    console.error('❌ Password reset email error:', error);
    
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

exports.sendWelcomeEmail = async (email, name) => {
  try {
    const emailData = {
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: email,
      subject: 'Welcome to Dealcross! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
              color: white; 
              padding: 30px; 
              text-align: center; 
              border-radius: 10px 10px 0 0; 
            }
            .content { background: #f9f9f9; padding: 30px; }
            .button { 
              display: inline-block; 
              padding: 12px 24px; 
              background-color: #667eea; 
              color: white; 
              text-decoration: none; 
              border-radius: 5px; 
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to Dealcross!</h1>
            </div>
            <div class="content">
              <h2>Hello ${name}!</h2>
              <p>Your email has been verified successfully. You're now part of the Dealcross community!</p>
              <p><strong>Here's what you can do next:</strong></p>
              <ul>
                <li>Complete your profile</li>
                <li>Start your first secure transaction</li>
                <li>Explore our escrow services</li>
              </ul>
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL}/dashboard" class="button">Go to Dashboard</a>
              </div>
              <p>If you have any questions, feel free to reach out to our support team.</p>
              <p>Happy trading!</p>
              <p><strong>The Dealcross Team</strong></p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const data = await resend.emails.send(emailData);
    console.log('✅ Welcome email sent:', { to: email });
    return data;

  } catch (error) {
    console.error('❌ Welcome email error:', error);
    // Don't throw - welcome email failure shouldn't block the process
  }
};

exports.sendPasswordChangedEmail = async (email, name) => {
  try {
    const emailData = {
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: email,
      subject: 'Password Changed - Dealcross',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .alert { background-color: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Hello ${name},</h2>
            <div class="alert">
              <strong>✅ Password Changed Successfully</strong>
            </div>
            <p>Your password has been changed successfully.</p>
            <p><strong>⚠️ If you didn't make this change:</strong></p>
            <ul>
              <li>Contact our support team immediately</li>
              <li>Reset your password again</li>
              <li>Review your account activity</li>
            </ul>
            <p>For security reasons, you may need to log in again on all your devices.</p>
            <p>&copy; ${new Date().getFullYear()} Dealcross. All rights reserved.</p>
          </div>
        </body>
        </html>
      `
    };

    const data = await resend.emails.send(emailData);
    console.log('✅ Password changed email sent:', { to: email });
    return data;

  } catch (error) {
    console.error('❌ Password changed email error:', error);
  }
};
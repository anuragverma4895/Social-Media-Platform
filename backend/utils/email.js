const nodemailer = require('nodemailer');

const createTransporter = () => nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000
});

// Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Email verification OTP
const sendVerificationEmail = async (email, username, otp) => {
  const transporter = createTransporter();

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: '🔐 Verify Your SocialMERN Account',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1)">
        <div style="background:linear-gradient(135deg,#667eea,#764ba2);padding:30px;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:28px">SocialMERN</h1>
          <p style="color:rgba(255,255,255,0.8);margin:8px 0 0">Email Verification</p>
        </div>
        <div style="padding:40px">
          <h2 style="color:#333">Hi ${username}! 👋</h2>
          <p style="color:#666;font-size:16px;line-height:1.6">Welcome to SocialMERN! Verify your email with the OTP below.</p>
          <div style="background:#f8f9ff;border:2px solid #667eea;border-radius:8px;padding:20px;text-align:center;margin:30px 0">
            <p style="color:#666;margin:0 0 10px;font-size:14px">Your verification code</p>
            <span style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#667eea">${otp}</span>
          </div>
          <p style="color:#999;font-size:14px">⏰ Expires in <strong>10 minutes</strong>.</p>
          <p style="color:#999;font-size:14px">If you didn't create an account, ignore this email.</p>
        </div>
        <div style="background:#f4f4f4;padding:20px;text-align:center">
          <p style="color:#aaa;font-size:12px;margin:0">© ${new Date().getFullYear()} SocialMERN</p>
        </div>
      </div>`
  });
};

// Password reset OTP
const sendPasswordResetEmail = async (email, username, otp) => {
  const transporter = createTransporter();

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: '🔑 Reset Your SocialMERN Password',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1)">
        <div style="background:linear-gradient(135deg,#f093fb,#f5576c);padding:30px;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:28px">SocialMERN</h1>
          <p style="color:rgba(255,255,255,0.8);margin:8px 0 0">Password Reset</p>
        </div>
        <div style="padding:40px">
          <h2 style="color:#333">Hi ${username}!</h2>
          <p style="color:#666;font-size:16px">Use this OTP to reset your password.</p>
          <div style="background:#fff5f5;border:2px solid #f5576c;border-radius:8px;padding:20px;text-align:center;margin:30px 0">
            <p style="color:#666;margin:0 0 10px;font-size:14px">Password Reset OTP</p>
            <span style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#f5576c">${otp}</span>
          </div>
          <p style="color:#999;font-size:14px">⏰ Expires in <strong>10 minutes</strong>.</p>
        </div>
      </div>`
  });
};

module.exports = { generateOTP, sendVerificationEmail, sendPasswordResetEmail };

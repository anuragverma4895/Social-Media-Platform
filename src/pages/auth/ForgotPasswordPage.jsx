import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api.js';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: email, 2: OTP, 3: new password
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.forgotPassword({ email });
      setUserId(data.data?.userId);
      setStep(2);
      toast.success('OTP sent to your email!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleVerifyOTP = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) return toast.error('Enter the 6-digit OTP');
    setLoading(true);
    try {
      await authAPI.verifyResetOTP({ userId, otp: otpString });
      setStep(3);
      toast.success('OTP verified!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return toast.error("Passwords don't match");
    if (newPassword.length < 6) return toast.error("Password must be at least 6 characters");
    setLoading(true);
    try {
      await authAPI.resetPassword({ userId, otp: otp.join(''), newPassword });
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-purple-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Reset Password</h2>
        <p className="text-gray-500 text-center mb-8">
          {step === 1 && "Enter your email to receive a reset OTP"}
          {step === 2 && "Enter the 6-digit code sent to your email"}
          {step === 3 && "Create a new password"}
        </p>

        {/* Step 1: Email */}
        {step === 1 && (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <input type="email" className="input-field" placeholder="you@example.com" value={email}
              onChange={(e) => setEmail(e.target.value)} required />
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        )}

        {/* Step 2: OTP */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex justify-center gap-3">
              {otp.map((digit, i) => (
                <input key={i} ref={(el) => (inputRefs.current[i] = el)} type="text" inputMode="numeric"
                  value={digit} onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Backspace' && !digit && i > 0) inputRefs.current[i - 1]?.focus(); }}
                  className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500" maxLength={1} />
              ))}
            </div>
            <button onClick={handleVerifyOTP} className="btn-primary w-full" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </div>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <input type="password" className="input-field" placeholder="New password (min 6 chars)" value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)} required minLength={6} />
            <input type="password" className="input-field" placeholder="Confirm new password" value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)} required />
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        <p className="text-center mt-6">
          <Link to="/login" className="text-primary-500 hover:text-primary-700 font-medium">
            ← Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}

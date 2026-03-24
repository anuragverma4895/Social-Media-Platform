import { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import toast from 'react-hot-toast';

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { userId, email } = location.state || {};

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef([]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only digits
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    // Auto-focus next
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').slice(0, 6).split('');
    const newOtp = [...otp];
    pasted.forEach((char, i) => { if (i < 6 && /\d/.test(char)) newOtp[i] = char; });
    setOtp(newOtp);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      const { data } = await authAPI.verifyEmail({ userId, otp: otpString });
      localStorage.setItem('token', data.data.token);
      toast.success('Email verified! Welcome 🎉');
      navigate('/feed');
      window.location.reload();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authAPI.resendOTP({ userId });
      toast.success('New OTP sent to your email!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-purple-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">📧</span>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
        <p className="text-gray-500 mb-1">We sent a 6-digit verification code to</p>
        <p className="font-semibold text-primary-600 mb-8">{email || 'your email'}</p>

        {/* OTP Input */}
        <div className="flex justify-center gap-3 mb-6" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              type="text"
              inputMode="numeric"
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-xl
                focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
              maxLength={1}
            />
          ))}
        </div>

        <button onClick={handleVerify} className="btn-primary w-full mb-4" disabled={loading}>
          {loading ? 'Verifying...' : 'Verify Email'}
        </button>

        <p className="text-gray-500 text-sm">
          Didn't receive the code?{' '}
          <button onClick={handleResend} disabled={resending} className="text-primary-500 font-semibold hover:text-primary-700">
            {resending ? 'Sending...' : 'Resend OTP'}
          </button>
        </p>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { authAPI } from '../../services/api.js';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(form);
    if (result.success) {
      navigate('/feed');
    } else if (result.data?.requiresVerification) {
      navigate('/verify-email', { state: { userId: result.data.data?.userId, email: form.email } });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left - Gradient banner */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-primary-500 to-secondary-500 flex-col justify-center items-center p-12 text-white">
        <h1 className="text-5xl font-bold mb-4">SocialMERN</h1>
        <p className="text-xl text-white/80 text-center max-w-sm">
          Connect, share, and discover with people around the world.
        </p>
        <div className="mt-12 grid grid-cols-2 gap-4 text-center">
          {[['📸', 'Share Moments'], ['❤️', 'Show Love'], ['💬', 'Connect'], ['🤖', 'AI Powered']].map(([emoji, label]) => (
            <div key={label} className="bg-white/10 rounded-2xl p-4">
              <div className="text-3xl mb-1">{emoji}</div>
              <div className="text-sm font-medium">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Welcome back!</h2>
            <p className="text-gray-500 mt-2">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            <div className="text-right">
              <Link to="/forgot-password" className="text-sm text-primary-500 hover:text-primary-700 font-medium">
                Forgot password?
              </Link>
            </div>

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary-500 hover:text-primary-700 font-semibold">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

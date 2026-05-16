import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { authAPI } from '../../services/api.js';
import toast from 'react-hot-toast';
import {
  CameraIcon, HeartIcon, ChatBubbleLeftRightIcon, SparklesIcon,
} from '@heroicons/react/24/outline';

const features = [
  { icon: CameraIcon, label: 'Share Moments', color: 'text-amber-300' },
  { icon: HeartIcon, label: 'Show Love', color: 'text-pink-300' },
  { icon: ChatBubbleLeftRightIcon, label: 'Connect', color: 'text-sky-300' },
  { icon: SparklesIcon, label: 'AI Powered', color: 'text-violet-300' },
];

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
    <div className="min-h-screen flex bg-gray-50 relative overflow-hidden">
      {/* Animated Background Orbs for the whole page */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-200/40 blur-[100px] animate-pulse pointer-events-none" style={{ animationDuration: '7s' }}></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary-200/40 blur-[100px] animate-pulse pointer-events-none" style={{ animationDuration: '10s' }}></div>

      {/* Left - Gradient banner */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-500 flex-col justify-center items-center p-12 text-white relative overflow-hidden shadow-2xl">
        {/* Decorative 3D elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-float" />
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>

        <div className="relative z-10 text-center animate-slide-up">
          <h1 className="text-6xl font-extrabold mb-6 tracking-tight drop-shadow-lg">SocialMERN</h1>
          <p className="text-xl text-white/90 text-center max-w-sm mx-auto font-medium leading-relaxed drop-shadow-md">
            Connect, share, and discover with people around the world.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-6 text-center relative z-10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {features.map(({ icon: Icon, label, color }, idx) => (
            <div key={label} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 hover-3d group cursor-default shadow-[0_8px_32px_0_rgba(31,38,135,0.2)]">
              <Icon className={`w-10 h-10 mx-auto mb-3 ${color} group-hover:scale-110 transition-transform duration-300 drop-shadow-md`} />
              <div className="text-sm font-bold tracking-wide">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10 animate-fade-in">
        <div className="w-full max-w-md bg-white/60 backdrop-blur-2xl rounded-[2rem] p-10 border border-white/60 shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] hover:shadow-[0_16px_48px_0_rgba(0,0,0,0.1)] transition-all duration-500 preserve-3d">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-500 tracking-tight mb-3 drop-shadow-sm">Welcome back!</h2>
            <p className="text-gray-500 font-medium">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="group">
              <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1 transition-colors group-focus-within:text-primary-600">Email or Username</label>
              <input
                type="text"
                className="input-field bg-white/70 backdrop-blur-sm border-gray-200/80 shadow-sm"
                placeholder="you@example.com or username"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="group">
              <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1 transition-colors group-focus-within:text-primary-600">Password</label>
              <input
                type="password"
                className="input-field bg-white/70 backdrop-blur-sm border-gray-200/80 shadow-sm"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            <div className="text-right pt-1">
              <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-800 font-bold transition-colors">
                Forgot password?
              </Link>
            </div>

            <button type="submit" className="btn-primary w-full py-3.5 text-lg shadow-[0_10px_20px_-10px_rgba(var(--tw-colors-primary-500),0.6)] mt-2 hover:-translate-y-1 transform transition-all" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-8 font-medium">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary-600 hover:text-primary-800 font-bold transition-colors ml-1">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

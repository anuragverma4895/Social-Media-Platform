import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  CameraIcon, HeartIcon, ChatBubbleLeftRightIcon, SparklesIcon, ArrowRightIcon,
} from '@heroicons/react/24/outline';

const features = [
  { icon: CameraIcon, label: 'Share Moments', color: 'from-amber-400 to-orange-500' },
  { icon: HeartIcon, label: 'Show Love', color: 'from-pink-400 to-rose-500' },
  { icon: ChatBubbleLeftRightIcon, label: 'Connect', color: 'from-sky-400 to-blue-500' },
  { icon: SparklesIcon, label: 'AI Powered', color: 'from-violet-400 to-purple-500' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

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
    <div className="min-h-screen flex w-full bg-slate-50 font-sans selection:bg-primary-500 selection:text-white">
      {/* LEFT SECTION - Brand & Features */}
      <div className="hidden lg:flex w-[55%] relative overflow-hidden bg-[#0a0f1c] flex-col justify-center px-16 py-12">
        {/* Animated Background Gradients */}
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-primary-600/30 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-secondary-600/30 blur-[120px] animate-pulse" style={{ animationDuration: '12s', animationDelay: '1s' }} />
        
        {/* Subtle noise texture */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />

        <div className="relative z-10 w-full max-w-2xl mx-auto">
          <div className="animate-slide-up mb-16">
            <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-6">
              <span className="text-sm font-bold tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">
                Welcome to the Future
              </span>
            </div>
            <h1 className="text-7xl font-black text-white mb-6 leading-tight tracking-tighter">
              Social<span className="text-transparent bg-clip-text bg-gradient-to-br from-primary-500 to-secondary-500">MERN</span>
            </h1>
            <p className="text-xl text-slate-300 font-medium leading-relaxed max-w-lg">
              Experience a vibrant community. Connect, share your best moments, and discover inspiring people around the globe.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {features.map(({ icon: Icon, label, color }, idx) => (
              <div key={label} className="group relative bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 rounded-3xl p-6 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] cursor-default overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${color} bg-opacity-10 mb-4 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                  <Icon className="w-7 h-7 text-white drop-shadow-md" />
                </div>
                <h3 className="text-lg font-bold text-white tracking-wide">{label}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT SECTION - Login Form */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-8 sm:p-12 lg:p-16 relative bg-white/50 backdrop-blur-3xl">
        {/* Subtle decorative elements for right side */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-primary-200/50 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-secondary-200/50 rounded-full blur-3xl" />

        <div className="w-full max-w-md relative z-10 animate-fade-in">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Welcome back!</h2>
            <p className="text-slate-500 font-medium text-lg">Enter your details to sign in</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <label className={`absolute left-4 transition-all duration-300 font-bold z-10 pointer-events-none ${focusedField === 'email' || form.email ? '-top-2.5 text-xs text-primary-600 bg-white px-1' : 'top-3.5 text-slate-400'}`}>
                Email or Username
              </label>
              <input
                type="text"
                className={`w-full px-4 py-4 rounded-2xl border-2 bg-white/80 backdrop-blur-sm transition-all duration-300 outline-none ${focusedField === 'email' ? 'border-primary-500 shadow-[0_0_0_4px_rgba(99,102,241,0.1)]' : 'border-slate-200 hover:border-slate-300'}`}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                required
              />
            </div>

            <div className="relative">
              <label className={`absolute left-4 transition-all duration-300 font-bold z-10 pointer-events-none ${focusedField === 'password' || form.password ? '-top-2.5 text-xs text-primary-600 bg-white px-1' : 'top-3.5 text-slate-400'}`}>
                Password
              </label>
              <input
                type="password"
                className={`w-full px-4 py-4 rounded-2xl border-2 bg-white/80 backdrop-blur-sm transition-all duration-300 outline-none ${focusedField === 'password' ? 'border-primary-500 shadow-[0_0_0_4px_rgba(99,102,241,0.1)]' : 'border-slate-200 hover:border-slate-300'}`}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                required
              />
            </div>

            <div className="flex items-center justify-end pt-1">
              <Link to="/forgot-password" className="text-sm font-bold text-primary-600 hover:text-primary-800 transition-colors">
                Forgot password?
              </Link>
            </div>

            <button 
              type="submit" 
              className="group relative w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-lg transition-all duration-300 shadow-[0_10px_20px_-10px_rgba(0,0,0,0.5)] hover:shadow-[0_15px_25px_-10px_rgba(0,0,0,0.6)] hover:-translate-y-1 overflow-hidden" 
              disabled={loading}
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary-600 to-secondary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="relative flex items-center justify-center gap-2">
                {loading ? 'Signing in...' : 'Sign In'}
                {!loading && <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
              </span>
            </button>
          </form>

          <p className="text-center text-slate-600 mt-10 font-medium">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary-600 hover:text-primary-800 font-bold transition-colors ml-1 underline underline-offset-4 decoration-2 decoration-primary-200 hover:decoration-primary-600">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

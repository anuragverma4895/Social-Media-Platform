import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { authAPI } from '../../services/api.js';
import toast from 'react-hot-toast';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

export default function SignupPage() {
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const [form, setForm] = useState({ username: '', email: '', password: '', name: '' });
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.signup(form);
      loginWithToken(data.data.user, data.data.token);
      toast.success('Account created successfully!');
      navigate('/feed');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-slate-50 font-sans selection:bg-primary-500 selection:text-white">
      {/* LEFT SECTION */}
      <div className="hidden lg:flex w-[55%] relative overflow-hidden bg-[#0a0f1c] flex-col justify-center px-16 py-12">
        <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-primary-600/30 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-secondary-600/30 blur-[120px] animate-pulse" style={{ animationDuration: '12s', animationDelay: '1s' }} />
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />

        <div className="relative z-10 w-full max-w-2xl mx-auto">
          <div className="animate-slide-up mb-12">
            <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-6">
              <span className="text-sm font-bold tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">
                Join the Network
              </span>
            </div>
            <h1 className="text-7xl font-black text-white mb-6 leading-tight tracking-tighter">
              Create <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary-500 to-secondary-500">Account</span>
            </h1>
            <p className="text-xl text-slate-300 font-medium leading-relaxed max-w-lg">
              Start your journey today. Build your profile, follow your passions, and share your unique story with the world.
            </p>
          </div>

          <div className="relative w-full max-w-md h-64 animate-float" style={{ animationDelay: '0.5s' }}>
            <div className="absolute top-0 right-10 w-32 h-32 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl transform rotate-12 transition-transform duration-500 hover:rotate-6 hover:scale-105" />
            <div className="absolute bottom-0 left-10 w-40 h-40 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl transform -rotate-6 transition-transform duration-500 hover:rotate-0 hover:scale-105" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 backdrop-blur-xl rounded-full border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary-500 to-secondary-500 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-8 sm:p-12 lg:p-16 relative bg-white/50 backdrop-blur-3xl overflow-y-auto">
        <div className="absolute top-20 right-20 w-32 h-32 bg-primary-200/50 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-secondary-200/50 rounded-full blur-3xl" />

        <div className="w-full max-w-md relative z-10 animate-fade-in my-auto">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Get Started</h2>
            <p className="text-slate-500 font-medium text-lg">Create a new account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <label className={`absolute left-4 transition-all duration-300 font-bold z-10 pointer-events-none ${focusedField === 'name' || form.name ? '-top-2.5 text-xs text-primary-600 bg-white px-1' : 'top-3.5 text-slate-400'}`}>
                  Full Name
                </label>
                <input type="text" className={`w-full px-4 py-3.5 rounded-2xl border-2 bg-white/80 backdrop-blur-sm transition-all duration-300 outline-none ${focusedField === 'name' ? 'border-primary-500 shadow-[0_0_0_4px_rgba(99,102,241,0.1)]' : 'border-slate-200 hover:border-slate-300'}`}
                  value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)} />
              </div>

              <div className="relative">
                <label className={`absolute left-4 transition-all duration-300 font-bold z-10 pointer-events-none ${focusedField === 'username' || form.username ? '-top-2.5 text-xs text-primary-600 bg-white px-1' : 'top-3.5 text-slate-400'}`}>
                  Username
                </label>
                <input type="text" className={`w-full px-4 py-3.5 rounded-2xl border-2 bg-white/80 backdrop-blur-sm transition-all duration-300 outline-none ${focusedField === 'username' ? 'border-primary-500 shadow-[0_0_0_4px_rgba(99,102,241,0.1)]' : 'border-slate-200 hover:border-slate-300'}`}
                  value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
                  onFocus={() => setFocusedField('username')} onBlur={() => setFocusedField(null)} required />
              </div>
            </div>

            <div className="relative">
              <label className={`absolute left-4 transition-all duration-300 font-bold z-10 pointer-events-none ${focusedField === 'email' || form.email ? '-top-2.5 text-xs text-primary-600 bg-white px-1' : 'top-3.5 text-slate-400'}`}>
                Email Address
              </label>
              <input type="email" className={`w-full px-4 py-3.5 rounded-2xl border-2 bg-white/80 backdrop-blur-sm transition-all duration-300 outline-none ${focusedField === 'email' ? 'border-primary-500 shadow-[0_0_0_4px_rgba(99,102,241,0.1)]' : 'border-slate-200 hover:border-slate-300'}`}
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)} required />
            </div>

            <div className="relative">
              <label className={`absolute left-4 transition-all duration-300 font-bold z-10 pointer-events-none ${focusedField === 'password' || form.password ? '-top-2.5 text-xs text-primary-600 bg-white px-1' : 'top-3.5 text-slate-400'}`}>
                Password
              </label>
              <input type="password" className={`w-full px-4 py-3.5 rounded-2xl border-2 bg-white/80 backdrop-blur-sm transition-all duration-300 outline-none ${focusedField === 'password' ? 'border-primary-500 shadow-[0_0_0_4px_rgba(99,102,241,0.1)]' : 'border-slate-200 hover:border-slate-300'}`}
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)} required minLength={6} />
            </div>

            <button type="submit" className="group relative w-full py-4 mt-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-lg transition-all duration-300 shadow-[0_10px_20px_-10px_rgba(0,0,0,0.5)] hover:shadow-[0_15px_25px_-10px_rgba(0,0,0,0.6)] hover:-translate-y-1 overflow-hidden" disabled={loading}>
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary-600 to-secondary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="relative flex items-center justify-center gap-2">
                {loading ? 'Creating...' : 'Create Account'}
                {!loading && <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
              </span>
            </button>
          </form>

          <p className="text-center text-slate-600 mt-8 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-800 font-bold transition-colors ml-1 underline underline-offset-4 decoration-2 decoration-primary-200 hover:decoration-primary-600">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

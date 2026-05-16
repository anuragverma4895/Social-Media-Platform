import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { authAPI } from '../../services/api.js';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const [form, setForm] = useState({ username: '', email: '', password: '', name: '' });
  const [loading, setLoading] = useState(false);

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
          <h1 className="text-6xl font-extrabold mb-6 tracking-tight drop-shadow-lg">Join SocialMERN</h1>
          <p className="text-xl text-white/90 text-center max-w-sm mx-auto font-medium leading-relaxed drop-shadow-md">
            Create your account and start sharing your world with others.
          </p>
        </div>
        
        {/* Decorative floating cards */}
        <div className="mt-16 relative w-64 h-64 animate-float" style={{ animationDelay: '1s' }}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg transform rotate-12"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg transform -rotate-6"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/20 backdrop-blur-lg rounded-full border border-white/30 shadow-[0_8px_32px_0_rgba(31,38,135,0.2)] flex items-center justify-center">
            <span className="text-5xl">✨</span>
          </div>
        </div>
      </div>

      {/* Right - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10 animate-fade-in">
        <div className="w-full max-w-md bg-white/60 backdrop-blur-2xl rounded-[2rem] p-10 border border-white/60 shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] hover:shadow-[0_16px_48px_0_rgba(0,0,0,0.1)] transition-all duration-500 preserve-3d">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-500 tracking-tight mb-3 drop-shadow-sm">Create account</h2>
            <p className="text-gray-500 font-medium">Start your journey today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="group">
                <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1 transition-colors group-focus-within:text-primary-600">Full Name</label>
                <input type="text" className="input-field bg-white/70 backdrop-blur-sm border-gray-200/80 shadow-sm" placeholder="John Doe" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="group">
                <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1 transition-colors group-focus-within:text-primary-600">Username</label>
                <input type="text" className="input-field bg-white/70 backdrop-blur-sm border-gray-200/80 shadow-sm" placeholder="johndoe" value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })} required />
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1 transition-colors group-focus-within:text-primary-600">Email</label>
              <input type="email" className="input-field bg-white/70 backdrop-blur-sm border-gray-200/80 shadow-sm" placeholder="you@example.com" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>

            <div className="group">
              <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1 transition-colors group-focus-within:text-primary-600">Password</label>
              <input type="password" className="input-field bg-white/70 backdrop-blur-sm border-gray-200/80 shadow-sm" placeholder="At least 6 characters" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
            </div>

            <button type="submit" className="btn-primary w-full py-3.5 text-lg shadow-[0_10px_20px_-10px_rgba(var(--tw-colors-primary-500),0.6)] mt-6 hover:-translate-y-1 transform transition-all" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-8 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-800 font-bold transition-colors ml-1">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

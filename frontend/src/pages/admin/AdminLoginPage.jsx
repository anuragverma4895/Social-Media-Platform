import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import toast from 'react-hot-toast';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '', adminKey: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await adminAPI.login(form);
      localStorage.setItem('token', data.data.token);
      // Reload to trigger auth context
      toast.success('Admin login successful!');
      window.location.href = '/admin/dashboard';
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">🛡️</span>
          </div>
          <h2 className="text-2xl font-bold text-white">Admin Panel</h2>
          <p className="text-gray-400 mt-1">SocialMERN Administration</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { field: 'email', type: 'email', placeholder: 'Admin Email' },
            { field: 'password', type: 'password', placeholder: 'Password' },
            { field: 'adminKey', type: 'password', placeholder: 'Admin Secret Key' },
          ].map(({ field, type, placeholder }) => (
            <input key={field} type={type} className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder={placeholder} value={form[field]}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })} required />
          ))}

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Logging in...' : 'Access Admin Panel'}
          </button>
        </form>
      </div>
    </div>
  );
}

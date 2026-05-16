import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { userAPI } from '../../services/api.js';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef();

  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [profilePicture, setProfilePicture] = useState(null);
  const [preview, setPreview] = useState(user?.profilePicture || '');
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error('Image must be under 5MB');
    setProfilePicture(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      if (name !== user?.name) formData.append('name', name);
      if (username !== user?.username) formData.append('username', username);
      if (bio !== user?.bio) formData.append('bio', bio);
      if (profilePicture) formData.append('profilePicture', profilePicture);

      const { data } = await userAPI.updateProfile(formData);
      updateUser(data.data);
      toast.success('Profile updated successfully');
      navigate(`/${data.data.username}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
      
      <div className="card p-6 mb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-6 mb-6">
            <img 
              src={preview || `https://ui-avatars.com/api/?name=${user?.username}&background=667eea&color=fff&size=200`} 
              alt="Profile" 
              className="w-24 h-24 rounded-full object-cover ring-4 ring-primary-100 cursor-pointer"
              onClick={() => fileRef.current?.click()}
            />
            <div>
              <button type="button" onClick={() => fileRef.current?.click()} className="btn-secondary py-1.5 px-4 text-sm rounded-lg border font-medium">
                Change Picture
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-primary-500" maxLength={50} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-primary-500" maxLength={30} required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-primary-500" rows={3} maxLength={200}></textarea>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100 mt-6">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1 py-2 rounded-lg font-medium border">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 py-2 rounded-lg font-medium bg-indigo-600 text-white hover:bg-indigo-700">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      <div className="card p-6 border-red-100 bg-red-50/30">
        <h2 className="text-lg font-bold text-red-600 mb-2">Danger Zone</h2>
        <p className="text-gray-500 mb-4 text-sm">Logging out clears your current session on this device.</p>
        <button onClick={handleLogout} className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-medium transition-colors">
          Logout
        </button>
      </div>
    </div>
  );
}

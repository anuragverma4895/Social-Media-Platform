import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api.js';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon, color }) => (
  <div className={`card p-6 border-l-4 ${color}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value?.toLocaleString() || 0}</p>
      </div>
      <span className="text-4xl">{icon}</span>
    </div>
  </div>
);

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getDashboard()
      .then(({ data }) => setStats(data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Users" value={stats?.stats.totalUsers} icon="👥" color="border-blue-500" />
        <StatCard title="Total Posts" value={stats?.stats.totalPosts} icon="📸" color="border-purple-500" />
        <StatCard title="Active Users" value={stats?.stats.activeUsers} icon="✅" color="border-green-500" />
        <StatCard title="Banned Users" value={stats?.stats.bannedUsers} icon="🚫" color="border-red-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Users</h2>
            <Link to="/admin/users" className="text-sm text-primary-500 hover:text-primary-700">View all</Link>
          </div>
          <div className="space-y-3">
            {stats?.recentUsers?.map((user) => (
              <div key={user._id} className="flex items-center gap-3">
                <img src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.username}&background=667eea&color=fff`}
                  alt={user.username} className="w-9 h-9 rounded-full object-cover" />
                <div className="flex-1">
                  <p className="font-medium text-sm text-gray-900">{user.username}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <span className="text-xs text-gray-400">{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Posts */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Posts</h2>
            <Link to="/admin/posts" className="text-sm text-primary-500 hover:text-primary-700">View all</Link>
          </div>
          <div className="space-y-3">
            {stats?.recentPosts?.map((post) => (
              <div key={post._id} className="flex items-center gap-3">
                {post.image ? (
                  <img src={post.image} alt="post" className="w-9 h-9 rounded-lg object-cover" />
                ) : (
                  <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center text-lg">📝</div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900">@{post.author?.username}</p>
                  <p className="text-xs text-gray-500 truncate">{post.caption || 'Image post'}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${post.isDeleted ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                  {post.isDeleted ? 'Removed' : 'Active'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

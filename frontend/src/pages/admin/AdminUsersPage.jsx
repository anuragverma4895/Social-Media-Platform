import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../../services/api.js';
import toast from 'react-hot-toast';
import { MagnifyingGlassIcon, TrashIcon, NoSymbolIcon } from '@heroicons/react/24/outline';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const fetchUsers = useCallback(async (pageNum = 1, searchTerm = '') => {
    try {
      setLoading(true);
      const { data } = await adminAPI.getAllUsers({ page: pageNum, limit: 20, search: searchTerm });
      setUsers(data.data);
      setPagination(data.pagination);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => fetchUsers(1, search), 400);
    return () => clearTimeout(timeout);
  }, [search, fetchUsers]);

  const handleBan = async (userId, isBanned) => {
    const reason = isBanned ? '' : prompt('Reason for ban (optional):');
    try {
      await adminAPI.banUser(userId, { reason });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isBanned: !isBanned, banReason: reason } : u));
      toast.success(`User ${isBanned ? 'unbanned' : 'banned'} successfully`);
    } catch { toast.error('Action failed'); }
  };

  const handleDelete = async (userId, username) => {
    if (!window.confirm(`Permanently delete @${username} and all their data?`)) return;
    try {
      await adminAPI.deleteUser(userId);
      setUsers(prev => prev.filter(u => u._id !== userId));
      toast.success('User deleted');
    } catch { toast.error('Failed to delete user'); }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
        <span className="text-sm text-gray-500">{pagination.total || 0} total users</span>
      </div>

      <div className="relative mb-4">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input type="text" className="input-field pl-10" placeholder="Search by username or email..."
          value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['User', 'Email', 'Joined', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-500">Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-500">No users found</td></tr>
            ) : users.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.username}&background=667eea&color=fff`}
                      alt={user.username} className="w-9 h-9 rounded-full object-cover" />
                    <div>
                      <p className="font-medium text-sm text-gray-900">{user.username}</p>
                      <p className="text-xs text-gray-500">{user.name}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    user.isBanned ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {user.isBanned ? '🚫 Banned' : '✅ Active'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleBan(user._id, user.isBanned)}
                      className={`p-1.5 rounded-lg transition-colors text-sm ${user.isBanned ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'}`}>
                      <NoSymbolIcon className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(user._id, user.username)}
                      className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => { setPage(p); fetchUsers(p, search); }}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-primary-500 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

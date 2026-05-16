import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userAPI } from '../../services/api.js';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (!query.trim()) return setUsers([]);
      setLoading(true);
      try {
        const { data } = await userAPI.searchUsers(query);
        setUsers(data.data);
      } catch {}
      finally { setLoading(false); }
    }, 400);
    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Search</h1>

      <div className="relative mb-6">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          className="input-field pl-10"
          placeholder="Search users by name or username..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      {loading && <div className="text-center text-gray-500">Searching...</div>}

      {!loading && query && users.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No users found for "{query}"</p>
        </div>
      )}

      <div className="space-y-3">
        {users.map((user) => (
          <Link key={user._id} to={`/${user.username}`}
            className="card p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
            <img
              src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.username}&background=667eea&color=fff`}
              alt={user.username} className="w-14 h-14 rounded-full object-cover"
            />
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{user.name || user.username}</p>
              <p className="text-sm text-gray-500">@{user.username}</p>
              {user.bio && <p className="text-sm text-gray-600 mt-1 truncate">{user.bio}</p>}
            </div>
            <span className="text-xs text-gray-400">{user.followers?.length || 0} followers</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

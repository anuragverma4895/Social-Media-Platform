import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api.js';
import toast from 'react-hot-toast';
import { TrashIcon } from '@heroicons/react/24/outline';

export default function AdminPostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const fetchPosts = async (p = 1) => {
    try {
      setLoading(true);
      const { data } = await adminAPI.getAllPosts({ page: p, limit: 20 });
      setPosts(data.data);
      setPagination(data.pagination);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPosts(1); }, []);

  const handleDelete = async (postId) => {
    const reason = prompt('Reason for removing this post:') || 'Content policy violation';
    try {
      await adminAPI.deletePost(postId, { reason });
      setPosts(prev => prev.map(p => p._id === postId ? { ...p, isDeleted: true, deletedReason: reason } : p));
      toast.success('Post removed');
    } catch { toast.error('Failed to remove post'); }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Posts Moderation</h1>
        <span className="text-sm text-gray-500">{pagination.total || 0} total posts</span>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Post', 'Author', 'Date', 'Engagement', 'Status', 'Action'].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-500">Loading...</td></tr>
            ) : posts.map((post) => (
              <tr key={post._id} className={`hover:bg-gray-50 transition-colors ${post.isDeleted ? 'opacity-50' : ''}`}>
                <td className="px-4 py-3 max-w-xs">
                  <div className="flex items-center gap-3">
                    {post.image ? (
                      <img src={post.image} alt="post" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xl flex-shrink-0">📝</div>
                    )}
                    <p className="text-sm text-gray-700 truncate">{post.caption || '(Image only)'}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-gray-900">@{post.author?.username}</p>
                  <p className="text-xs text-gray-500">{post.author?.email}</p>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  ❤️ {post.likes?.length || 0} · 💬 {post.comments?.length || 0} · 🔁 {post.shares || 0}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    post.isDeleted ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {post.isDeleted ? 'Removed' : 'Active'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {!post.isDeleted && (
                    <button onClick={() => handleDelete(post._id)}
                      className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: Math.min(pagination.pages, 10) }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => { setPage(p); fetchPosts(p); }}
              className={`w-9 h-9 rounded-lg text-sm font-medium ${p === page ? 'bg-primary-500 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

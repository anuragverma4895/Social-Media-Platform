import { useState, useEffect, useCallback } from 'react';
import { postAPI, userAPI } from '../../services/api.js';
import PostCard from '../../components/posts/PostCard.jsx';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export default function FeedPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [suggestions, setSuggestions] = useState([]);

  const fetchFeed = useCallback(async (pageNum = 1) => {
    try {
      setLoading(true);
      const { data } = await postAPI.getFeed({ page: pageNum, limit: 10 });
      if (pageNum === 1) {
        setPosts(data.data);
      } else {
        setPosts((prev) => [...prev, ...data.data]);
      }
      setHasMore(data.pagination.hasMore);
    } catch (error) {
      console.error('Feed error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed(1);
    userAPI.getSuggestions().then(({ data }) => setSuggestions(data.data?.slice(0, 5) || []));
  }, [fetchFeed]);

  const handleDeletePost = (postId) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchFeed(nextPage);
  };

  return (
    <div className="flex max-w-5xl mx-auto px-4 py-6 gap-6">
      {/* Feed */}
      <div className="flex-1 max-w-2xl">
        {loading && page === 1 ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-4 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full skeleton" />
                  <div className="flex-1"><div className="h-3 skeleton rounded w-1/3 mb-2" /><div className="h-2 skeleton rounded w-1/4" /></div>
                </div>
                <div className="h-64 skeleton rounded-xl" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-6xl mb-4">🌱</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Your feed is empty</h3>
            <p className="text-gray-500 mb-6">Follow some users or create your first post!</p>
            <div className="flex gap-3 justify-center">
              <Link to="/explore" className="btn-primary">Explore Posts</Link>
              <Link to="/create" className="btn-secondary">Create Post</Link>
            </div>
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <PostCard key={post._id} post={post} onDelete={handleDeletePost} />
            ))}
            {hasMore && (
              <div className="text-center py-4">
                <button onClick={loadMore} disabled={loading} className="btn-secondary">
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Sidebar - Suggestions */}
      <div className="hidden lg:block w-72 shrink-0">
        <div className="sticky top-6">
          {/* User info mini card */}
          <Link to={`/${user?.username}`} className="flex items-center gap-3 mb-6 p-4 card hover:shadow-md transition-shadow">
            <img
              src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.username}&background=667eea&color=fff`}
              alt={user?.username} className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold text-gray-900">{user?.name || user?.username}</p>
              <p className="text-sm text-gray-500">@{user?.username}</p>
            </div>
          </Link>

          {suggestions.length > 0 && (
            <div className="card p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Suggested for You</h3>
              <div className="space-y-3">
                {suggestions.map((suggestedUser) => (
                  <Link key={suggestedUser._id} to={`/${suggestedUser.username}`} className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-2 -mx-2 transition-colors">
                    <img
                      src={suggestedUser.profilePicture || `https://ui-avatars.com/api/?name=${suggestedUser.username}&background=667eea&color=fff`}
                      alt={suggestedUser.username} className="w-9 h-9 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{suggestedUser.name || suggestedUser.username}</p>
                      <p className="text-xs text-gray-500 truncate">@{suggestedUser.username}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

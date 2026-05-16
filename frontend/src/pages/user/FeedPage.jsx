import { useState, useEffect, useCallback } from 'react';
import { postAPI, userAPI } from '../../services/api.js';
import PostCard from '../../components/posts/PostCard.jsx';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { SparklesIcon, ChatBubbleLeftRightIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import { chatAPI } from '../../services/chatAPI';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { avatarSrc, useAvatarFallback } from '../../utils/media.js';

export default function FeedPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();

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

  const handleFollow = async (userId) => {
    try {
      await userAPI.followUnfollow(userId);
      setSuggestions(prev => prev.filter(u => u._id !== userId));
      toast.success('Following user');
    } catch (error) {
      toast.error('Failed to follow');
    }
  };

  const handleMessage = async (userId) => {
    try {
      const { data } = await chatAPI.getOrCreateConversation(userId);
      navigate(`/messages/${data.data._id}`);
    } catch (error) {
      toast.error('Failed to start chat');
    }
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
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary-100 to-purple-100 flex items-center justify-center">
              <SparklesIcon className="w-8 h-8 text-primary-500" />
            </div>
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
              src={avatarSrc(user?.profilePicture, user?.username)}
              alt={user?.username} className="w-12 h-12 rounded-full object-cover"
              onError={(event) => useAvatarFallback(event, user?.username)}
            />
            <div>
              <p className="font-semibold text-gray-900">{user?.name || user?.username}</p>
              <p className="text-sm text-gray-500">@{user?.username}</p>
            </div>
          </Link>

          {suggestions.length > 0 && (
            <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-3xl p-6 shadow-xl shadow-gray-200/50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900 tracking-tight">Suggested for You</h3>
                <Link to="/explore" className="text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors uppercase tracking-wider">See all</Link>
              </div>
              <div className="space-y-4">
                {suggestions.map((suggestedUser) => (
                  <div key={suggestedUser._id} className="group relative flex items-center gap-3 p-2 -mx-2 rounded-2xl hover:bg-white hover:shadow-sm transition-all duration-300">
                    <Link to={`/${suggestedUser.username}`} className="relative shrink-0">
                      <img
                        src={avatarSrc(suggestedUser.profilePicture, suggestedUser.username)}
                        alt={suggestedUser.username} 
                        className="w-11 h-11 rounded-2xl object-cover ring-2 ring-gray-50 group-hover:ring-primary-100 transition-all shadow-sm"
                        onError={(event) => useAvatarFallback(event, suggestedUser.username)}
                      />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/${suggestedUser.username}`} className="block">
                        <p className="text-sm font-bold text-gray-900 truncate group-hover:text-primary-600 transition-colors">{suggestedUser.name || suggestedUser.username}</p>
                        <p className="text-[11px] text-gray-400 font-medium truncate">@{suggestedUser.username}</p>
                      </Link>
                    </div>
                    <div className="flex gap-1.5 ml-auto">
                      <button 
                        onClick={() => handleMessage(suggestedUser._id)}
                        className="p-1.5 bg-gray-100 hover:bg-primary-50 text-gray-600 hover:text-primary-600 rounded-xl transition-all"
                        title="Message"
                      >
                        <ChatBubbleLeftRightIcon className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleFollow(suggestedUser._id)}
                        className="p-1.5 bg-gray-900 hover:bg-primary-600 text-white rounded-xl transition-all hover:scale-105 active:scale-95 shadow-sm"
                        title="Follow"
                      >
                        <UserPlusIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

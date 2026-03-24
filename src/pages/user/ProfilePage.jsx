import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { userAPI, postAPI } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import { UserPlusIcon, UserMinusIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import PostCard from '../../components/posts/PostCard.jsx';

export default function ProfilePage() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data } = await userAPI.getProfile(username);
        setProfile(data.data);
        setIsFollowing(data.data.followers?.some(f => f._id === currentUser?._id));
      } catch {
        navigate('/feed');
      } finally {
        setLoading(false);
      }
    };

    const fetchPosts = async () => {
      try {
        setPostsLoading(true);
        const { data } = await userAPI.getUserPosts(username);
        setPosts(data.data);
      } catch {
        toast.error('Failed to load posts');
      } finally {
        setPostsLoading(false);
      }
    };

    fetchProfile();
    fetchPosts();
  }, [username, currentUser?._id, navigate]);

  const handleFollow = async () => {
    if (followLoading) return;
    setFollowLoading(true);
    // Optimistic
    setIsFollowing((prev) => !prev);
    setProfile((prev) => ({
      ...prev,
      followers: isFollowing
        ? prev.followers.filter(f => f._id !== currentUser._id)
        : [...prev.followers, { _id: currentUser._id }],
    }));

    try {
      await userAPI.followUnfollow(profile._id);
    } catch {
      // Revert
      setIsFollowing((prev) => !prev);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleDeletePost = (postId) => {
    setPosts((prev) => prev.filter(p => p._id !== postId));
  };

  const isOwnProfile = currentUser?.username === username;

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 animate-pulse">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 rounded-full skeleton" />
          <div className="flex-1">
            <div className="h-6 skeleton rounded w-40 mb-3" />
            <div className="h-4 skeleton rounded w-24 mb-2" />
            <div className="h-4 skeleton rounded w-64" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="card p-6 mb-6">
        <div className="flex items-start gap-6">
          <img
            src={profile.profilePicture || `https://ui-avatars.com/api/?name=${profile.username}&background=667eea&color=fff&size=200`}
            alt={profile.username}
            className="w-24 h-24 rounded-full object-cover ring-4 ring-primary-100"
          />

          <div className="flex-1">
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{profile.name || profile.username}</h1>
              {isOwnProfile ? (
                <Link to="/settings" className="btn-secondary py-1.5 px-4 text-sm flex items-center gap-1.5">
                  <PencilSquareIcon className="w-4 h-4" /> Edit Profile
                </Link>
              ) : (
                <button
                  onClick={handleFollow}
                  disabled={followLoading}
                  className={`flex items-center gap-1.5 px-5 py-1.5 rounded-xl font-semibold text-sm transition-all ${
                    isFollowing ? 'btn-secondary' : 'btn-primary'
                  }`}
                >
                  {isFollowing ? <UserMinusIcon className="w-4 h-4" /> : <UserPlusIcon className="w-4 h-4" />}
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </button>
              )}
            </div>

            <p className="text-gray-500 mb-3">@{profile.username}</p>
            {profile.bio && <p className="text-gray-700 mb-4">{profile.bio}</p>}

            {/* Stats */}
            <div className="flex gap-6">
              <div className="text-center">
                <p className="font-bold text-gray-900">{profile.postCount || 0}</p>
                <p className="text-sm text-gray-500">Posts</p>
              </div>
              <button onClick={() => setActiveTab('followers')} className="text-center hover:text-primary-600 transition-colors">
                <p className="font-bold text-gray-900">{profile.followers?.length || 0}</p>
                <p className="text-sm text-gray-500">Followers</p>
              </button>
              <button onClick={() => setActiveTab('following')} className="text-center hover:text-primary-600 transition-colors">
                <p className="font-bold text-gray-900">{profile.following?.length || 0}</p>
                <p className="text-sm text-gray-500">Following</p>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {['posts', 'followers', 'following'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-semibold text-sm capitalize transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-primary-500 text-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'posts' && (
        <div>
          {postsLoading ? (
            <div className="text-center py-8 text-gray-500">Loading posts...</div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <div className="text-5xl mb-3">📷</div>
              <p className="font-semibold text-gray-700 mb-1">No posts yet</p>
              {isOwnProfile && <Link to="/create" className="btn-primary mt-4 inline-block">Create your first post</Link>}
            </div>
          ) : (
            posts.map((post) => <PostCard key={post._id} post={post} onDelete={handleDeletePost} />)
          )}
        </div>
      )}

      {activeTab === 'followers' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {profile.followers?.map((follower) => (
            <Link key={follower._id} to={`/${follower.username}`}
              className="card p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
              <img src={follower.profilePicture || `https://ui-avatars.com/api/?name=${follower.username}&background=667eea&color=fff`}
                alt={follower.username} className="w-12 h-12 rounded-full object-cover" />
              <div>
                <p className="font-semibold text-gray-900">{follower.name || follower.username}</p>
                <p className="text-sm text-gray-500">@{follower.username}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {activeTab === 'following' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {profile.following?.map((followed) => (
            <Link key={followed._id} to={`/${followed.username}`}
              className="card p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
              <img src={followed.profilePicture || `https://ui-avatars.com/api/?name=${followed.username}&background=667eea&color=fff`}
                alt={followed.username} className="w-12 h-12 rounded-full object-cover" />
              <div>
                <p className="font-semibold text-gray-900">{followed.name || followed.username}</p>
                <p className="text-sm text-gray-500">@{followed.username}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

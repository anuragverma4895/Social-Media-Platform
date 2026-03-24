import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { postAPI, aiAPI } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { HeartIcon, TrashIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

export default function PostDetailPage() {
  const { postId } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await postAPI.getPost(postId);
        setPost(data.data);
        setLiked(data.data.likes?.some(l => l._id === user?._id));
      } catch {}
      finally { setLoading(false); }
    };
    fetch();
  }, [postId, user?._id]);

  const handleLike = async () => {
    setLiked(prev => !prev);
    try { await postAPI.likeUnlike(postId); }
    catch { setLiked(prev => !prev); }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);

    // Check toxicity before posting
    let isToxic = false;
    try {
      const { data: toxicData } = await aiAPI.detectToxicity({ text: comment });
      isToxic = toxicData.data.isToxic && toxicData.data.confidence > 0.7;
      if (isToxic) {
        toast.error('⚠️ Your comment was flagged as harmful. Please keep it respectful.');
        setSubmitting(false);
        return;
      }
    } catch {}

    try {
      const { data } = await postAPI.addComment(postId, { text: comment, isToxic });
      setPost(prev => ({ ...prev, comments: [...prev.comments, data.data] }));
      setComment('');
      toast.success('Comment added!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await postAPI.deleteComment(postId, commentId);
      setPost(prev => ({ ...prev, comments: prev.comments.filter(c => c._id !== commentId) }));
    } catch { toast.error('Failed to delete comment'); }
  };

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" /></div>;
  if (!post) return <div className="text-center p-12 text-gray-500">Post not found</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="card">
        {/* Author */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-100">
          <Link to={`/${post.author?.username}`}>
            <img src={post.author?.profilePicture || `https://ui-avatars.com/api/?name=${post.author?.username}&background=667eea&color=fff`}
              alt={post.author?.username} className="w-10 h-10 rounded-full object-cover" />
          </Link>
          <div>
            <Link to={`/${post.author?.username}`} className="font-semibold text-gray-900 hover:text-primary-600">
              {post.author?.username}
            </Link>
            <p className="text-xs text-gray-500">{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</p>
          </div>
        </div>

        {/* Image */}
        {post.image && <img src={post.image} alt="Post" className="w-full max-h-[600px] object-cover" />}

        {/* Caption */}
        {post.caption && (
          <div className="p-4 border-b border-gray-100">
            <p className="text-gray-800">{post.caption}</p>
            {post.hashtags?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {post.hashtags.map(tag => (
                  <Link key={tag} to={`/hashtag/${tag}`} className="text-xs text-primary-500 hover:underline">#{tag}</Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Like */}
        <div className="p-4 border-b border-gray-100">
          <button onClick={handleLike} className={`flex items-center gap-2 transition-colors ${liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}>
            {liked ? <HeartIconSolid className="w-6 h-6" /> : <HeartIcon className="w-6 h-6" />}
            <span className="font-medium">{post.likes?.length || 0} likes</span>
          </button>
        </div>

        {/* Comments */}
        <div className="divide-y divide-gray-100">
          {post.comments?.filter(c => !c.isToxic).map(c => (
            <div key={c._id} className="flex items-start gap-3 p-4">
              <img src={c.user?.profilePicture || `https://ui-avatars.com/api/?name=${c.user?.username}&background=667eea&color=fff`}
                alt={c.user?.username} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
              <div className="flex-1">
                <Link to={`/${c.user?.username}`} className="font-semibold text-sm text-gray-900 hover:text-primary-600 mr-2">
                  {c.user?.username}
                </Link>
                <span className="text-sm text-gray-800">{c.text}</span>
                <p className="text-xs text-gray-400 mt-1">{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</p>
              </div>
              {(c.user?._id === user?._id || post.author?._id === user?._id || user?.role === 'admin') && (
                <button onClick={() => handleDeleteComment(c._id)} className="text-gray-300 hover:text-red-500 transition-colors">
                  <TrashIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add Comment */}
        <form onSubmit={handleComment} className="p-4 flex gap-3 border-t border-gray-100">
          <img src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.username}&background=667eea&color=fff`}
            alt={user?.username} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              className="input-field text-sm"
              placeholder="Add a comment... (AI toxicity check enabled)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
            />
            <button type="submit" className="btn-primary text-sm px-4" disabled={submitting || !comment.trim()}>
              {submitting ? '...' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

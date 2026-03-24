import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { postAPI } from '../../services/api.js'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'

export default function PostCard({ post, onDelete }) {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [liked,      setLiked]      = useState(post.likes?.includes(user?._id))
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0)
  const [shares,     setShares]     = useState(post.shares || 0)
  const [loading,    setLoading]    = useState(false)

  const handleLike = async () => {
    if (loading) return
    setLoading(true)
    setLiked(p => !p)
    setLikesCount(p => liked ? p - 1 : p + 1)
    try { await postAPI.likeUnlike(post._id) }
    catch { setLiked(p => !p); setLikesCount(p => liked ? p + 1 : p - 1) }
    finally { setLoading(false) }
  }

  const handleShare = async () => {
    try {
      await postAPI.sharePost(post._id)
      setShares(p => p + 1)
      await navigator.clipboard.writeText(`${window.location.origin}/posts/${post._id}`)
      toast.success('Link copied! 🔗')
    } catch { toast.error('Failed to share') }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return
    try {
      await postAPI.deletePost(post._id)
      toast.success('Post deleted')
      onDelete?.(post._id)
    } catch { toast.error('Failed to delete') }
  }

  const isOwner = user?._id === post.author?._id
  const isAdmin = user?.role === 'admin'
  const avatarUrl = (username) => `https://ui-avatars.com/api/?name=${username}&background=667eea&color=fff`

  return (
    <article className="card mb-4 hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Link to={`/${post.author?.username}`} className="flex items-center gap-3 group">
          <img
            src={post.author?.profilePicture || avatarUrl(post.author?.username)}
            alt={post.author?.username}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100 group-hover:ring-primary-200 transition-all"
          />
          <div>
            <p className="font-semibold text-sm text-gray-900 group-hover:text-primary-600 transition-colors">
              {post.author?.name || post.author?.username}
            </p>
            <p className="text-xs text-gray-400">
              @{post.author?.username} · {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </p>
          </div>
        </Link>
        {(isOwner || isAdmin) && (
          <button onClick={handleDelete} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
            🗑️
          </button>
        )}
      </div>

      {/* Image */}
      {post.image && (
        <Link to={`/posts/${post._id}`}>
          <img src={post.image} alt="Post" className="w-full max-h-[600px] object-cover cursor-pointer" />
        </Link>
      )}

      {/* Actions */}
      <div className="px-4 pt-3 pb-1 flex items-center gap-5">
        <button onClick={handleLike}
          className={`flex items-center gap-1.5 text-sm font-medium transition-all active:scale-90 ${liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}>
          {liked ? '❤️' : '🤍'} {likesCount}
        </button>
        <button onClick={() => navigate(`/posts/${post._id}`)}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-blue-500 transition-colors">
          💬 {post.comments?.filter(c => !c.isToxic).length || 0}
        </button>
        <button onClick={handleShare}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-green-500 transition-colors">
          🔁 {shares}
        </button>
      </div>

      {/* Caption */}
      {post.caption && (
        <div className="px-4 pb-4">
          <p className="text-sm text-gray-800 leading-relaxed">
            <Link to={`/${post.author?.username}`} className="font-semibold mr-1 hover:text-primary-600">
              {post.author?.username}
            </Link>
            {post.caption}
          </p>
          {post.hashtags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {post.hashtags.map((tag) => (
                <Link key={tag} to={`/hashtag/${tag}`} className="text-xs text-primary-500 hover:text-primary-700 font-medium">
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  )
}

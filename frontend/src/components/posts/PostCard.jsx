import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { postAPI } from '../../services/api.js'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'
import { avatarSrc, hideBrokenMedia, mediaUrl, useAvatarFallback } from '../../utils/media.js'
import {
  HeartIcon, ChatBubbleOvalLeftIcon, ArrowPathRoundedSquareIcon, TrashIcon,
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'

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
      toast.success('Link copied!')
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
  const postImage = mediaUrl(post.image)
  const postVideo = mediaUrl(post.video)

  return (
    <article className="card mb-8 animate-slide-up bg-white/80 backdrop-blur-md shadow-lg border-white/50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-transparent via-transparent to-primary-50/30">
        <Link to={`/${post.author?.username}`} className="flex items-center gap-3 group">
          <img
            src={avatarSrc(post.author?.profilePicture, post.author?.username)}
            alt={post.author?.username}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-primary-100 group-hover:ring-primary-400 group-hover:scale-105 transition-all duration-300 shadow-sm"
            onError={(event) => useAvatarFallback(event, post.author?.username)}
          />
          <div>
            <p className="font-bold text-[15px] text-gray-900 group-hover:text-primary-600 transition-colors tracking-tight">
              {post.author?.name || post.author?.username}
            </p>
            <p className="text-[13px] text-gray-500 font-medium">
              @{post.author?.username} <span className="mx-1">•</span> {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </p>
          </div>
        </Link>
        {(isOwner || isAdmin) && (
          <button onClick={handleDelete} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-300 group hover:shadow-inner">
            <TrashIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
        )}
      </div>

      {/* Media */}
      {postVideo ? (
        <div className="px-4 pb-2">
          <video src={postVideo} controls className="w-full max-h-[500px] bg-black rounded-2xl shadow-sm hover-3d" />
        </div>
      ) : postImage ? (
        <div className="px-4 pb-2">
          <Link to={`/posts/${post._id}`}>
            <img src={postImage} alt="Post" className="w-full max-h-[500px] object-cover cursor-pointer rounded-2xl shadow-sm hover-3d" onError={hideBrokenMedia} />
          </Link>
        </div>
      ) : null}

      {/* Actions */}
      <div className="px-4 pt-3 pb-1 flex items-center gap-5">
        <button onClick={handleLike}
          className={`flex items-center gap-1.5 text-sm font-medium transition-all active:scale-90 ${liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}>
          {liked
            ? <HeartIconSolid className="w-5 h-5" />
            : <HeartIcon className="w-5 h-5" />
          }
          {likesCount}
        </button>
        <button onClick={() => navigate(`/posts/${post._id}`)}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-blue-500 transition-colors">
          <ChatBubbleOvalLeftIcon className="w-5 h-5" />
          {post.comments?.filter(c => !c.isToxic).length || 0}
        </button>
        <button onClick={handleShare}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-green-500 transition-colors">
          <ArrowPathRoundedSquareIcon className="w-5 h-5" />
          {shares}
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

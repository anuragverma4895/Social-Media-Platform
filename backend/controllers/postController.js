const Post         = require('../models/Post');
const User         = require('../models/User');
const Notification = require('../models/Notification');
const { asyncHandler }         = require('../middleware/errorMiddleware');
const { deleteFromCloudinary } = require('../config/cloudinary');
const { getUserSocketId }      = require('../utils/socket');

// POST /api/posts
const createPost = asyncHandler(async (req, res) => {
  const { caption, hashtags } = req.body;
  if (!caption && !req.file) return res.status(400).json({ success: false, message: 'Caption or image required' });

  const captionTags = caption ? (caption.match(/#\w+/g) || []).map(h => h.slice(1).toLowerCase()) : [];
  const extraTags   = hashtags ? (typeof hashtags === 'string' ? JSON.parse(hashtags) : hashtags).map(h => h.replace('#','').toLowerCase()) : [];
  const allHashtags = [...new Set([...captionTags, ...extraTags])];

  const post = await Post.create({
    author: req.user._id,
    caption: caption || '',
    image: req.file ? req.file.path : '',
    hashtags: allHashtags,
  });

  const populated = await Post.findById(post._id).populate('author', 'username profilePicture name');
  res.status(201).json({ success: true, message: 'Post created!', data: populated });
});

// GET /api/posts/feed
const getFeed = asyncHandler(async (req, res) => {
  const page  = parseInt(req.query.page)  || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip  = (page - 1) * limit;

  const currentUser = await User.findById(req.user._id);
  const feedIds     = [...currentUser.following, currentUser._id];

  const posts = await Post.find({ author: { $in: feedIds }, isDeleted: false })
    .sort({ createdAt: -1 }).skip(skip).limit(limit)
    .populate('author', 'username profilePicture name')
    .populate('comments.user', 'username profilePicture');

  const total = await Post.countDocuments({ author: { $in: feedIds }, isDeleted: false });
  res.json({ success: true, data: posts, pagination: { page, limit, total, pages: Math.ceil(total / limit), hasMore: skip + posts.length < total } });
});

// GET /api/posts/explore
const explorePosts = asyncHandler(async (req, res) => {
  const page  = parseInt(req.query.page)  || 1;
  const limit = parseInt(req.query.limit) || 12;
  const skip  = (page - 1) * limit;

  const posts = await Post.find({ isDeleted: false })
    .sort({ likes: -1, createdAt: -1 }).skip(skip).limit(limit)
    .populate('author', 'username profilePicture name');
  const total = await Post.countDocuments({ isDeleted: false });

  res.json({ success: true, data: posts, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

// GET /api/posts/:postId
const getPost = asyncHandler(async (req, res) => {
  const post = await Post.findOne({ _id: req.params.postId, isDeleted: false })
    .populate('author', 'username profilePicture name')
    .populate('comments.user', 'username profilePicture name')
    .populate('likes', 'username profilePicture');
  if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
  res.json({ success: true, data: post });
});

// DELETE /api/posts/:postId
const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postId);
  if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
  if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin')
    return res.status(403).json({ success: false, message: 'Not authorized' });
  if (post.image) await deleteFromCloudinary(post.image);
  await Post.findByIdAndDelete(post._id);
  res.json({ success: true, message: 'Post deleted' });
});

// POST /api/posts/:postId/like
const likeUnlike = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postId);
  if (!post || post.isDeleted) return res.status(404).json({ success: false, message: 'Post not found' });

  const userId   = req.user._id;
  const isLiked  = post.likes.includes(userId);

  if (isLiked) {
    post.likes.pull(userId);
    await post.save();
    return res.json({ success: true, isLiked: false, likesCount: post.likes.length });
  } else {
    post.likes.push(userId);
    await post.save();

    if (post.author.toString() !== userId.toString()) {
      const notification = await Notification.create({
        recipient: post.author, sender: userId, type: 'like', post: post._id,
        message: `${req.user.username} liked your post`,
      });
      const io = req.app.get('io');
      const sid = getUserSocketId(post.author.toString());
      if (sid) io.to(sid).emit('new_notification', { ...notification.toObject(), sender: { _id: req.user._id, username: req.user.username, profilePicture: req.user.profilePicture } });
    }
    return res.json({ success: true, isLiked: true, likesCount: post.likes.length });
  }
});

// POST /api/posts/:postId/comments
const addComment = asyncHandler(async (req, res) => {
  const { text, isToxic } = req.body;
  const post = await Post.findById(req.params.postId);
  if (!post || post.isDeleted) return res.status(404).json({ success: false, message: 'Post not found' });

  post.comments.push({ user: req.user._id, text, isToxic: isToxic || false });
  await post.save();
  await post.populate('comments.user', 'username profilePicture name');
  const newComment = post.comments[post.comments.length - 1];

  if (post.author.toString() !== req.user._id.toString() && !isToxic) {
    const notification = await Notification.create({
      recipient: post.author, sender: req.user._id, type: 'comment', post: post._id,
      message: `${req.user.username} commented on your post`,
    });
    const io  = req.app.get('io');
    const sid = getUserSocketId(post.author.toString());
    if (sid) io.to(sid).emit('new_notification', { ...notification.toObject(), sender: { _id: req.user._id, username: req.user.username, profilePicture: req.user.profilePicture } });
  }

  res.status(201).json({ success: true, message: 'Comment added', data: newComment });
});

// DELETE /api/posts/:postId/comments/:commentId
const deleteComment = asyncHandler(async (req, res) => {
  const post    = await Post.findById(req.params.postId);
  if (!post)    return res.status(404).json({ success: false, message: 'Post not found' });
  const comment = post.comments.id(req.params.commentId);
  if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

  const isOwner = comment.user.toString() === req.user._id.toString();
  const isPostAuthor = post.author.toString() === req.user._id.toString();
  if (!isOwner && !isPostAuthor && req.user.role !== 'admin')
    return res.status(403).json({ success: false, message: 'Not authorized' });

  post.comments.pull({ _id: req.params.commentId });
  await post.save();
  res.json({ success: true, message: 'Comment deleted' });
});

// POST /api/posts/:postId/share
const sharePost = asyncHandler(async (req, res) => {
  const post = await Post.findByIdAndUpdate(req.params.postId, { $inc: { shares: 1 } }, { new: true });
  if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

  if (post.author.toString() !== req.user._id.toString()) {
    await Notification.create({ recipient: post.author, sender: req.user._id, type: 'share', post: post._id, message: `${req.user.username} shared your post` });
  }
  res.json({ success: true, message: 'Shared!', shares: post.shares });
});

// GET /api/posts/hashtag/:tag
const getPostsByHashtag = asyncHandler(async (req, res) => {
  const tag   = req.params.tag.toLowerCase().replace('#', '');
  const page  = parseInt(req.query.page)  || 1;
  const limit = parseInt(req.query.limit) || 12;

  const posts = await Post.find({ hashtags: tag, isDeleted: false })
    .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit)
    .populate('author', 'username profilePicture name');
  const total = await Post.countDocuments({ hashtags: tag, isDeleted: false });

  res.json({ success: true, data: posts, pagination: { page, limit, total } });
});

module.exports = { createPost, getFeed, explorePosts, getPost, deletePost, likeUnlike, addComment, deleteComment, sharePost, getPostsByHashtag };

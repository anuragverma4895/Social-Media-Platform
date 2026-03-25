const User         = require('../models/User');
const Post         = require('../models/Post');
const Notification = require('../models/Notification');
const { asyncHandler }         = require('../middleware/errorMiddleware');
const { deleteFromCloudinary } = require('../config/cloudinary');
const { getUserSocketId }      = require('../utils/socket');

// GET /api/users/:username
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findOne({ username: req.params.username })
    .populate('followers', 'username profilePicture name')
    .populate('following', 'username profilePicture name')
    .select('-emailOTP -emailOTPExpiry -passwordResetOTP -passwordResetOTPExpiry');

  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  const postCount = await Post.countDocuments({ author: user._id, isDeleted: false });
  res.json({ success: true, data: { ...user.toObject(), postCount } });
});

// PUT /api/users/profile
const updateProfile = asyncHandler(async (req, res) => {
  const { name, bio, username } = req.body;
  const updates = {};
  if (name !== undefined) updates.name = name;
  if (bio !== undefined)  updates.bio = bio;

  if (username && username !== req.user.username) {
    const exists = await User.findOne({ username });
    if (exists) return res.status(400).json({ success: false, message: 'Username already taken' });
    updates.username = username;
  }
  if (req.file) {
    if (req.user.profilePicture) await deleteFromCloudinary(req.user.profilePicture);
    updates.profilePicture = req.file.path;
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true }).select('-password');
  res.json({ success: true, message: 'Profile updated!', data: user });
});

// POST /api/users/:userId/follow
const followUnfollow = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user._id;
  if (userId === currentUserId.toString()) return res.status(400).json({ success: false, message: "Can't follow yourself" });

  const targetUser  = await User.findById(userId);
  if (!targetUser)  return res.status(404).json({ success: false, message: 'User not found' });

  const currentUser = await User.findById(currentUserId);
  const isFollowing = currentUser.following.includes(userId);

  if (isFollowing) {
    await User.findByIdAndUpdate(currentUserId, { $pull: { following: userId } });
    await User.findByIdAndUpdate(userId, { $pull: { followers: currentUserId } });
    return res.json({ success: true, message: `Unfollowed @${targetUser.username}`, isFollowing: false });
  } else {
    await User.findByIdAndUpdate(currentUserId, { $addToSet: { following: userId } });
    await User.findByIdAndUpdate(userId, { $addToSet: { followers: currentUserId } });

    const notification = await Notification.create({
      recipient: userId, sender: currentUserId, type: 'follow',
      message: `${req.user.username} started following you`,
    });
    const io = req.app.get('io');
    const recipientSocketId = getUserSocketId(userId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('new_notification', {
        ...notification.toObject(),
        sender: { _id: req.user._id, username: req.user.username, profilePicture: req.user.profilePicture },
      });
    }
    return res.json({ success: true, message: `Following @${targetUser.username}`, isFollowing: true });
  }
});

// GET /api/users/:username/posts
const getUserPosts = asyncHandler(async (req, res) => {
  const user = await User.findOne({ username: req.params.username });
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  const page  = parseInt(req.query.page)  || 1;
  const limit = parseInt(req.query.limit) || 12;
  const posts = await Post.find({ author: user._id, isDeleted: false })
    .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit)
    .populate('author', 'username profilePicture name');
  const total = await Post.countDocuments({ author: user._id, isDeleted: false });

  res.json({ success: true, data: posts, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

// GET /api/users/search
const searchUsers = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q?.trim()) return res.json({ success: true, data: [] });

  const users = await User.find({
    $or: [{ username: { $regex: q, $options: 'i' } }, { name: { $regex: q, $options: 'i' } }],
    isActive: true, isBanned: false,
  }).select('username name profilePicture bio followers').limit(20);

  res.json({ success: true, data: users });
});

// GET /api/users/suggestions
const getSuggestedUsers = asyncHandler(async (req, res) => {
  const currentUser = await User.findById(req.user._id);
  const users = await User.find({
    _id: { $nin: [...currentUser.following, currentUser._id] },
    isActive: true, isBanned: false, role: 'user',
  }).select('username name profilePicture bio followers').limit(10);
  res.json({ success: true, data: users });
});

// GET /api/users/:username/followers
const getFollowers = asyncHandler(async (req, res) => {
  const user = await User.findOne({ username: req.params.username }).populate('followers', 'username name profilePicture bio');
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, data: user.followers });
});

// GET /api/users/:username/following
const getFollowing = asyncHandler(async (req, res) => {
  const user = await User.findOne({ username: req.params.username }).populate('following', 'username name profilePicture bio');
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, data: user.following });
});

module.exports = { getUserProfile, updateProfile, followUnfollow, getUserPosts, searchUsers, getSuggestedUsers, getFollowers, getFollowing };

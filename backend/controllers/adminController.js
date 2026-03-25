const User = require('../models/User');
const Post = require('../models/Post');
const { asyncHandler }         = require('../middleware/errorMiddleware');
const { generateToken }        = require('../utils/jwt');
const { deleteFromCloudinary } = require('../config/cloudinary');

// POST /api/admin/login
const adminLogin = asyncHandler(async (req, res) => {
  const { email, password, adminKey } = req.body;
  if (adminKey !== process.env.ADMIN_SECRET_KEY)
    return res.status(401).json({ success: false, message: 'Invalid admin key' });

  const user = await User.findOne({ email, role: 'admin' }).select('+password');
  if (!user || !(await user.comparePassword(password)))
    return res.status(401).json({ success: false, message: 'Invalid credentials' });

  const token = generateToken(user._id, 'admin');
  res.json({ success: true, message: 'Admin login successful', data: { token, user: { _id: user._id, username: user.username, email: user.email, role: user.role } } });
});

// POST /api/admin/create
const createAdmin = asyncHandler(async (req, res) => {
  const { username, email, password, adminKey } = req.body;
  if (adminKey !== process.env.ADMIN_SECRET_KEY)
    return res.status(401).json({ success: false, message: 'Invalid admin key' });

  const existing = await User.findOne({ $or: [{ email }, { username }] });
  if (existing) return res.status(400).json({ success: false, message: 'User already exists' });

  const admin = await User.create({ username, email, password, role: 'admin', isEmailVerified: true, name: username });
  res.status(201).json({ success: true, message: 'Admin created', data: { _id: admin._id, username: admin.username } });
});

// GET /api/admin/dashboard
const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalPosts, bannedUsers, activeUsers, recentUsers, recentPosts] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Post.countDocuments({ isDeleted: false }),
    User.countDocuments({ isBanned: true }),
    User.countDocuments({ isActive: true, isBanned: false, role: 'user' }),
    User.find({ role: 'user' }).sort({ createdAt: -1 }).limit(5).select('username email createdAt profilePicture'),
    Post.find({ isDeleted: false }).sort({ createdAt: -1 }).limit(5).populate('author', 'username'),
  ]);

  // Last 7 days user growth
  const userGrowth = [];
  for (let i = 6; i >= 0; i--) {
    const date     = new Date(); date.setDate(date.getDate() - i); date.setHours(0,0,0,0);
    const nextDate = new Date(date); nextDate.setDate(nextDate.getDate() + 1);
    const count    = await User.countDocuments({ createdAt: { $gte: date, $lt: nextDate }, role: 'user' });
    userGrowth.push({ date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), users: count });
  }

  res.json({ success: true, data: { stats: { totalUsers, totalPosts, bannedUsers, activeUsers }, recentUsers, recentPosts, userGrowth } });
});

// GET /api/admin/users
const getAllUsers = asyncHandler(async (req, res) => {
  const page   = parseInt(req.query.page)  || 1;
  const limit  = parseInt(req.query.limit) || 20;
  const search = req.query.search;
  const query  = { role: 'user' };
  if (search) query.$or = [{ username: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];

  const users = await User.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit)
    .select('-password -emailOTP -passwordResetOTP');
  const total = await User.countDocuments(query);
  res.json({ success: true, data: users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

// PUT /api/admin/users/:userId/ban
const banUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user)              return res.status(404).json({ success: false, message: 'User not found' });
  if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot ban admin' });

  user.isBanned  = !user.isBanned;
  user.banReason = user.isBanned ? (req.body.reason || 'Policy violation') : '';
  await user.save();
  res.json({ success: true, message: `User ${user.isBanned ? 'banned' : 'unbanned'}`, data: { isBanned: user.isBanned } });
});

// DELETE /api/admin/users/:userId
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user)              return res.status(404).json({ success: false, message: 'User not found' });
  if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot delete admin' });

  const posts = await Post.find({ author: user._id });
  for (const post of posts) { 
    if (post.image) await deleteFromCloudinary(post.image); 
    if (post.video) await deleteFromCloudinary(post.video);
  }
  await Post.deleteMany({ author: user._id });
  if (user.profilePicture) await deleteFromCloudinary(user.profilePicture);
  await User.updateMany({ followers: user._id }, { $pull: { followers: user._id } });
  await User.updateMany({ following: user._id }, { $pull: { following: user._id } });
  await User.findByIdAndDelete(user._id);
  res.json({ success: true, message: 'User deleted permanently' });
});

// GET /api/admin/posts
const getAllPosts = asyncHandler(async (req, res) => {
  const page  = parseInt(req.query.page)  || 1;
  const limit = parseInt(req.query.limit) || 20;
  const posts = await Post.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit)
    .populate('author', 'username email profilePicture');
  const total = await Post.countDocuments();
  res.json({ success: true, data: posts, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

// DELETE /api/admin/posts/:postId
const adminDeletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postId);
  if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
  if (post.image) await deleteFromCloudinary(post.image);
  if (post.video) await deleteFromCloudinary(post.video);
  post.isDeleted     = true;
  post.deletedReason = req.body.reason || 'Content policy violation';
  await post.save();
  res.json({ success: true, message: 'Post removed from platform' });
});

module.exports = { adminLogin, createAdmin, getDashboardStats, getAllUsers, banUser, deleteUser, getAllPosts, adminDeletePost };

const express = require('express');
const router  = express.Router();
const { adminLogin, createAdmin, getDashboardStats, getAllUsers, banUser, deleteUser, getAllPosts, adminDeletePost } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public (but require adminKey in body)
router.post('/login',  adminLogin);
router.post('/create', createAdmin);

// Protected - admin only
router.use(protect);
router.use(authorize('admin'));
router.get('/dashboard',           getDashboardStats);
router.get('/users',               getAllUsers);
router.put('/users/:userId/ban',   banUser);
router.delete('/users/:userId',    deleteUser);
router.get('/posts',               getAllPosts);
router.delete('/posts/:postId',    adminDeletePost);

module.exports = router;

const express = require('express');
const router  = express.Router();
const { getUserProfile, updateProfile, followUnfollow, getUserPosts, searchUsers, getSuggestedUsers, getFollowers, getFollowing } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { uploadProfileImage } = require('../config/cloudinary');
const { profileValidation, validate } = require('../middleware/validationMiddleware');

router.get('/search',                protect, searchUsers);
router.get('/suggestions',           protect, getSuggestedUsers);
router.put('/profile',               protect, uploadProfileImage.single('profilePicture'), profileValidation, validate, updateProfile);
router.get('/:username',             getUserProfile);
router.get('/:username/posts',       getUserPosts);
router.get('/:username/followers',   getFollowers);
router.get('/:username/following',   getFollowing);
router.post('/:userId/follow',       protect, followUnfollow);

module.exports = router;

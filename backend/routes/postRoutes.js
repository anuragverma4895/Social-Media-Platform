const express = require('express');
const router  = express.Router();
const { createPost, getFeed, explorePosts, getPost, deletePost, likeUnlike, addComment, deleteComment, sharePost, getPostsByHashtag } = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');
const { uploadPostImage } = require('../config/cloudinary');
const { postValidation, commentValidation, validate } = require('../middleware/validationMiddleware');

router.get('/feed',                              protect, getFeed);
router.get('/explore',                           protect, explorePosts);
router.get('/hashtag/:tag',                      getPostsByHashtag);
router.post('/',                                 protect, uploadPostImage.single('image'), postValidation, validate, createPost);
router.get('/:postId',                           getPost);
router.delete('/:postId',                        protect, deletePost);
router.post('/:postId/like',                     protect, likeUnlike);
router.post('/:postId/share',                    protect, sharePost);
router.post('/:postId/comments',                 protect, commentValidation, validate, addComment);
router.delete('/:postId/comments/:commentId',    protect, deleteComment);

module.exports = router;

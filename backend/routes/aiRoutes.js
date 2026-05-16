const express = require('express');
const {
  detectToxicity,
  generateHashtags,
  suggestCaption,
  passthroughChat,
} = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/detect-toxicity', detectToxicity);
router.post('/generate-hashtags', generateHashtags);
router.post('/suggest-caption', suggestCaption);
router.post('/image-caption', suggestCaption);
router.post('/improve-content', suggestCaption);
router.post('/chat', passthroughChat);

module.exports = router;

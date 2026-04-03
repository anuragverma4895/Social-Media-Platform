const express = require('express');
const router = express.Router();
const { uploadChatMedia } = require('../config/cloudinary');

router.use(protect);

router.post('/send', uploadChatMedia.single('media'), chatController.sendMessage);
router.get('/conversations', chatController.getConversations);
router.get('/messages/:conversationId', chatController.getMessages);
router.get('/getOrCreate/:userId', chatController.getOrCreateConversation);

module.exports = router;

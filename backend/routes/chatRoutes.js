const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/send', chatController.sendMessage);
router.get('/conversations', chatController.getConversations);
router.get('/messages/:conversationId', chatController.getMessages);
router.get('/getOrCreate/:userId', chatController.getOrCreateConversation);

module.exports = router;

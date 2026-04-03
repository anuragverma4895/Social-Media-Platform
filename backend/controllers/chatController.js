const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

exports.sendMessage = async (req, res) => {
  try {
    const { recipientId, content } = req.body;
    const senderId = req.user._id;

    if (!recipientId || !content) {
      return res.status(400).json({ success: false, message: 'Recipient and content are required' });
    }

    // Find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, recipientId] }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, recipientId]
      });
    }

    // Create message
    const message = await Message.create({
      conversationId: conversation._id,
      sender: senderId,
      content
    });

    // Update last message in conversation
    conversation.lastMessage = message._id;
    await conversation.save();

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id
    })
      .populate('participants', 'username name profilePicture')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, data: conversations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 });

    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOrCreateConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    if (userId === currentUserId.toString()) {
      return res.status(400).json({ success: false, message: "Cannot chat with yourself" });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, userId] }
    }).populate('participants', 'username name profilePicture');

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [currentUserId, userId]
      });
      conversation = await conversation.populate('participants', 'username name profilePicture');
    }

    res.status(200).json({ success: true, data: conversation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

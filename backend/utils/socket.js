const User = require('../models/User');

const onlineUsers = new Map(); // userId -> socketId

const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Connected: ${socket.id}`);

    socket.on('user_online', async (userId) => {
      onlineUsers.set(userId, socket.id);
      await User.findByIdAndUpdate(userId, { socketId: socket.id });
      
      // Send initial list of online users to the newly connected user
      socket.emit('initial_online_users', Array.from(onlineUsers.keys()));
      
      // Notify others
      io.emit('user_status_change', { userId, status: 'online' });
    });

    socket.on('join_chat', (conversationId) => {
      socket.join(conversationId);
      console.log(`👤 User joined room: ${conversationId}`);
    });

    socket.on('send_message', (data) => {
      // data: { conversationId, senderId, content, recipientId }
      io.to(data.conversationId).emit('receive_message', data);
      
      // Also notify recipient if they are not in the room but are online
      const recipientSocketId = onlineUsers.get(data.recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('new_chat_notification', data);
      }
    });

    socket.on('disconnect', async () => {
      let disconnectedId;
      for (const [userId, sid] of onlineUsers.entries()) {
        if (sid === socket.id) { disconnectedId = userId; onlineUsers.delete(userId); break; }
      }
      if (disconnectedId) {
        await User.findByIdAndUpdate(disconnectedId, { socketId: '' });
        io.emit('user_status_change', { userId: disconnectedId, status: 'offline' });
      }
      console.log(`🔌 Disconnected: ${socket.id}`);
    });
  });
};

const getUserSocketId = (userId) => onlineUsers.get(userId);

module.exports = { setupSocket, getUserSocketId, onlineUsers };

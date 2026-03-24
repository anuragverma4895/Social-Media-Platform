const User = require('../models/User');

const onlineUsers = new Map(); // userId -> socketId

const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Connected: ${socket.id}`);

    socket.on('user_online', async (userId) => {
      onlineUsers.set(userId, socket.id);
      await User.findByIdAndUpdate(userId, { socketId: socket.id });
      io.emit('user_status_change', { userId, status: 'online' });
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

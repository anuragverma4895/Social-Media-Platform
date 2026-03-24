const Notification = require('../models/Notification');
const { asyncHandler } = require('../middleware/errorMiddleware');

// GET /api/notifications
const getNotifications = asyncHandler(async (req, res) => {
  const page  = parseInt(req.query.page)  || 1;
  const limit = parseInt(req.query.limit) || 20;

  const notifications = await Notification.find({ recipient: req.user._id })
    .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit)
    .populate('sender', 'username profilePicture name')
    .populate('post', 'caption image');

  const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });
  const total       = await Notification.countDocuments({ recipient: req.user._id });

  res.json({ success: true, data: notifications, unreadCount, pagination: { page, limit, total } });
});

// PUT /api/notifications/mark-read
const markAsRead = asyncHandler(async (req, res) => {
  const { notificationIds } = req.body;
  if (notificationIds?.length > 0) {
    await Notification.updateMany({ _id: { $in: notificationIds }, recipient: req.user._id }, { isRead: true });
  } else {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
  }
  res.json({ success: true, message: 'Marked as read' });
});

// DELETE /api/notifications/:id
const deleteNotification = asyncHandler(async (req, res) => {
  const notif = await Notification.findOne({ _id: req.params.notificationId, recipient: req.user._id });
  if (!notif) return res.status(404).json({ success: false, message: 'Not found' });
  await notif.deleteOne();
  res.json({ success: true, message: 'Deleted' });
});

module.exports = { getNotifications, markAsRead, deleteNotification };

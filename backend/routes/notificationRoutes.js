const express = require('express');
const router  = express.Router();
const { getNotifications, markAsRead, deleteNotification } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.get('/',                       protect, getNotifications);
router.put('/mark-read',              protect, markAsRead);
router.delete('/:notificationId',     protect, deleteNotification);

module.exports = router;

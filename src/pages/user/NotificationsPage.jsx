import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { notificationAPI } from '../../services/api.js';
import { useSocket } from '../../context/SocketContext.jsx';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const typeEmoji = { like: '❤️', comment: '💬', follow: '👤', share: '🔁' };

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { notifications: socketNotifs, clearNotifications } = useSocket();

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await notificationAPI.getNotifications();
        setNotifications(data.data);
        // Mark all as read
        await notificationAPI.markAsRead({});
        clearNotifications();
      } catch {}
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleDelete = async (id) => {
    try {
      await notificationAPI.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Notifications</h1>

      {loading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🔔</div>
          <p className="text-gray-500">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => (
            <div key={notif._id} className={`card p-4 flex items-center gap-4 ${!notif.isRead ? 'bg-primary-50 border-primary-100' : ''}`}>
              <img
                src={notif.sender?.profilePicture || `https://ui-avatars.com/api/?name=${notif.sender?.username}&background=667eea&color=fff`}
                alt={notif.sender?.username} className="w-12 h-12 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800">
                  <span className="mr-1">{typeEmoji[notif.type]}</span>
                  <Link to={`/${notif.sender?.username}`} className="font-semibold hover:text-primary-600">
                    {notif.sender?.username}
                  </Link>{' '}
                  {notif.message?.replace(notif.sender?.username + ' ', '')}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                </p>
              </div>
              <button onClick={() => handleDelete(notif._id)}
                className="text-gray-300 hover:text-gray-500 text-xs shrink-0">✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

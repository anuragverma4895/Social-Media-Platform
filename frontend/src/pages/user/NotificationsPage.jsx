import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { notificationAPI } from '../../services/api.js';
import { useSocket } from '../../context/SocketContext.jsx';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import {
  HeartIcon, ChatBubbleOvalLeftIcon, UserIcon, ArrowPathRoundedSquareIcon, BellIcon,
} from '@heroicons/react/24/outline';

const typeIcons = {
  like: HeartIcon,
  comment: ChatBubbleOvalLeftIcon,
  follow: UserIcon,
  share: ArrowPathRoundedSquareIcon,
};

const typeColors = {
  like: 'text-red-500 bg-red-50',
  comment: 'text-blue-500 bg-blue-50',
  follow: 'text-purple-500 bg-purple-50',
  share: 'text-green-500 bg-green-50',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { notifications: socketNotifs, clearNotifications } = useSocket();
  const navigate = useNavigate();

  const handleNotificationClick = (notif) => {
    if (notif.type === 'follow') {
      if (notif.sender?.username) navigate(`/${notif.sender.username}`);
    } else if (['like', 'comment', 'share'].includes(notif.type) && notif.post) {
      navigate(`/posts/${notif.post}`);
    }
  };

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

  const handleDelete = async (e, id) => {
    e.stopPropagation();
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
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary-100 to-purple-100 flex items-center justify-center">
            <BellIcon className="w-8 h-8 text-primary-500" />
          </div>
          <p className="text-gray-500">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => {
            const Icon = typeIcons[notif.type] || BellIcon;
            const colors = typeColors[notif.type] || 'text-gray-500 bg-gray-50';
            return (
              <div 
                key={notif._id} 
                onClick={() => handleNotificationClick(notif)}
                className={`card p-4 flex items-center gap-4 transition-all duration-200 hover:shadow-sm cursor-pointer ${!notif.isRead ? 'bg-primary-50/50 border-primary-100' : ''}`}
              >
                <img
                  src={notif.sender?.profilePicture || `https://ui-avatars.com/api/?name=${notif.sender?.username}&background=667eea&color=fff`}
                  alt={notif.sender?.username} className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 flex items-center gap-1.5">
                    <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full ${colors}`}>
                      <Icon className="w-3 h-3" />
                    </span>
                    <Link 
                      to={`/${notif.sender?.username}`} 
                      onClick={(e) => e.stopPropagation()}
                      className="font-semibold hover:text-primary-600"
                    >
                      {notif.sender?.username}
                    </Link>{' '}
                    {notif.message?.replace(notif.sender?.username + ' ', '')}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                  </p>
                </div>
                <button onClick={(e) => handleDelete(e, notif._id)}
                  className="text-gray-300 hover:text-gray-500 text-xs shrink-0 hover:bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center transition-colors">✕</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
